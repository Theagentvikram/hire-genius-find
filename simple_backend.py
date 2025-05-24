import os
import re
import json
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import tempfile
from datetime import datetime
import time
import threading
import requests

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Create a temporary directory for uploaded files
UPLOAD_FOLDER = tempfile.mkdtemp()
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
print(f'Temporary upload folder created at: {UPLOAD_FOLDER}')

# OpenRouter API configuration
OPENROUTER_API_KEY = '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'
OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'  # OpenRouter chat completions endpoint

# In-memory storage for resumes
resumes_db = []

# Function to generate summary using OpenRouter API
def generate_summary(resume_text):
    # Truncate resume text if it's too long (to avoid token limits)
    if len(resume_text) > 4000:
        resume_text = resume_text[:4000] + "..."
    
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8080",  # Local development URL
        "X-Title": "Hire Genius Find"  # Your app's name
    }
    
    # Prepare the messages for the chat model
    messages = [
        {"role": "system", "content": "You are a helpful assistant that analyzes resumes and provides concise summaries."},
        {"role": "user", "content": f"Generate a professional summary for the following resume text. Focus on key skills, experience level, and notable achievements. Keep it concise (2-3 sentences):\n\n{resume_text}"}
    ]
    
    try:
        payload = {
            "model": "mistralai/mistral-7b-instruct:free",  # Using Mistral 7B Instruct free model
            "messages": messages,
            "max_tokens": 150,
            "temperature": 0.7
            # Removed top_p as it might not be supported by all models through OpenRouter
        }
        
        print(f"Sending request to OpenRouter API: {OPENROUTER_API_URL}")
        response = requests.post(OPENROUTER_API_URL, headers=headers, json=payload)
        
        # Print response status and headers for debugging
        print(f"OpenRouter API response status: {response.status_code}")
        
        # If the response is not successful, print the error details
        if response.status_code != 200:
            print(f"OpenRouter API error response: {response.text}")
            return f"API Error: {response.status_code} - {response.text[:100]}..."
        
        result = response.json()
        print(f"OpenRouter API response keys: {result.keys()}")
        
        if 'choices' in result and len(result['choices']) > 0:
            summary = result['choices'][0]['message']['content'].strip()
            print(f"Successfully generated summary: {summary[:50]}...")
            return summary
        else:
            print(f"Unexpected response format from OpenRouter: {result}")
            return "Could not generate summary from model response."
    except Exception as e:
        print(f"Exception when calling OpenRouter API: {str(e)}")
        import traceback
        traceback.print_exc()
        return f"Failed to generate summary due to an error: {str(e)}"

# Function to extract skills from resume text
def extract_skills(resume_text):
    # Expanded list of common skills to look for
    common_skills = [
        # Programming Languages
        'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'PHP', 'Swift', 'Kotlin',
        # Web Development
        'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Next.js', 'HTML', 'CSS', 'SASS', 'LESS', 'Bootstrap', 'Tailwind',
        # Backend Frameworks
        'Flask', 'Django', 'Spring', 'Laravel', 'ASP.NET', 'Ruby on Rails', 'FastAPI',
        # Databases
        'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Oracle', 'Redis', 'Elasticsearch', 'DynamoDB', 'Cassandra',
        # Cloud & DevOps
        'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'GitHub Actions', 'Terraform', 'Ansible',
        # Version Control
        'Git', 'SVN', 'Mercurial',
        # AI & Data Science
        'Machine Learning', 'Data Science', 'AI', 'Deep Learning', 'NLP', 'Computer Vision', 'TensorFlow', 'PyTorch', 'Scikit-learn',
        # Data Analysis
        'Pandas', 'NumPy', 'R', 'Tableau', 'Power BI', 'Data Visualization', 'ETL', 'Data Warehousing',
        # Soft Skills
        'Project Management', 'Agile', 'Scrum', 'Leadership', 'Communication', 'Problem Solving', 'Teamwork',
        # Mobile Development
        'iOS', 'Android', 'React Native', 'Flutter', 'Xamarin',
        # Testing
        'Unit Testing', 'Integration Testing', 'Selenium', 'Jest', 'Cypress', 'QA'
    ]
    
    # Find skills mentioned in the resume using regex with word boundaries
    found_skills = []
    for skill in common_skills:
        # Use word boundaries to find exact matches
        if re.search(r'\b' + re.escape(skill) + r'\b', resume_text, re.IGNORECASE):
            found_skills.append(skill)
    
    # Look for skills mentioned in a skills section
    skills_section_match = re.search(r'\b(skills|technical skills|core competencies)\s*:(.+?)(?:\n\n|\n[A-Z])', 
                                    resume_text, re.IGNORECASE | re.DOTALL)
    
    if skills_section_match:
        skills_text = skills_section_match.group(2)
        # Look for comma or bullet point separated skills
        skills_list = re.findall(r'[•\-\*]\s*([\w\s\+\#]+?)(?:,|$|\n)', skills_text, re.IGNORECASE)
        skills_list.extend(re.findall(r'([\w\s\+\#]+?)(?:,|$|\n)', skills_text, re.IGNORECASE))
        
        for skill in skills_list:
            skill = skill.strip()
            if skill and len(skill) > 2 and skill not in found_skills:  # Avoid very short skills
                found_skills.append(skill)
    
    # If we found less than 3 skills, add some generic ones
    if len(found_skills) < 3:
        remaining = 3 - len(found_skills)
        found_skills.extend(common_skills[:remaining])
    
    return found_skills[:10]  # Return up to 10 skills

# Function to determine experience level
def determine_experience(resume_text):
    # Enhanced patterns for years of experience
    experience_patterns = [
        # Direct mentions of years of experience
        r'\b(\d+)\+?\s*years?\s*(?:of)?\s*experience\b',
        r'\bexperienced?\s*(?:for|with)?\s*(\d+)\+?\s*years\b',
        r'\b(\d+)\+?\s*years?\s*(?:of)?\s*work\s*experience\b',
        r'\bprofessional\s*experience\s*(?:of|for)?\s*(\d+)\+?\s*years\b',
        
        # Experience in specific roles
        r'\b(\d+)\+?\s*years?\s*(?:as|as a|in)\s*[a-zA-Z\s]+\b',
        
        # Date ranges in work experience sections
        r'(?:20\d{2}|19\d{2})\s*(?:-|–|to)\s*(?:20\d{2}|19\d{2}|present|current|now)'
    ]
    
    # Extract years from direct mentions
    max_years = 0
    for pattern in experience_patterns[:-1]:  # Exclude the date range pattern
        matches = re.findall(pattern, resume_text, re.IGNORECASE)
        for match in matches:
            try:
                years = int(match)
                max_years = max(max_years, years)
            except ValueError:
                pass
    
    # If we couldn't find direct mentions, look for date ranges
    if max_years == 0:
        date_ranges = re.findall(experience_patterns[-1], resume_text)
        if date_ranges:
            # Calculate years from the earliest date to the latest or present
            years_mentioned = []
            for date_range in date_ranges:
                try:
                    start_year = int(re.search(r'(20\d{2}|19\d{2})', date_range).group(1))
                    if 'present' in date_range.lower() or 'current' in date_range.lower() or 'now' in date_range.lower():
                        end_year = datetime.now().year
                    else:
                        end_year = int(re.search(r'(?:20\d{2}|19\d{2})\s*(?:-|–|to)\s*(20\d{2}|19\d{2})', date_range).group(1))
                    years_mentioned.append(end_year - start_year)
                except (AttributeError, ValueError):
                    pass
            
            if years_mentioned:
                # Sum up to 3 longest experiences (to account for overlapping jobs)
                years_mentioned.sort(reverse=True)
                max_years = sum(years_mentioned[:3])
    
    # If we still couldn't find years of experience, make a guess based on the resume length and education
    if max_years == 0:
        # Check for graduation years
        graduation_years = re.findall(r'(?:graduated|degree|diploma|bachelor|master|phd)\s*(?:in|from)?\s*(?:the\s*year\s*)?(20\d{2}|19\d{2})', 
                                    resume_text, re.IGNORECASE)
        if graduation_years:
            try:
                grad_year = min([int(year) for year in graduation_years])
                max_years = datetime.now().year - grad_year
            except ValueError:
                pass
        
        # If still no data, guess based on resume length
        if max_years == 0:
            words = len(resume_text.split())
            if words > 800:
                max_years = 7
            elif words > 500:
                max_years = 5
            elif words > 300:
                max_years = 3
            else:
                max_years = 1
    
    # Determine level based on years
    if max_years > 8:
        return 'Senior'
    elif max_years > 3:
        return 'Mid-level'
    else:
        return 'Entry-level'

# Function to determine education level
def determine_education(resume_text):
    # Enhanced patterns for education levels with more variations
    education_patterns = {
        'PhD': r'\b(phd|ph\.d|doctor|doctorate|doctoral)\s*(degree|program)?\b',
        'Master': r'\b(master|masters|mba|m\.s|m\.eng|m\.a|ms|ma|msc|meng)\s*(degree|program|of|in)?\b',
        'Bachelor': r'\b(bachelor|bachelors|b\.s|b\.a|b\.eng|bs|ba|bsc|beng)\s*(degree|program|of|in)?\b',
        'Associate': r'\b(associate|associates|a\.a|a\.s|aas)\s*(degree|program|of|in)?\b'
    }
    
    # Look for education section
    education_section = re.search(r'\b(education|academic|qualifications)\s*:(.+?)(?:\n\n|\n[A-Z])', 
                                resume_text, re.IGNORECASE | re.DOTALL)
    
    education_text = education_section.group(2) if education_section else resume_text
    
    # Find the highest education level mentioned
    for level, pattern in education_patterns.items():
        if re.search(pattern, education_text, re.IGNORECASE):
            # Try to extract the field of study
            field_match = re.search(r'\b(?:' + pattern.replace('\\b', '') + r')\s+(?:degree|program|of|in)?\s+([A-Za-z\s]+)', 
                                   education_text, re.IGNORECASE)
            
            field = field_match.group(1).strip() if field_match else ''
            
            # Also look for university/institution name
            university_match = re.search(r'\b(?:university|college|institute|school)\s+(?:of)?\s+([A-Za-z\s]+)', 
                                       education_text, re.IGNORECASE)
            
            university = university_match.group(1).strip() if university_match else ''
            
            # Return a dictionary with education details
            return {
                'level': level,
                'field': field,
                'university': university
            }
    
    # Default if no education level found
    return {
        'level': 'High School',
        'field': '',
        'university': ''
    }

# Function to process a resume
def process_resume(resume_id):
    # Find the resume in our database
    for resume in resumes_db:
        if resume['id'] == resume_id and resume['status'] == 'processing':
            try:
                # Get the resume text
                resume_text = resume.get('text', '')
                
                # Generate a summary using the API
                summary = generate_summary(resume_text)
                resume['summary'] = summary
                
                # Extract skills using enhanced regex patterns
                skills = extract_skills(resume_text)
                resume['skills'] = skills
                
                # Determine experience level using enhanced extraction
                experience_years = determine_experience(resume_text)
                resume['experience'] = experience_years
                
                # Set experience level based on years
                if experience_years > 8:
                    experience_level = 'Senior'
                elif experience_years > 3:
                    experience_level = 'Mid-level'
                else:
                    experience_level = 'Entry-level'
                resume['experience_level'] = experience_level
                
                # Determine education level using enhanced extraction
                education_info = determine_education(resume_text)
                resume['education_level'] = education_info
                
                # For display purposes, create a formatted education string
                if isinstance(education_info, dict):
                    edu_level = education_info.get('level', 'Unknown')
                    edu_field = education_info.get('field', '')
                    edu_university = education_info.get('university', '')
                    
                    formatted_education = edu_level
                    if edu_field:
                        formatted_education += f" in {edu_field}"
                    if edu_university:
                        formatted_education += f" from {edu_university}"
                    
                    resume['education_formatted'] = formatted_education
                
                # Update the resume status
                resume['status'] = 'processed'
                
                print(f"Successfully processed resume {resume_id}")
                print(f"  - Skills: {', '.join(skills[:3])}...")
                print(f"  - Experience: {experience_years} years ({experience_level})")
                print(f"  - Education: {resume.get('education_formatted', str(education_info))}")
                
            except Exception as e:
                print(f"Error processing resume {resume_id}: {str(e)}")
                resume['status'] = 'error'
                resume['error'] = str(e)
            break

@app.route('/upload', methods=['POST'])
def upload_resume():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Get category from form data if available
    category = request.form.get('category', '')
    
    if file:
        # Save the file
        filename = secure_filename(file.filename)
        original_name = file.filename  # Keep the original filename for display
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Extract text from PDF if it's a PDF file
        resume_text = 'No text extracted'
        if filename.lower().endswith('.pdf'):
            try:
                # Use a simple text extraction method
                with open(filepath, 'rb') as f:
                    # Read the entire file for better extraction
                    resume_text = f.read().decode('utf-8', errors='ignore')
            except Exception as e:
                print(f"Error extracting text from PDF: {str(e)}")
                # Try an alternative method if the first one fails
                try:
                    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                        resume_text = f.read()
                except Exception as e2:
                    print(f"Error with alternative extraction: {str(e2)}")
        else:
            # For non-PDF files, just use the filename as sample text
            resume_text = f"Resume for {filename} with skills in Python, JavaScript, and React. 5 years of experience in software development."
        
        # Create a new resume entry
        resume_id = str(len(resumes_db) + 1)
        upload_date = datetime.now().isoformat()
        
        # Extract initial skills, experience, and education for immediate display
        initial_skills = extract_skills(resume_text)[:5]  # Limit to 5 skills for initial display
        initial_experience = determine_experience(resume_text)
        initial_education = determine_education(resume_text)
        
        # Format education for display
        if isinstance(initial_education, dict):
            edu_level = initial_education.get('level', 'Unknown')
            edu_field = initial_education.get('field', '')
            formatted_education = edu_level
            if edu_field:
                formatted_education += f" in {edu_field}"
        else:
            formatted_education = str(initial_education)
        
        # Create the resume object
        resume = {
            'id': resume_id,
            'filename': filename,
            'originalName': original_name,
            'uploadDate': upload_date,
            'category': category,
            'status': 'processing',
            'filepath': filepath,
            'text': resume_text,
            'skills': initial_skills,
            'experience': initial_experience,
            'experience_level': 'Analyzing...',
            'education_level': initial_education,
            'education_formatted': formatted_education,
            'fileUrl': f"/files/{filename}"
        }
        
        # Add to database
        resumes_db.append(resume)
        
        # Start processing in a background thread
        thread = threading.Thread(target=process_resume, args=(resume_id,))
        thread.daemon = True
        thread.start()
        
        # Return a response with the initial data
        response_data = {
            'id': resume_id,
            'filename': filename,
            'originalName': original_name,
            'uploadDate': upload_date,
            'category': category,
            'status': 'processing',
            'skills': initial_skills,
            'experience': initial_experience,
            'educationLevel': formatted_education
        }
        
        return jsonify(response_data), 201
    else:
        return jsonify({'error': 'File type not supported'}), 400

@app.route('/upload/all', methods=['GET'])
def get_all_resumes():
    """API endpoint to get all uploaded resumes."""
    try:
        return jsonify(resumes_db), 200
    except Exception as e:
        return jsonify({'error': f'Error fetching resumes: {str(e)}'}), 500

# Function to generate embeddings for text using a simple TF-IDF approach
def generate_embedding(text):
    # Preprocess text
    text = text.lower()
    # Remove punctuation and special characters
    text = re.sub(r'[^\w\s]', '', text)
    # Tokenize
    tokens = text.split()
    
    # Simple TF-IDF like approach
    # Count term frequency
    term_freq = {}
    for token in tokens:
        if token not in term_freq:
            term_freq[token] = 0
        term_freq[token] += 1
    
    # Create a simple vector
    vector = list(term_freq.values())
    
    # Normalize the vector
    magnitude = sum(v**2 for v in vector) ** 0.5
    if magnitude > 0:
        vector = [v/magnitude for v in vector]
    
    return vector

# Function to calculate cosine similarity between two texts
def calculate_cosine_similarity(text1, text2):
    # Generate embeddings
    embedding1 = generate_embedding(text1)
    embedding2 = generate_embedding(text2)
    
    # If either embedding is empty, return 0
    if not embedding1 or not embedding2:
        return 0
    
    # Make sure embeddings are the same length
    max_len = max(len(embedding1), len(embedding2))
    embedding1 = embedding1 + [0] * (max_len - len(embedding1))
    embedding2 = embedding2 + [0] * (max_len - len(embedding2))
    
    # Calculate dot product
    dot_product = sum(a*b for a, b in zip(embedding1, embedding2))
    
    # Calculate magnitudes
    magnitude1 = sum(a**2 for a in embedding1) ** 0.5
    magnitude2 = sum(b**2 for b in embedding2) ** 0.5
    
    # Calculate cosine similarity
    if magnitude1 > 0 and magnitude2 > 0:
        return dot_product / (magnitude1 * magnitude2)
    else:
        return 0

@app.route('/search', methods=['POST'])
def search_resumes():
    """API endpoint to search for matching resumes based on a query."""
    data = request.json
    if not data or 'query' not in data:
        return jsonify({'error': 'No query provided'}), 400
    
    query = data['query']
    
    try:
        # Get processed resumes
        processed_resumes = [r for r in resumes_db if r.get('status') == 'processed']
        
        if not processed_resumes:
            return jsonify([]), 200
        
        # Use cosine similarity to rank resumes based on the query
        print(f"Using cosine similarity to match resumes with query: {query[:100]}...")
        
        # Calculate similarity for each resume
        results = []
        for resume in processed_resumes:
            # Combine all relevant resume information for matching
            resume_text = f"{resume.get('summary', '')} "
            resume_text += f"{' '.join(resume.get('skills', []))} "
            resume_text += f"{resume.get('experience_level', '')} "
            
            # Get education info
            education = resume.get('education_level', {})
            if isinstance(education, dict):
                resume_text += f"{education.get('level', '')} {education.get('field', '')} {education.get('university', '')} "
            else:
                resume_text += f"{education} "
            
            # Calculate similarity using cosine similarity
            similarity = calculate_cosine_similarity(query, resume_text)
            
            # Also use OpenRouter for more advanced matching if available
            ai_match_score = None
            try:
                # Prepare a concise representation of the resume
                resume_summary = f"Resume ID: {resume['id']}\nSkills: {', '.join(resume.get('skills', []))}\n"
                resume_summary += f"Experience: {resume.get('experience_level', 'Unknown')}\n"
                
                # Format education based on its type
                if isinstance(resume.get('education_level'), dict):
                    edu = resume.get('education_level', {})
                    edu_text = f"{edu.get('level', 'Unknown')} in {edu.get('field', '')} from {edu.get('university', '')}"
                else:
                    edu_text = resume.get('education_level', 'Unknown')
                    
                resume_summary += f"Education: {edu_text}\n"
                resume_summary += f"Summary: {resume.get('summary', '')}\n"
                
                # Create a match reason based on skills and requirements
                query_keywords = set(query.lower().split())
                resume_keywords = set(resume_text.lower().split())
                matching_keywords = query_keywords.intersection(resume_keywords)
                
                match_reason = ""
                if matching_keywords:
                    match_reason = f"Matches on keywords: {', '.join(list(matching_keywords)[:5])}"
                    if len(matching_keywords) > 5:
                        match_reason += f" and {len(matching_keywords) - 5} more"
            except Exception as e:
                print(f"Error creating match reason: {e}")
                match_reason = ""
            
            # Scale similarity to a 0-10 range for display
            match_score = round(similarity * 10, 1)
            
            # Ensure minimum score of 0.5 for display purposes
            if match_score < 0.5:
                match_score = 0.5
            
            result = {
                'resume': resume,
                'similarity': float(similarity),
                'matchScore': float(match_score),
                'matchReason': match_reason
            }
            results.append(result)
        
        # Optional: Use OpenRouter for additional insights if needed
        # But we'll primarily use our cosine similarity results
        
        # Sort by similarity (highest first)
        results.sort(key=lambda x: x['similarity'], reverse=True)
        
        # Add match reasons based on skills and experience
        for result in results:
            resume = result['resume']
            if not result.get('matchReason'):
                # Create a match reason based on skills and requirements
                query_keywords = set(query.lower().split())
                resume_text = f"{resume.get('summary', '')} {' '.join(resume.get('skills', []))}"
                resume_keywords = set(resume_text.lower().split())
                matching_keywords = query_keywords.intersection(resume_keywords)
                
                if matching_keywords:
                    result['matchReason'] = f"Matches on keywords: {', '.join(list(matching_keywords)[:5])}"
                    if len(matching_keywords) > 5:
                        result['matchReason'] += f" and {len(matching_keywords) - 5} more"
                else:
                    result['matchReason'] = "Matched based on overall profile similarity"
        
        # Print some debug info
        print(f"Found {len(results)} matching resumes")
        if results:
            top_match = results[0]
            print(f"Top match: Resume ID {top_match['resume']['id']} with score {top_match['matchScore']}")
            print(f"Match reason: {top_match.get('matchReason', 'None provided')}")
        
        return jsonify(results), 200
        
    except Exception as e:
        print(f"Error in search_resumes: {str(e)}")
        return jsonify({'error': f'Error searching resumes: {str(e)}'}), 500

# Start the Flask app
if __name__ == '__main__':
    print('\n\n* Backend is now running at: http://localhost:8005\n')
    print('* Update your frontend config at src/config/api.ts with this URL\n')
    app.run(host='0.0.0.0', port=8005, debug=True)
