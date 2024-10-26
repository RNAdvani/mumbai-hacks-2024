from flask import Flask, request, jsonify
from langchain_community.llms import Ollama
from flask_cors import CORS 
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

app = Flask(__name__)
CORS(app)

def create_email_generator():
    """Initialize and return the email generation chain"""
    llm = Ollama(model="mistral")
    
    email_template = """
    Write a professional email with the following requirements:
    
    Subject: {subject}
    To: {recipient}
    Purpose: {purpose}
    Tone: {tone}
    Additional Context: {context}
    
    Please generate a complete email draft including subject line and signature.
    """
    
    prompt = PromptTemplate(
        input_variables=["subject", "recipient", "purpose", "tone", "context"],
        template=email_template
    )
    
    return LLMChain(llm=llm, prompt=prompt)

# Initialize the email generator chain
email_chain = create_email_generator()

@app.route('/health', methods=['GET'])
def health_check():
    """Basic health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Email generator API is running'
    })

@app.route('/generate-email', methods=['POST'])
def generate_email():
    """
    Generate an email based on provided parameters
    
    Expected JSON body:
    {
        "subject": "Meeting Follow-up",
        "recipient": "Marketing Team",
        "purpose": "Summarize meeting outcomes",
        "tone": "professional",
        "context": "Weekly marketing sync discussion"
    }
    """
    try:
        # Validate request
        if not request.is_json:
            return jsonify({
                'error': 'Request must be JSON'
            }), 400
            
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['subject', 'recipient', 'purpose', 'tone', 'context']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
            
        # Generate email
        response = email_chain.run(
            subject=data['subject'],
            recipient=data['recipient'],
            purpose=data['purpose'],
            tone=data['tone'],
            context=data['context']
        )
        
        return jsonify({
            'status': 'success',
            'email_draft': response
        })
        
    except Exception as e:
        return jsonify({
            'error': f'Error generating email: {str(e)}'
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)