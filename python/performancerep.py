# Standard library imports
import os
from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional, Dict
from enum import Enum
from io import BytesIO
import google.generativeai as genai

# Third-party imports
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import base64
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY', 'AIzaSyAnaDYO95Nj_OMlx7gy1gdi5lCOxEOTel4')
try:
    genai.configure(api_key=GOOGLE_API_KEY)
    model = genai.GenerativeModel('gemini-pro-vision')
except Exception as e:
    print(f"Warning: Failed to initialize Gemini AI: {str(e)}")
    model = None

class PerformanceRating(Enum):
    EXCEPTIONAL = 5
    EXCEEDS_EXPECTATIONS = 4
    MEETS_EXPECTATIONS = 3
    NEEDS_IMPROVEMENT = 2
    UNSATISFACTORY = 1

@dataclass
class EmployeeMetrics:
    # Basic Information
    employee_id: str
    name: str
    department: str
    role: str
    review_period: str
    
    # Quantitative Metrics
    projects_completed: int
    tasks_completed: int
    deadlines_met_percentage: float
    attendance_percentage: float
    
    # Quality Metrics
    quality_score: float  # 0-100
    error_rate: float    # 0-100
    customer_satisfaction: Optional[float]  # 0-100
    
    # Behavioral Metrics
    teamwork_rating: PerformanceRating
    communication_rating: PerformanceRating
    initiative_rating: PerformanceRating
    leadership_rating: Optional[PerformanceRating]
    
    # Development
    training_completed: List[str]
    certifications_earned: List[str]
    
    # Goals
    goals_achieved: int
    total_goals: int

def analyze_with_gemini(visualizations, metrics):
    """Use Gemini to analyze visualizations and performance data with fallback"""
    try:
        if not model:
            raise Exception("Gemini AI not initialized")

        # Convert base64 images to format Gemini can process
        images = [
            base64.b64decode(visualizations[key])
            for key in visualizations
        ]
        
        # Prepare context for Gemini
        context = f"""
        Employee Performance Data:
        - Name: {metrics.name}
        - Role: {metrics.role}
        - Department: {metrics.department}
        - Projects Completed: {metrics.projects_completed}
        - Quality Score: {metrics.quality_score}
        - Goals Achievement: {metrics.goals_achieved}/{metrics.total_goals}
        
        Please analyze the performance visualizations and provide:
        1. Key insights from each visualization
        2. Trends and patterns
        3. Areas of strength
        4. Areas for improvement
        5. Overall performance summary
        """
        
        # Get Gemini's analysis
        response = model.generate_content([context, *images])
        return response.text

    except Exception as e:
        print(f"Warning: Gemini analysis failed, falling back to default analysis: {str(e)}")
        return None

def create_performance_visualizations(metrics):
    """Create various performance visualizations and return them as base64 strings"""
    try:
        visualizations = {}
        
        # 1. Radar Chart for Overall Performance
        plt.figure(figsize=(8, 8))
        categories = ['Quality', 'Productivity', 'Teamwork', 
                     'Communication', 'Initiative', 'Goals']
        values = [
            metrics.quality_score,
            (metrics.projects_completed / 10) * 100,  # Normalized to 100
            metrics.teamwork_rating.value * 20,  # Convert 5-point scale to 100
            metrics.communication_rating.value * 20,
            metrics.initiative_rating.value * 20,
            (metrics.goals_achieved / metrics.total_goals) * 100
        ]
        
        angles = np.linspace(0, 2*np.pi, len(categories), endpoint=False)
        values = np.concatenate((values, [values[0]]))
        angles = np.concatenate((angles, [angles[0]]))
        
        ax = plt.subplot(111, polar=True)
        ax.plot(angles, values)
        ax.fill(angles, values, alpha=0.25)
        ax.set_xticks(angles[:-1])
        ax.set_xticklabels(categories)
        plt.title("Overall Performance Matrix")
        
        radar_img = BytesIO()
        plt.savefig(radar_img, format='png', bbox_inches='tight')
        plt.close()
        visualizations['radar'] = base64.b64encode(radar_img.getvalue()).decode()

        # 2. Quality Metrics Heatmap
        plt.figure(figsize=(8, 6))
        quality_data = {
            'Quality Score': [metrics.quality_score],
            'Error Rate': [metrics.error_rate],
            'Customer Satisfaction': [metrics.customer_satisfaction or 0]
        }
        df = pd.DataFrame(quality_data)
        sns.heatmap(df, annot=True, cmap='YlOrRd', fmt='.1f')
        plt.title('Quality Metrics Overview')
        
        heatmap_img = BytesIO()
        plt.savefig(heatmap_img, format='png', bbox_inches='tight')
        plt.close()
        visualizations['heatmap'] = base64.b64encode(heatmap_img.getvalue()).decode()

        return visualizations
    except Exception as e:
        print(f"Error creating visualizations: {str(e)}")
        return None

def generate_default_analysis(metrics, score_data):
    """Generate a default analysis when Gemini AI is not available"""
    final_score = score_data['final_score']
    performance_level = (
        "Outstanding" if final_score >= 90
        else "Excellent" if final_score >= 80
        else "Good" if final_score >= 70
        else "Fair" if final_score >= 60
        else "Needs Improvement"
    )
    
    return f"""
Performance Analysis for {metrics.name}

Overall Performance: {performance_level} ({final_score:.1f}%)

Key Strengths:
1. Quality Score: {metrics.quality_score:.1f}%
2. Projects Completed: {metrics.projects_completed}
3. Goals Achievement: {metrics.goals_achieved}/{metrics.total_goals}

Development Areas:
1. Error Rate: {metrics.error_rate:.1f}%
2. Communication Rating: {metrics.communication_rating.name}

Additional Achievements:
- Completed {len(metrics.training_completed)} training courses
- Earned {len(metrics.certifications_earned)} certifications

This analysis is based on quantitative metrics and performance ratings provided.
"""

def calculate_final_score(metrics: EmployeeMetrics) -> dict:
    """Calculate a weighted final score out of 100 and return detailed breakdown"""
    try:
        weights = {
            'quality': 0.25,
            'productivity': 0.20,
            'behavioral': 0.25,
            'goals': 0.20,
            'development': 0.10
        }
        
        # Quality Score Calculation
        quality_score = (
            metrics.quality_score * 0.4 +
            (100 - metrics.error_rate) * 0.3 +
            (metrics.customer_satisfaction or 0) * 0.3
        )
        
        # Productivity Score Calculation
        productivity_score = (
            (metrics.projects_completed / 10) * 100 * 0.4 +
            metrics.deadlines_met_percentage * 0.4 +
            metrics.attendance_percentage * 0.2
        )
        
        # Behavioral Score Calculation
        behavioral_scores = [
            metrics.teamwork_rating.value,
            metrics.communication_rating.value,
            metrics.initiative_rating.value
        ]
        if metrics.leadership_rating:
            behavioral_scores.append(metrics.leadership_rating.value)
        behavioral_score = (sum(behavioral_scores) / len(behavioral_scores)) * 20
        
        # Goals Score Calculation
        goals_score = (metrics.goals_achieved / metrics.total_goals) * 100
        
        # Development Score Calculation
        development_score = (
            len(metrics.training_completed) * 25 +
            len(metrics.certifications_earned) * 25
        )
        development_score = min(development_score, 100)
        
        # Calculate weighted final score
        final_score = round(
            quality_score * weights['quality'] +
            productivity_score * weights['productivity'] +
            behavioral_score * weights['behavioral'] +
            goals_score * weights['goals'] +
            development_score * weights['development'],
            2
        )
        
        return {
            'final_score': final_score,
            'breakdown': {
                'quality_score': round(quality_score, 2),
                'productivity_score': round(productivity_score, 2),
                'behavioral_score': round(behavioral_score, 2),
                'goals_score': round(goals_score, 2),
                'development_score': round(development_score, 2)
            }
        }
    except Exception as e:
        print(f"Error calculating final score: {str(e)}")
        return None

def generate_pdf_report(metrics: EmployeeMetrics, visualizations: dict, analysis: str, score_data: dict) -> str:
    """Generate a PDF report with all performance data"""
    try:
        filename = f"performance_report_{metrics.employee_id}_{datetime.now().strftime('%Y%m%d')}.pdf"
        doc = SimpleDocTemplate(
            filename,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )
        
        styles = getSampleStyleSheet()
        elements = []
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30
        )
        elements.append(Paragraph(f"Performance Report - {metrics.name}", title_style))
        elements.append(Spacer(1, 12))
        
        # Basic Information
        elements.append(Paragraph("Employee Information", styles['Heading2']))
        info_data = [
            ["Employee ID:", metrics.employee_id],
            ["Department:", metrics.department],
            ["Role:", metrics.role],
            ["Review Period:", metrics.review_period]
        ]
        elements.append(Table(info_data, colWidths=[2*inch, 4*inch]))
        elements.append(Spacer(1, 20))
        
        # Score Breakdown
        elements.append(Paragraph("Performance Score Breakdown", styles['Heading2']))
        score_breakdown = [
            ["Category", "Score"],
            ["Quality", f"{score_data['breakdown']['quality_score']:.2f}%"],
            ["Productivity", f"{score_data['breakdown']['productivity_score']:.2f}%"],
            ["Behavioral", f"{score_data['breakdown']['behavioral_score']:.2f}%"],
            ["Goals", f"{score_data['breakdown']['goals_score']:.2f}%"],
            ["Development", f"{score_data['breakdown']['development_score']:.2f}%"],
            ["Final Score", f"{score_data['final_score']:.2f}%"]
        ]
        elements.append(Table(score_breakdown, colWidths=[3*inch, 3*inch]))
        elements.append(Spacer(1, 20))
        
        # Visualizations
        if visualizations:
            elements.append(Paragraph("Performance Visualizations", styles['Heading2']))
            for name, img_data in visualizations.items():
                img = Image(BytesIO(base64.b64decode(img_data)))
                img.drawHeight = 4*inch
                img.drawWidth = 6*inch
                elements.append(img)
                elements.append(Spacer(1, 20))
        
        # Analysis
        elements.append(Paragraph("Performance Analysis", styles['Heading2']))
        elements.append(Paragraph(analysis, styles['Normal']))
        elements.append(Spacer(1, 20))
        
        # Build PDF
        doc.build(elements)
        return filename
    except Exception as e:
        print(f"Error generating PDF report: {str(e)}")
        return None

def generate_performance_report(metrics: EmployeeMetrics) -> dict:
    """Main function to generate the complete performance report"""
    try:
        # Calculate scores
        score_data = calculate_final_score(metrics)
        if not score_data:
            raise ValueError("Failed to calculate performance scores")

        # Create visualizations
        visualizations = create_performance_visualizations(metrics)
        
        # Try Gemini analysis first, fall back to default if it fails
        analysis = None
        if visualizations:
            analysis = analyze_with_gemini(visualizations, metrics)
        
        if not analysis:
            analysis = generate_default_analysis(metrics, score_data)
        
        # Generate PDF report
        report_path = generate_pdf_report(metrics, visualizations, analysis, score_data)
        if not report_path:
            raise ValueError("Failed to generate PDF report")

        return {
            'status': 'success',
            'final_score': score_data['final_score'],
            'report_path': report_path,
            'used_ai_analysis': analysis is not None
        }
    except Exception as e:
        print(f"Error in generate_performance_report: {str(e)}")
        return {
            'status': 'error',
            'message': str(e)
        }

# Example usage
if __name__ == "__main__":
    # Create sample metrics
    metrics = EmployeeMetrics(
        employee_id="EMP001",
        name="John Doe",
        department="Engineering",
        role="Senior Developer",
        review_period="2024 Q1",
        projects_completed=5,
        tasks_completed=45,
        deadlines_met_percentage=92.5,
        attendance_percentage=98.0,
        quality_score=88.5,
        error_rate=3.2,
        customer_satisfaction=92.0,
        teamwork_rating=PerformanceRating.EXCEEDS_EXPECTATIONS,
        communication_rating=PerformanceRating.MEETS_EXPECTATIONS,
        initiative_rating=PerformanceRating.EXCEEDS_EXPECTATIONS,
        leadership_rating=PerformanceRating.MEETS_EXPECTATIONS,
        training_completed=["Advanced Python", "Cloud Architecture"],
        certifications_earned=["AWS Solutions Architect"],
        goals_achieved=4,
        total_goals=5
    )
    
    # Generate report
    result = generate_performance_report(metrics)
    
    # Check result
    if result['status'] == 'success':
        print(f"Report generated successfully! Final score: {result['final_score']}")
        print(f"Report saved to: {result['report_path']}")
    else:
        print(f"Error generating report: {result['message']}")