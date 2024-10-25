from langchain_community.llms import Ollama
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

def create_email_generator():
    # Initialize Ollama with specified model
    llm = Ollama(model="mistral")  # You can change the model as needed
    
    # Create a prompt template for email generation
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
    
    # Create the LLMChain
    email_chain = LLMChain(llm=llm, prompt=prompt)
    
    return email_chain

def generate_email(chain, email_details):
    """
    Generate email based on provided details
    """
    try:
        response = chain.run(
            subject=email_details['subject'],
            recipient=email_details['recipient'],
            purpose=email_details['purpose'],
            tone=email_details['tone'],
            context=email_details['context']
        )
        return response
    except Exception as e:
        return f"Error generating email: {str(e)}"

def main():
    # Initialize the email generator
    email_chain = create_email_generator()
    
    # Get user input
    print("\n=== Email Draft Generator ===")
    email_details = {
        'subject': input("Enter email subject: "),
        'recipient': input("Enter recipient (e.g., 'Marketing Team', 'Client'): "),
        'purpose': input("What's the purpose of this email? "),
        'tone': input("Desired tone (e.g., formal, friendly, professional): "),
        'context': input("Any additional context or specific points to include: ")
    }
    
    # Generate the email
    print("\nGenerating email draft...\n")
    email_draft = generate_email(email_chain, email_details)
    
    print("=== Generated Email Draft ===")
    print(email_draft)
    print("===========================")

if __name__ == "__main__":
    main()