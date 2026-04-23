"""
Utility functions for AI Service
Includes text processing, file handling, and common helpers
"""
import os
import logging
import json
import hashlib
from pathlib import Path
from typing import Dict, List, Any, Optional
import PyPDF2
import pdfplumber
from config import Config

logger = logging.getLogger(__name__)

def setup_logging(log_level=logging.INFO):
    """Setup logging configuration"""
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(Config.LOG_FILE),
            logging.StreamHandler()
        ]
    )

def clean_text(text: str) -> str:
    """
    Clean and normalize text
    
    Args:
        text: Raw text to clean
        
    Returns:
        Cleaned text
    """
    # Remove extra whitespace
    text = ' '.join(text.split())
    # Remove special characters but keep important ones
    text = text.replace('\x00', '')
    return text.strip()

def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract text from PDF file using multiple methods for better accuracy
    
    Args:
        file_path: Path to PDF file
        
    Returns:
        Extracted text
    """
    text = ""
    try:
        # Try pdfplumber first (better for formatted text)
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() + "\n"
                if text.strip():
                    return clean_text(text)
        except Exception as e:
            logger.warning(f"pdfplumber extraction failed: {e}, trying PyPDF2")
        
        # Fallback to PyPDF2
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                text += page.extract_text() + "\n"
        
        return clean_text(text)
    
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        raise

def extract_text_from_docx(file_path: str) -> str:
    """
    Extract text from DOCX file
    
    Args:
        file_path: Path to DOCX file
        
    Returns:
        Extracted text
    """
    try:
        from docx import Document
        doc = Document(file_path)
        text = "\n".join([para.text for para in doc.paragraphs])
        return clean_text(text)
    except Exception as e:
        logger.error(f"Error extracting text from DOCX: {e}")
        raise

def extract_text_from_file(file_path: str) -> str:
    """
    Extract text from file based on extension
    
    Args:
        file_path: Path to file
        
    Returns:
        Extracted text
    """
    file_ext = Path(file_path).suffix.lower()
    
    if file_ext == '.pdf':
        return extract_text_from_pdf(file_path)
    elif file_ext in ['.docx', '.doc']:
        return extract_text_from_docx(file_path)
    elif file_ext == '.txt':
        with open(file_path, 'r', encoding='utf-8') as f:
            return clean_text(f.read())
    else:
        raise ValueError(f"Unsupported file format: {file_ext}")

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 100) -> List[str]:
    """
    Split text into overlapping chunks for processing
    
    Args:
        text: Text to chunk
        chunk_size: Size of each chunk
        overlap: Overlap between chunks
        
    Returns:
        List of text chunks
    """
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
    return chunks

def extract_email(text: str) -> Optional[str]:
    """Extract email address from text"""
    import re
    match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
    return match.group(0) if match else None

def extract_phone(text: str) -> Optional[str]:
    """Extract phone number from text"""
    import re
    # Common phone patterns
    patterns = [
        r'\b(?:\+91|91)?[6-9]\d{9}\b',  # Indian
        r'\b(?:\+1)?(?:\([0-9]{3}\)?)?[0-9]{3}[.\s-][0-9]{3}[.\s-][0-9]{4}\b',  # US
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(0)
    return None

def extract_urls(text: str) -> List[str]:
    """Extract URLs from text"""
    import re
    pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
    return re.findall(pattern, text)

def calculate_text_hash(text: str) -> str:
    """Calculate SHA256 hash of text"""
    return hashlib.sha256(text.encode()).hexdigest()

def save_json(data: Dict[str, Any], file_path: str) -> None:
    """Save data as JSON file"""
    try:
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2, default=str)
    except Exception as e:
        logger.error(f"Error saving JSON: {e}")
        raise

def load_json(file_path: str) -> Dict[str, Any]:
    """Load data from JSON file"""
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading JSON: {e}")
        raise

def merge_dicts(dict1: Dict, dict2: Dict) -> Dict:
    """Merge two dictionaries recursively"""
    result = dict1.copy()
    for key, value in dict2.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = merge_dicts(result[key], value)
        else:
            result[key] = value
    return result

def truncate_text(text: str, max_length: int = 1000) -> str:
    """Truncate text to maximum length"""
    if len(text) <= max_length:
        return text
    return text[:max_length] + "..."

def is_valid_file(file_path: str) -> bool:
    """Check if file exists and is valid"""
    if not os.path.exists(file_path):
        return False
    if os.path.getsize(file_path) > Config.MAX_FILE_SIZE:
        return False
    return True

def get_file_ext(file_path: str) -> str:
    """Get file extension"""
    return Path(file_path).suffix.lower()

def strip_markdown(text: Any) -> Any:
    """
    Recursively remove markdown formatting (like asterisks) from strings or collections
    """
    if isinstance(text, str):
        # Remove bold/italic asterisks
        return text.replace('**', '').replace('*', '').strip()
    elif isinstance(text, list):
        return [strip_markdown(item) for item in text]
    elif isinstance(text, dict):
        return {key: strip_markdown(value) for key, value in text.items()}
    return text

