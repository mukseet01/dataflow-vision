
from fastapi import FastAPI, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import tempfile
import time
import json
import requests
from typing import List, Dict, Any, Optional
import shutil

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

def extract_entities(text: str) -> List[Dict[str, Any]]:
    """Extract entities from text - simplified version."""
    # In a real app, you would use a NER model like spaCy
    # This is a simplified version that looks for common patterns
    entities = []
    
    # Look for emails
    import re
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
    
    return entities

def detect_language(text: str) -> str:
    """Detect language of the text - simplified."""
    # In a real app, you'd use a library like langdetect
    # For now, we'll just assume English
    return "en"

def create_dataframe_summary(text: str) -> Dict[str, Any]:
    """Create a simple data structure from text."""
    # In a real app, you'd parse CSV/Excel or extract tables from PDFs
    
    # Create a simple data structure with mock data
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
        
        # Process file based on type - simplified for demo
        text = ""
        
        # For demo purposes, we'll just read text files
        # In a real app, you'd need libraries for PDF, images, Excel, etc.
        if file_request.file_type == "text/plain":
            text = process_text_file(file_path)
        else:
            # For this demo, for non-text files we'll just return a placeholder
            text = f"This is simulated text extraction from {file_request.file_name}"
        
        # Extract entities
        entities = extract_entities(text)
        
        # Create entities summary
        entities_summary = {}
        for entity in entities:
            if entity["type"] not in entities_summary:
                entities_summary[entity["type"]] = []
            if entity["value"] not in entities_summary[entity["type"]]:
                entities_summary[entity["type"]].append(entity["value"])
        
        # Create mock data frame
        data_frame = create_dataframe_summary(text)
        
        # Detect language
        detected_language = detect_language(text)
        
        # Processing metadata
        metadata = {
            "processing_time": time.time() - start_time,
            "character_count": len(text),
            "entity_count": len(entities),
            "processing_timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "processor": "FastAPI Demo Backend"
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

@app.get("/")
def read_root():
    return {"status": "OK", "message": "Document Processing API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Log the request details for debugging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    # Get request body if it exists
    body = b""
    if request.method in ["POST", "PUT"]:
        body = await request.body()
        await request.body()  # Reset the body position
    
    # Process the request
    response = await call_next(request)
    
    # Log details
    duration = time.time() - start_time
    print(f"Request: {request.method} {request.url} - Duration: {duration:.2f}s")
    if body:
        try:
            json_body = json.loads(body)
            print(f"Request Body: {json.dumps(json_body)[:200]}...")
        except:
            print(f"Request Body: [not JSON or error parsing]")
    
    return response

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting FastAPI server on port {port}")
    print(f"Temporary directory: {TEMP_DIR}")
    uvicorn.run("fastapi_backend:app", host="0.0.0.0", port=port, reload=True)
