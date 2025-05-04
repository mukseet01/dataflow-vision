
from fastapi import FastAPI, HTTPException, BackgroundTasks, Request, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
import os
import tempfile
import time
import json
import requests
from typing import List, Dict, Any, Optional
import shutil
import re
from datetime import datetime

# Create FastAPI app
app = FastAPI(title="Document Processing API")

# Configure CORS to allow requests from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a temp directory for file operations
TEMP_DIR = tempfile.mkdtemp(prefix="document_processor_")

# Models for request/response
class FileRequest(BaseModel):
    file_id: str
    file_url: str
    file_type: str
    file_name: str

class EntityModel(BaseModel):
    type: str
    value: str
    confidence: Optional[float] = None
    page_number: Optional[int] = None
    position: Optional[Dict[str, Any]] = None

class ProcessingResponse(BaseModel):
    file_id: str
    full_text: Optional[str] = None
    detected_language: Optional[str] = None
    entities: List[Dict[str, Any]] = []
    entities_summary: Optional[Dict[str, List[str]]] = None
    data_frame: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None

# File size limits in MB
FILE_SIZE_LIMITS = {
    "application/pdf": 50,
    "image/png": 10,
    "image/jpeg": 10,
    "text/csv": 10,
    "application/vnd.ms-excel": 10,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": 20,
    "image/tiff": 20,
    "text/plain": 5,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": 10
}

# Helper functions
def cleanup_files(file_paths: List[str]) -> None:
    """Clean up temporary files."""
    for file_path in file_paths:
        try:
            if os.path.exists(file_path):
                if os.path.isdir(file_path):
                    shutil.rmtree(file_path)
                else:
                    os.remove(file_path)
        except Exception as e:
            print(f"Error cleaning up {file_path}: {str(e)}")

def download_file(file_url: str, file_name: str) -> str:
    """Download file from URL to temporary location."""
    response = requests.get(file_url, stream=True)
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to download file")
    
    file_path = os.path.join(TEMP_DIR, file_name)
    with open(file_path, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    
    return file_path

def save_upload_file(upload_file: UploadFile) -> str:
    """Save uploaded file to temporary location."""
    file_path = os.path.join(TEMP_DIR, upload_file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    return file_path

def check_file_size(file_path: str, file_type: str) -> bool:
    """Check if file size is within limits."""
    if file_type not in FILE_SIZE_LIMITS:
        return False
    
    file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
    return file_size_mb <= FILE_SIZE_LIMITS.get(file_type, 5)

# Document processing functions
def process_text_file(file_path: str) -> str:
    """Extract text from a text file."""
    with open(file_path, 'r', errors='ignore') as f:
        return f.read()

def process_docx_file(file_path: str) -> str:
    """Extract text from a Word document."""
    try:
        from docx import Document
        doc = Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs])
    except ImportError:
        return "Python-docx not installed. Cannot process Word documents."
    except Exception as e:
        return f"Error processing Word document: {str(e)}"

def process_excel_file(file_path: str) -> str:
    """Extract text from Excel file."""
    try:
        import pandas as pd
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
        else:  # xlsx or xls
            df = pd.read_excel(file_path)
        return df.to_string()
    except ImportError:
        return "Pandas not installed. Cannot process Excel files."
    except Exception as e:
        return f"Error processing Excel file: {str(e)}"

def extract_entities(text: str) -> List[Dict[str, Any]]:
    """Extract entities from text - simplified version."""
    entities = []
    
    # Look for emails
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    for match in re.finditer(email_pattern, text):
        entities.append({
            "type": "EMAIL",
            "value": match.group(0),
            "confidence": 0.9
        })
    
    # Look for dates
    date_pattern = r'\b\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}\b'
    for match in re.finditer(date_pattern, text):
        entities.append({
            "type": "DATE",
            "value": match.group(0),
            "confidence": 0.8
        })
    
    # Look for phone numbers
    phone_pattern = r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b'
    for match in re.finditer(phone_pattern, text):
        entities.append({
            "type": "PHONE_NUMBER",
            "value": match.group(0),
            "confidence": 0.85
        })
    
    # Look for monetary amounts
    money_pattern = r'\$\s*\d+(?:\.\d{2})?'
    for match in re.finditer(money_pattern, text):
        entities.append({
            "type": "MONEY",
            "value": match.group(0),
            "confidence": 0.9
        })
    
    # Look for addresses (very simplified)
    address_pattern = r'\b\d+\s+[A-Za-z0-9\s,]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln|way|parkway|pkwy)\b'
    for match in re.finditer(address_pattern, text, re.IGNORECASE):
        entities.append({
            "type": "ADDRESS",
            "value": match.group(0),
            "confidence": 0.7
        })
    
    return entities

def detect_language(text: str) -> str:
    """Detect language of the text."""
    try:
        from langdetect import detect
        return detect(text) if text else "unknown"
    except ImportError:
        return "en"  # Default to English if langdetect is not installed
    except Exception as e:
        print(f"Error detecting language: {str(e)}")
        return "unknown"

def create_dataframe_summary(text: str, file_path: str = None) -> Dict[str, Any]:
    """Create a data structure from text or a structured data file."""
    try:
        import pandas as pd
        
        # If we have a file path and it's a structured data file
        if file_path and (file_path.endswith('.csv') or file_path.endswith('.xlsx') or file_path.endswith('.xls')):
            if file_path.endswith('.csv'):
                df = pd.read_csv(file_path)
            else:
                df = pd.read_excel(file_path)
                
            # Get basic dataframe info
            rows, cols = df.shape
            headers = df.columns.tolist()
            
            # Create a sample of data rows
            sample_rows = df.head(5).values.tolist()
            
            return {
                "headers": headers,
                "sheets": [
                    {
                        "name": "Sheet1",
                        "row_count": rows,
                        "column_count": cols,
                        "rows": sample_rows
                    }
                ],
                "total_rows": rows,
                "sheet_count": 1
            }
        
        # If no structured data file, create mock data
        return {
            "headers": ["Name", "Email", "Phone"],
            "sheets": [
                {
                    "name": "Sheet1",
                    "row_count": 1,
                    "column_count": 3,
                    "rows": [
                        ["Sample Name", "sample@example.com", "123-456-7890"]
                    ]
                }
            ],
            "total_rows": 1,
            "sheet_count": 1
        }
    except ImportError:
        # If pandas is not available, return mock data
        return {
            "headers": ["Column1", "Column2", "Column3"],
            "sheets": [
                {
                    "name": "Sheet1",
                    "row_count": 1,
                    "column_count": 3,
                    "rows": [
                        ["Pandas not installed", "Cannot process", "structured data"]
                    ]
                }
            ],
            "total_rows": 1,
            "sheet_count": 1
        }
    except Exception as e:
        print(f"Error creating dataframe summary: {str(e)}")
        return {
            "headers": ["Error"],
            "sheets": [
                {
                    "name": "Error",
                    "row_count": 1,
                    "column_count": 1,
                    "rows": [
                        [f"Error: {str(e)}"]
                    ]
                }
            ],
            "total_rows": 1,
            "sheet_count": 1
        }

@app.post("/process", response_model=ProcessingResponse)
async def process_document(file_request: FileRequest, background_tasks: BackgroundTasks):
    """Process document and extract text and entities."""
    start_time = time.time()
    temp_files = []
    
    try:
        print(f"Processing request for file: {file_request.file_name}")
        
        # Download file
        file_path = download_file(file_request.file_url, file_request.file_name)
        temp_files.append(file_path)
        
        # Check file size
        if not check_file_size(file_path, file_request.file_type):
            raise HTTPException(status_code=400, detail=f"File exceeds size limit for {file_request.file_type}")
        
        # Process file based on type
        text = ""
        
        if file_request.file_type == "text/plain":
            text = process_text_file(file_path)
        elif file_request.file_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            text = process_docx_file(file_path)
        elif file_request.file_type in ["text/csv", "application/vnd.ms-excel", 
                                     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]:
            text = process_excel_file(file_path)
        elif file_request.file_type in ["application/pdf", "image/png", "image/jpeg", "image/tiff"]:
            # For demo purposes, simulate text extraction from PDFs and images
            text = f"[Simulated extraction] This is text extracted from the {file_request.file_name} file."
            # In a real implementation, you'd use libraries like PyPDF2, pdf2image + pytesseract, etc.
        else:
            text = f"Unsupported file type: {file_request.file_type}. This is a placeholder text."
        
        # Extract entities
        entities = extract_entities(text)
        
        # Create entities summary
        entities_summary = {}
        for entity in entities:
            if entity["type"] not in entities_summary:
                entities_summary[entity["type"]] = []
            if entity["value"] not in entities_summary[entity["type"]]:
                entities_summary[entity["type"]].append(entity["value"])
        
        # Create data frame
        data_frame = create_dataframe_summary(text, file_path)
        
        # Detect language
        detected_language = detect_language(text)
        
        # Processing metadata
        metadata = {
            "processing_time": time.time() - start_time,
            "character_count": len(text),
            "entity_count": len(entities),
            "processing_timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "processor": "FastAPI Backend"
        }
        
        # Background task to clean up files
        background_tasks.add_task(cleanup_files, temp_files)
        
        print(f"Successfully processed file: {file_request.file_name}")
        
        return ProcessingResponse(
            file_id=file_request.file_id,
            full_text=text,
            detected_language=detected_language,
            entities=entities,
            entities_summary=entities_summary,
            data_frame=data_frame,
            metadata=metadata
        )
        
    except Exception as e:
        # Clean up any temporary files
        background_tasks.add_task(cleanup_files, temp_files)
        print(f"Error processing file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload")
async def upload_file(file: UploadFile = File(...), file_id: str = Form(...)):
    """Direct file upload endpoint"""
    try:
        # Save the uploaded file
        file_path = save_upload_file(file)
        
        # Get the file type
        file_type = file.content_type or "application/octet-stream"
        
        # Process based on file type - this is a simplified example
        text = "File uploaded successfully. Add processing logic here."
        
        # Return response
        return {
            "file_id": file_id,
            "file_name": file.filename,
            "file_type": file_type,
            "size": os.path.getsize(file_path),
            "message": "File uploaded successfully",
            "sample_text": text[:100] + "..." if len(text) > 100 else text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"status": "OK", "message": "Document Processing API is running"}

@app.get("/health")
def health_check():
    # Check installed packages
    installed_packages = {}
    try:
        from docx import Document
        installed_packages["python-docx"] = "installed"
    except:
        installed_packages["python-docx"] = "not installed"
    
    try:
        import pandas as pd
        installed_packages["pandas"] = pd.__version__
    except:
        installed_packages["pandas"] = "not installed"
    
    try:
        from langdetect import detect
        installed_packages["langdetect"] = "installed"
    except:
        installed_packages["langdetect"] = "not installed"
    
    return {
        "status": "healthy",
        "temp_directory": TEMP_DIR,
        "packages": installed_packages,
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

# Log the request details for debugging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    # Process the request
    response = await call_next(request)
    
    # Log details
    duration = time.time() - start_time
    print(f"Request: {request.method} {request.url} - Duration: {duration:.2f}s")
    
    return response

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting FastAPI server on port {port}")
    print(f"Temporary directory: {TEMP_DIR}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
