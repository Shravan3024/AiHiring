import os
import sys
from dotenv import load_dotenv
import google.generativeai as genai

# Load .env from backend directory
env_path = os.path.join(os.path.dirname(__file__), '../.env')
load_dotenv(env_path)

api_key = os.environ.get('GOOGLE_API_KEY')
if not api_key:
    print("Error: GOOGLE_API_KEY environment variable not found.")
    sys.exit(1)

genai.configure(api_key=api_key)

try:
    print("Initializing Gemini 2.5 Flash model...")
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    print("Making test request...")
    response = model.generate_content("Say hello world.")
    
    print("\nSUCCESS! Google Gemini API Key is working perfectly.")
    print("Model replied:")
    print("----------------------------------------")
    print(response.text)
    print("----------------------------------------")
except Exception as e:
    print("\nFAILURE! Could not connect to Gemini API.")
    print(f"Error details: {str(e)}")
    sys.exit(1)
