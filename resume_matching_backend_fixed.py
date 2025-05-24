import os
import re
import json
import numpy as np
import fitz  # PyMuPDF
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import tempfile
from sklearn.metrics.pairwise import cosine_similarity
from datetime import datetime
import requests
from transformers import AutoTokenizer

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Create a temporary directory for uploaded files
UPLOAD_FOLDER = tempfile.mkdtemp()
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
print(f'Temporary upload folder created at: {UPLOAD_FOLDER}')

# Hugging Face API configuration
HF_API_TOKEN = "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"
HF_API_URL = "https://api-inference.huggingface.co/models"

# Models to use
LLM_MODEL = "google/flan-t5-base"  # Smaller, more accessible model
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# Headers for API requests
headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}

print(f'Using Hugging Face API with models:\n- LLM: {LLM_MODEL}\n- Embeddings: {EMBEDDING_MODEL}')

# In-memory storage for resumes
resumes_db = []

def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file using PyMuPDF."""
    text = ""
    try:
        doc = fitz.open(pdf_path)
        for page in doc:
            text += page.get_text()
        return text
    except Exception as e:
        print(f'Error extracting text from PDF: {e}')
        return ""

def extract_skills(text):
    """Extract skills from resume text using regex patterns."""
    # Common skill patterns
    skill_patterns = [
        r'\b(Python|Java|JavaScript|C\+\+|React|Node\.js|SQL|HTML|CSS)\b',
        r'\b(Machine Learning|Data Science|AI|Artificial Intelligence|NLP|Natural Language Processing)\b',
        r'\b(AWS|Azure|GCP|Cloud Computing|Docker|Kubernetes)\b',
        r'\b(Excel|Word|PowerPoint|Microsoft Office)\b',
        r'\b(Leadership|Management|Communication|Teamwork|Problem Solving)\b'
    ]
    
    skills = []
    for pattern in skill_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        skills.extend([match.strip() for match in matches])
    
    # Remove duplicates and sort
    return sorted(list(set(skills)))

def extract_experience(text):
    """Extract years of experience from resume text."""
    # Look for patterns like "X years of experience"
    experience_patterns = [
        r'(\d+)\+?\s+years?\s+(?:of\s+)?experience',
        r'experience\s+(?:of\s+)?(\d+)\+?\s+years?'
    ]
    
    for pattern in experience_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            # Return the highest number of years found
            return max([int(match) for match in matches])
    
    # Default if no experience info found
    return 0

def extract_education(text):
    """Extract education information from resume text."""
    education_patterns = [
        r'\b(Bachelor|B\.S\.|B\.A\.|BS|BA)\s+(?:of|in|degree)?\s+([^,\.]*)',
        r'\b(Master|M\.S\.|M\.A\.|MS|MA)\s+(?:of|in|degree)?\s+([^,\.]*)',
        r'\b(PhD|Ph\.D\.|Doctorate|Doctoral)\s+(?:of|in|degree)?\s+([^,\.]*)'
    ]
    
    education = []
    for pattern in education_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            degree_type = match[0].strip()
            field = match[1].strip() if len(match) > 1 else ""
            education.append({
                'degree': degree_type,
                'field': field
            })
    
    return education

def get_highest_education_level(education_info):
    """Determine the highest level of education from extracted education info."""
    if not education_info:
        return 'Unknown'
    
    for edu in education_info:
        degree = edu['degree'].lower()
        if 'phd' in degree or 'doctorate' in degree or 'doctoral' in degree:
            return 'PhD'
        elif 'master' in degree or 'ms' in degree or 'ma' in degree or 'm.s.' in degree or 'm.a.' in degree:
            return 'Master'
    
    for edu in education_info:
        degree = edu['degree'].lower()
        if 'bachelor' in degree or 'bs' in degree or 'ba' in degree or 'b.s.' in degree or 'b.a.' in degree:
            return 'Bachelor'
    
    return 'Other'

def generate_llm_prompt(text, is_query=False):
    """Generate a prompt for the LLM based on whether it's a resume or a query."""
    if is_query:
        return f"""<s>[INST] You are a professional recruiter. Based on the following job requirements, create a concise summary of what the ideal candidate should have. Focus on skills, experience, and qualifications.\n\nJob Requirements:\n{text}[/INST]</s>"""
    else:
        return f"""<s>[INST] You are a professional resume reviewer. Summarize the following resume in a concise paragraph. Focus on the candidate's skills, experience, education, and strengths. Keep it under 200 words.\n\nResume:\n{text}[/INST]</s>"""

def get_llm_summary(text):
    """Generate a summary of the resume text using the Hugging Face LLM API."""
    prompt = generate_llm_prompt(text)
    
    # Make API request to Hugging Face
    try:
        payload = {
            "inputs": prompt,
            "options": {"wait_for_model": True},
            "parameters": {
                "max_new_tokens": 512,
                "temperature": 0.7,
                "top_p": 0.95,
                "repetition_penalty": 1.1,
                "top_k": 40
            }
        }
        response = requests.post(f"{HF_API_URL}/{LLM_MODEL}", headers=headers, json=payload)
        response.raise_for_status()
        
        # Extract the generated text
        generated_text = response.json()[0]["generated_text"]
        # For T5 models, the generated text is already the summary
        return generated_text
    except Exception as e:
        print(f"Error calling Hugging Face LLM API: {e}")
        return "Error generating summary. Please try again."

def generate_embedding(text):
    """Generate an embedding for the given text using Hugging Face API."""
    try:
        # For sentence transformers, we need to specify that we want embeddings
        payload = {"inputs": text, "options": {"wait_for_model": True}}
        response = requests.post(
            f"{HF_API_URL}/{EMBEDDING_MODEL}", 
            headers=headers, 
            json=payload
        )
        response.raise_for_status()
        
        # Return the embedding as a numpy array
        return np.array(response.json())
    except Exception as e:
        print(f"Error calling Hugging Face Embedding API: {e}")
        # Return a zero vector as fallback (not ideal but prevents crashes)
        return np.zeros(384)  # all-MiniLM-L6-v2 has 384 dimensions

def calculate_similarity(embedding1, embedding2):
    """Calculate cosine similarity between two embeddings."""
    return cosine_similarity([embedding1], [embedding2])[0][0]

@app.route('/upload', methods=['POST'])
def upload_resume():
    """API endpoint to upload and process a resume."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and file.filename.lower().endswith('.pdf'):
        try:
            # Save the file temporarily
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            
            # Extract text from PDF
            text = extract_text_from_pdf(file_path)
            if not text:
                return jsonify({'error': 'Could not extract text from PDF'}), 400
            
            # Extract skills, experience, and education
            skills = extract_skills(text)
            experience_years = extract_experience(text)
            education_info = extract_education(text)
            education_level = get_highest_education_level(education_info)
            
            # Generate summary using LLM
            summary = get_llm_summary(text)
            
            # Generate embedding for the summary
            embedding = generate_embedding(summary).tolist()
            
            # Create resume object
            resume = {
                'id': len(resumes_db) + 1,
                'filename': filename,
                'uploadDate': datetime.now().isoformat(),
                'skills': skills,
                'experienceYears': experience_years,
                'educationLevel': education_level,
                'summary': summary,
                'embedding': embedding,
                'status': 'processed'
            }
            
            # Add to database
            resumes_db.append(resume)
            
            # Return response without the embedding (too large)
            response_data = resume.copy()
            del response_data['embedding']
            
            return jsonify(response_data), 201
            
        except Exception as e:
            return jsonify({'error': f'Error processing resume: {str(e)}'}), 500
        finally:
            # Clean up the temporary file
            if os.path.exists(file_path):
                os.remove(file_path)
    else:
        return jsonify({'error': 'File must be a PDF'}), 400

@app.route('/upload/all', methods=['GET'])
def get_all_resumes():
    """API endpoint to get all uploaded resumes."""
    try:
        # Return all resumes without embeddings
        results = []
        for resume in resumes_db:
            resume_copy = resume.copy()
            if 'embedding' in resume_copy:
                del resume_copy['embedding']  # Remove embedding from response
            results.append(resume_copy)
        
        return jsonify(results), 200
    except Exception as e:
        return jsonify({'error': f'Error fetching resumes: {str(e)}'}), 500

@app.route('/search', methods=['POST'])
def search_resumes():
    """API endpoint to search for matching resumes based on a query."""
    data = request.json
    if not data or 'query' not in data:
        return jsonify({'error': 'No query provided'}), 400
    
    query = data['query']
    
    try:
        # Generate embedding for the query
        query_summary = get_llm_summary(query)
        query_embedding = generate_embedding(query_summary).tolist()
        
        # Calculate similarity with each resume
        results = []
        for resume in resumes_db:
            similarity = calculate_similarity(query_embedding, resume['embedding'])
            
            # Create result object
            result = {
                'resume': {
                    'id': resume['id'],
                    'filename': resume['filename'],
                    'uploadDate': resume['uploadDate'],
                    'skills': resume['skills'],
                    'experienceYears': resume['experienceYears'],
                    'educationLevel': resume['educationLevel'],
                    'summary': resume['summary']
                },
                'similarity': float(similarity)
            }
            results.append(result)
        
        # Sort by similarity (highest first)
        results.sort(key=lambda x: x['similarity'], reverse=True)
        
        return jsonify(results), 200
        
    except Exception as e:
        return jsonify({'error': f'Error searching resumes: {str(e)}'}), 500

# Set up ngrok authentication (you need to replace this with your authtoken)
# Get your authtoken from https://dashboard.ngrok.com/auth
# ngrok.set_auth_token('YOUR_AUTHTOKEN')  # Uncomment and replace with your token if needed

# Define the port to use (avoiding port 5000 which is commonly used by AirPlay on macOS)
PORT = 8002

print(f'\n\n* Backend is running locally at: http://localhost:{PORT}\n')
print(f'* Make sure your frontend config at src/config/api.ts has API_URL set to "http://localhost:{PORT}"\n')

# Start the Flask app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT)
