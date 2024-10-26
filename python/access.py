from sentence_transformers import SentenceTransformer, util
import imaplib
import email
from email.header import decode_header
import re
from flask import Flask, request, jsonify
from textblob import TextBlob
import numpy as np
import torch
import spacy
from flask_cors import CORS
from datetime import datetime, timedelta
from dataclasses import dataclass
from typing import List, Optional, Tuple, Set
import os
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import Flow
import json
import pickle
from dateutil.parser import parse
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Constants
SCOPES = ['https://www.googleapis.com/auth/calendar.events']
MODEL_NAME = 'all-MiniLM-L6-v2'
app = Flask(__name__)

@dataclass
class Task:
    subject: str
    body: str
    priority_score: float
    deadline: Optional[datetime]
    sender: str
    critical_matches: Set[str]

class EmailParser:
    @staticmethod
    def decode_email_header(header: str) -> str:
        """Decode email header with proper encoding"""
        if not header:
            return ""
        
        decoded_parts = []
        for part, encoding in decode_header(header):
            if isinstance(part, bytes):
                try:
                    decoded_parts.append(part.decode(encoding or 'utf-8', errors='replace'))
                except Exception as e:
                    logging.warning(f"Error decoding header part: {e}")
                    decoded_parts.append(part.decode('utf-8', errors='replace'))
            else:
                decoded_parts.append(str(part))
        return " ".join(decoded_parts)

    @staticmethod
    def extract_email_body(email_message: email.message.Message) -> str:
        """Extract email body with proper handling of multipart messages"""
        body = ""
        if email_message.is_multipart():
            for part in email_message.walk():
                if part.get_content_type() == "text/plain":
                    try:
                        payload = part.get_payload(decode=True)
                        if payload:
                            body += payload.decode(errors='replace')
                    except Exception as e:
                        logging.warning(f"Error extracting multipart body: {e}")
        else:
            try:
                payload = email_message.get_payload(decode=True)
                if payload:
                    body = payload.decode(errors='replace')
            except Exception as e:
                logging.warning(f"Error extracting simple body: {e}")
        return body

class DateExtractor:
    def __init__(self):
        self.nlp = spacy.load("en_core_web_sm")

    def extract_dates(self, text: str) -> List[datetime]:
        """Extract dates from text using multiple approaches"""
        dates = set()
        
        # Use spaCy for initial date extraction
        doc = self.nlp(text)
        for ent in doc.ents:
            if ent.label_ in ['DATE', 'TIME']:
                try:
                    parsed_date = parse(ent.text, fuzzy=True)
                    dates.add(parsed_date)
                except:
                    continue
        
        # Regular expression patterns for common date formats
        date_patterns = [
            r'\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b',
            r'\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b',
            r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2}(?:st|nd|rd|th)?,? \d{4}\b',
            r'\bnext (?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b',
            r'\btomorrow\b',
            r'\btoday\b'
        ]
        
        for pattern in date_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                try:
                    parsed_date = parse(match.group(), fuzzy=True)
                    dates.add(parsed_date)
                except:
                    continue
        
        return sorted(list(dates))

class EmailPriorityAnalyzer:
    def __init__(self):
        self.model = SentenceTransformer(MODEL_NAME)
        self._initialize_embeddings()
        
    def _initialize_embeddings(self):
        """Initialize priority templates and their embeddings"""
        self.priority_templates = {
            'critical': [
                "server down", "server crash", "system crash", "outage", "downtime",
                "service unavailable", "critical error", "system failure",
                "data loss", "data corruption", "database corruption", "data breach",
                "severe performance", "extreme latency", "system overload",
                "urgent customer", "production blocked", "revenue impact"
            ],
            'high': [
                "high priority", "urgent", "important", "asap", "time sensitive",
                "needs immediate", "critical bug", "performance issue", "customer impact"
            ],
            'medium': [
                "please review", "update needed", "follow up", "needs attention",
                "check this", "minor issue", "small bug", "low impact"
            ]
        }
        
        self.embeddings = {
            priority: self.model.encode(templates, convert_to_tensor=True)
            for priority, templates in self.priority_templates.items()
        }

    def _check_critical_patterns(self, text: str) -> Tuple[float, Set[str]]:
        """Check for critical patterns with weights"""
        critical_patterns = {
            r'\b(server|system)\s*(crash|down|failure)\b': 4.0,
            r'\b(emergency|critical)\s*(incident|issue|problem)\b': 3.5,
            r'\bproduction\s*(down|issue|problem|blocked)\b': 3.5,
            r'\b(service|site)\s*(down|unavailable)\b': 3.5,
            r'\bdata\s*(loss|corruption|breach)\b': 3.0,
            r'\bdatabase\s*(crash|down|corrupt)\b': 3.0,
            r'\boutage\b': 3.0,
            r'\bcritical\s*error\b': 2.5,
            r'\bsevere\s*performance\b': 2.5,
            r'\bimmediate\s*attention\b': 2.0,
            r'\burgent\s*customer\b': 2.0,
        }
        
        score = 0
        matches_found = set()
        
        for pattern, weight in critical_patterns.items():
            if re.search(pattern, text, re.IGNORECASE):
                score += weight
                matches_found.add(pattern)
        
        return score, matches_found

    def calculate_priority_score(self, subject: str, body: str) -> Tuple[float, Set[str]]:
        """Calculate priority score with multiple factors"""
        combined_text = f"{subject} {body}".lower()
        text_embedding = self.model.encode(combined_text, convert_to_tensor=True)
        
        # Check critical patterns
        critical_score, critical_matches = self._check_critical_patterns(combined_text)
        
        # Calculate semantic similarities
        similarities = {
            priority: util.cos_sim(text_embedding, embeddings).max().item()
            for priority, embeddings in self.embeddings.items()
        }
        
        # Calculate weighted semantic score
        semantic_score = (
            similarities['critical'] * 4.0 +
            similarities['high'] * 2.5 +
            similarities['medium'] * 1.0
        ) / 7.5 * 10
        
        # Check urgency indicators
        urgency_indicators = {
            r'\basap\b': 1.0,
            r'\bimmediately\b': 1.0,
            r'\burgent\b': 1.0,
            r'\bcritical\b': 1.0,
            r'\bemergency\b': 1.0,
        }
        
        urgency_score = sum(
            weight for pattern, weight in urgency_indicators.items()
            if re.search(pattern, combined_text, re.IGNORECASE)
        )
        
        # Calculate final score
        base_score = max(
            critical_score * 1.5,
            semantic_score * 1.2,
            urgency_score * 2.0
        )
        
        # Apply subject line boost
        if any(term in subject.lower() for term in ['urgent', 'critical', 'emergency', 'immediate']):
            base_score += 1.5
        
        final_score = max(min(base_score, 10), 1)
        return round(final_score, 1), critical_matches

    def process_tasks(self, tasks: List[Task]) -> List[Task]:
        """Sort tasks based on priority and deadline"""
        def task_sort_key(task):
            # Calculate deadline score
            if task.deadline:
                time_until_deadline = task.deadline - datetime.now()
                days_until_deadline = time_until_deadline.total_seconds() / (24 * 3600)
                urgency_score = 1 / (1 + max(0, days_until_deadline))
            else:
                urgency_score = 0
            
            # Combine priority and urgency
            combined_score = (task.priority_score * 0.7) + (urgency_score * 0.3)
            deadline_timestamp = task.deadline.timestamp() if task.deadline else float('inf')
            
            return (-combined_score, deadline_timestamp)
        
        return sorted(tasks, key=task_sort_key)

class EmailProcessor:
    def __init__(self, email_config: dict):
        self.config = email_config
        self.analyzer = EmailPriorityAnalyzer()
        # self.calendar = CalendarManager()
        self.date_extractor = DateExtractor()
        self.email_parser = EmailParser()

    def process_emails(self, sender_list: List[str]):
        """Main processing function"""
        tasks = []
        
        try:
            with imaplib.IMAP4_SSL(self.config['server']) as mail:
                mail.login(self.config['username'], self.config['password'])
                mail.select("inbox")
                
                for sender in sender_list:
                    logging.info(f"Processing emails from: {sender}")
                    status, messages = mail.search(None, f'FROM "{sender}"')
                    
                    if status != "OK":
                        logging.warning(f"Failed to search for sender: {sender}")
                        continue
                    
                    email_ids = messages[0].split()[-5:]  # Last 5 emails
                    
                    for email_id in email_ids:
                        try:
                            status, msg_data = mail.fetch(email_id, "(RFC822)")
                            if status != "OK":
                                continue
                            
                            email_content = email.message_from_bytes(msg_data[0][1])
                            subject = self.email_parser.decode_email_header(email_content["Subject"])
                            body = self.email_parser.extract_email_body(email_content)
                            
                            # Extract dates and calculate priority
                            dates = self.date_extractor.extract_dates(f"{subject}\n{body}")
                            priority_score, critical_matches = self.analyzer.calculate_priority_score(
                                subject, body
                            )
                            
                            task = Task(
                                subject=subject,
                                body=body,
                                priority_score=priority_score,
                                deadline=min(dates) if dates else None,
                                sender=sender,
                                critical_matches=critical_matches
                            )
                            tasks.append(task)
                            
                        except Exception as e:
                            logging.error(f"Error processing email {email_id}: {e}")
                            continue
        
        except Exception as e:
            logging.error(f"Error connecting to email server: {e}")
            return
        
        # Process and schedule tasks
        sorted_tasks = self.analyzer.process_tasks(tasks)
        self._schedule_tasks(sorted_tasks)

    def _schedule_tasks(self, tasks: List[Task]):
        """Schedule tasks based on priority"""
        for task in tasks:
            print("\nTask Details:")
            print(f"Subject: {task.subject}")
            print(f"From: {task.sender}")
            print(f"Priority Score: {task.priority_score}/10")
            print(f"Deadline: {task.deadline if task.deadline else 'No deadline'}")
            
            # Determine scheduling time
            if task.priority_score >= 8:
                print("🔴 CRITICAL PRIORITY - Scheduling immediately")
                start_time = datetime.now() + timedelta(hours=1)
            elif task.priority_score >= 6:
                print("🟡 HIGH PRIORITY - Scheduling within 24 hours")
                start_time = datetime.now() + timedelta(hours=4)
            else:
                print("🟢 MEDIUM/LOW PRIORITY - Scheduling based on deadline")
                start_time = task.deadline if task.deadline else datetime.now() + timedelta(days=1)
            
            # Create calendar event
            # result = self.calendar.create_event(
            #     task.subject,
            #     f"Priority: {task.priority_score}/10\n\nEmail body:\n{task.body[:500]}...",
            #     start_time
            # )
            # print(f"Calendar event: {result}")
            # print("=" * 50)

    def generate_summary_report(self, tasks: List[Task]) -> str:
        """Generate a summary report of processed tasks"""
        critical_count = sum(1 for task in tasks if task.priority_score >= 8)
        high_count = sum(1 for task in tasks if 6 <= task.priority_score < 8)
        medium_low_count = sum(1 for task in tasks if task.priority_score < 6)
        
        report = [
            "Email Processing Summary Report",
            "=" * 30,
            f"Total tasks processed: {len(tasks)}",
            f"Critical priority tasks: {critical_count}",
            f"High priority tasks: {high_count}",
            f"Medium/Low priority tasks: {medium_low_count}",
            "\nUpcoming Deadlines:",
        ]
        
        # Add deadline information
        tasks_with_deadlines = [t for t in tasks if t.deadline]
        if tasks_with_deadlines:
            for task in sorted(tasks_with_deadlines, key=lambda x: x.deadline):
                report.append(f"- {task.deadline.strftime('%Y-%m-%d %H:%M')}: {task.subject}")
        else:
            report.append("No immediate deadlines found")
        
        return "\n".join(report)

def main():
    """Main execution function"""
    # Email configuration
    email_config = {
        'server': 'imap.gmail.com',
        'username': 'ngenx2831@gmail.com',  # Replace with your email
        'password': 'iwakxdrxopazhwtl',     # Replace with your app password
        'port': 993
    }
    
    # List of senders to monitor
    sender_list = [
        "sahilgehani47@gmail.com",
        "gurnanisahil87@gmail.com",
        "advanirohan03@gmail.com"
        # Add more senders as needed
    ]
    
    try:
        # Initialize processor
        processor = EmailProcessor(email_config)
        
        # Process emails and generate tasks
        print("Starting email processing...")
        processor.process_emails(sender_list)
        
    except Exception as e:
        logging.error(f"Error in main execution: {e}")
        print("An error occurred during execution. Check the logs for details.")


CORS(app)
app.secret_key = 'your-secret-key-here'  # Change this in production

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if api_key and api_key == os.getenv('API_KEY', 'your-api-key-here'):
            return f(*args, **kwargs)
        return jsonify({'error': 'Invalid or missing API key'}), 401
    return decorated_function

class CalendarManager:
    def __init__(self):
        self.service = None
        self.SCOPES = ['https://www.googleapis.com/auth/calendar.events']

    def initialize_service(self):
        """Initialize Google Calendar service"""
        creds = None
        if os.path.exists('token.pickle'):
            with open('token.pickle', 'rb') as token:
                creds = pickle.load(token)

        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                return False

        self.service = build('calendar', 'v3', credentials=creds)
        return True

    def create_event(self, task: Task) -> dict:
        """Create calendar event from task"""
        if not self.service:
            return {"error": "Calendar service not initialized"}

        start_time = datetime.now()
        if task.priority_score >= 8:
            start_time += timedelta(hours=1)
        elif task.priority_score >= 6:
            start_time += timedelta(hours=4)
        else:
            start_time = task.deadline if task.deadline else start_time + timedelta(days=1)

        end_time = start_time + timedelta(hours=1)

        event = {
            'summary': f"[Priority: {task.priority_score}] {task.subject}",
            'description': f"""
Priority Score: {task.priority_score}/10
Sender: {task.sender}
Critical Matches: {', '.join(task.critical_matches) if task.critical_matches else 'None'}

Email Body:
{task.body[:500]}...""",
            'start': {
                'dateTime': start_time.isoformat(),
                'timeZone': 'UTC',
            },
            'end': {
                'dateTime': end_time.isoformat(),
                'timeZone': 'UTC',
            },
        }

        try:
            event = self.service.events().insert(calendarId='primary', body=event).execute()
            return {"success": True, "event_link": event.get('htmlLink')}
        except Exception as e:
            logging.error(f"Failed to create calendar event: {e}")
            return {"error": str(e)}

# Initialize global components
email_processor = None
calendar_manager = CalendarManager()

@app.route('/api/initialize', methods=['POST'])
@require_api_key
def initialize_processor():
    """Initialize the email processor with configuration"""
    try:
        data = request.get_json()
        email_config = {
            'server': data.get('server', 'imap.gmail.com'),
            'username': data.get('username'),
            'password': data.get('password'),
            'port': data.get('port', 993)
        }
        
        global email_processor
        email_processor = EmailProcessor(email_config)
        
        return jsonify({'status': 'success', 'message': 'Email processor initialized'})
    except Exception as e:
        logging.error(f"Initialization error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/process-emails', methods=['POST'])
@require_api_key
def process_emails():
    """Process emails and create tasks"""
    if not email_processor:
        return jsonify({'status': 'error', 'message': 'Email processor not initialized'}), 400
    
    try:
        data = request.get_json()
        sender_list = data.get('senders', [])
        
        if not sender_list:
            return jsonify({'status': 'error', 'message': 'No senders provided'}), 400

        # Process emails and get tasks
        tasks = []
        
        with imaplib.IMAP4_SSL(email_processor.config['server']) as mail:
            mail.login(email_processor.config['username'], email_processor.config['password'])
            mail.select("inbox")
            
            for sender in sender_list:
                logging.info(f"Processing emails from: {sender}")
                status, messages = mail.search(None, f'FROM "{sender}"')
                
                if status != "OK":
                    continue
                
                email_ids = messages[0].split()[-5:]  # Last 5 emails
                
                for email_id in email_ids:
                    status, msg_data = mail.fetch(email_id, "(RFC822)")
                    if status != "OK":
                        continue
                    
                    email_content = email.message_from_bytes(msg_data[0][1])
                    subject = email_processor.email_parser.decode_email_header(email_content["Subject"])
                    body = email_processor.email_parser.extract_email_body(email_content)
                    
                    # Extract dates and calculate priority
                    dates = email_processor.date_extractor.extract_dates(f"{subject}\n{body}")
                    priority_score, critical_matches = email_processor.analyzer.calculate_priority_score(
                        subject, body
                    )
                    
                    task = Task(
                        subject=subject,
                        body=body,
                        priority_score=priority_score,
                        deadline=min(dates) if dates else None,
                        sender=sender,
                        critical_matches=critical_matches
                    )
                    tasks.append(task)

        # Sort tasks by priority
        sorted_tasks = email_processor.analyzer.process_tasks(tasks)
        
        # Create calendar events for tasks if calendar is initialized
        calendar_events = []
        if calendar_manager.initialize_service():
            for task in sorted_tasks:
                event_result = calendar_manager.create_event(task)
                calendar_events.append({
                    'task_subject': task.subject,
                    'calendar_result': event_result
                })

        # Generate response data
        response_data = {
            'status': 'success',
            'tasks': [{
                'subject': task.subject,
                'sender': task.sender,
                'priority_score': task.priority_score,
                'deadline': task.deadline.isoformat() if task.deadline else None,
                'critical_matches': list(task.critical_matches)
            } for task in sorted_tasks],
            'calendar_events': calendar_events if calendar_events else None,
            'summary': email_processor.generate_summary_report(sorted_tasks)
        }

        return jsonify(response_data)

    except Exception as e:
        logging.error(f"Error processing emails: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/calendar/auth', methods=['GET'])
@require_api_key
def get_auth_url():
    """Get Google Calendar authorization URL"""
    try:
        # Load client configuration
        client_config = json.load(open('client_secret.json'))
        
        flow = Flow.from_client_config(
            client_config,
            scopes=calendar_manager.SCOPES,
            redirect_uri="http://localhost:5000/api/calendar/oauth2callback"
        )
        
        auth_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true'
        )
        
        # Store the flow for callback
        with open('flow.pickle', 'wb') as f:
            pickle.dump(flow, f)
        
        return jsonify({
            'status': 'success',
            'auth_url': auth_url
        })
    except Exception as e:
        logging.error(f"Auth URL generation error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/calendar/oauth2callback')
def oauth2callback():
    """Handle OAuth2 callback"""
    try:
        # Load the saved flow
        with open('flow.pickle', 'rb') as f:
            flow = pickle.load(f)
        
        # Get authorization code from URL
        code = request.args.get('code')
        
        # Exchange authorization code for credentials
        flow.fetch_token(code=code)
        credentials = flow.credentials
        
        # Save credentials
        with open('token.pickle', 'wb') as f:
            pickle.dump(credentials, f)
        
        return jsonify({
            'status': 'success',
            'message': 'Calendar authorization successful'
        })
    except Exception as e:
        logging.error(f"OAuth callback error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)