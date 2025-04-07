
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import uvicorn
import os
import tempfile
import shutil
import requests
import io
from typing import List, Dict, Any, Optional
import pandas as pd
import cv2
import numpy as np
import pytesseract
from PIL import Image
import spacy
import re
from docx import Document
import time
import math

# Load spaCy NER model
try:
    nlp = spacy.load("en_core_web_sm")
except:
    os.system("python -m spacy download en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

app = FastAPI(title="Document Processing API", 
              description="API for OCR and NER processing of various document types")

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

# Maximum number of rows per sheet
MAX_ROWS_PER_SHEET = 1000

# Create temporary directory for file processing
TEMP_DIR = tempfile.mkdtemp()

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

class SheetInfo(BaseModel):
    name: str
    row_count: int
    column_count: int

class DataFrameOutput(BaseModel):
    headers: List[str]
    sheets: List[Dict[str, Any]]
    total_rows: int
    sheet_count: int

class ProcessingResponse(BaseModel):
    file_id: str
    full_text: Optional[str] = None
    detected_language: Optional[str] = None
    entities: List[EntityModel] = []
    entities_summary: Optional[Dict[str, List[str]]] = None
    data_frame: Optional[DataFrameOutput] = None
    metadata: Optional[Dict[str, Any]] = None
    temp_files: List[str] = []

def check_file_size(file_path: str, file_type: str) -> bool:
    """Check if file size is within limits."""
    if file_type not in FILE_SIZE_LIMITS:
        return False
    
    file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
    return file_size_mb <= FILE_SIZE_LIMITS.get(file_type, 5)

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

def extract_text_from_pdf(file_path: str) -> tuple:
    """Extract text from PDF and convert pages to images."""
    try:
        import fitz  # PyMuPDF
        
        doc = fitz.open(file_path)
        text = ""
        images = []
        
        for page_num, page in enumerate(doc):
            # Extract text
            text += page.get_text()
            
            # Convert to image
            pix = page.get_pixmap(matrix=fitz.Matrix(300/72, 300/72))
            img_path = f"{file_path}_page_{page_num}.png"
            pix.save(img_path)
            images.append(img_path)
        
        return text, images
    except Exception as e:
        print(f"Error extracting text from PDF: {str(e)}")
        return "", []

def process_image_with_ocr(image_path: str) -> str:
    """Process image with Tesseract OCR."""
    try:
        # Read image
        img = cv2.imread(image_path)
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply thresholding
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Save processed image
        processed_img_path = f"{image_path}_processed.png"
        cv2.imwrite(processed_img_path, thresh)
        
        # Use Tesseract for OCR
        text = pytesseract.image_to_string(Image.open(processed_img_path))
        
        return text
    except Exception as e:
        print(f"Error processing image with OCR: {str(e)}")
        return ""

def extract_entities_with_ner(text: str) -> List[EntityModel]:
    """Extract entities using spaCy NER."""
    entities = []
    doc = nlp(text)
    
    # Process named entities
    for ent in doc.ents:
        entities.append(EntityModel(
            type=ent.label_,
            value=ent.text,
            confidence=0.85,  # Default confidence
            position={
                "start": ent.start_char,
                "end": ent.end_char
            }
        ))
    
    # Add custom regex patterns for common data types
    patterns = {
        "EMAIL": r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        "PHONE": r'\b(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b',
        "DATE": r'\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b',
        "ADDRESS": r'\b\d+\s+[A-Za-z0-9\s,]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|court|ct|lane|ln|way|parkway|pkwy)\b',
        "MONEY": r'\$\s*\d+(?:\.\d{2})?'
    }
    
    for entity_type, pattern in patterns.items():
        for match in re.finditer(pattern, text, re.IGNORECASE):
            entities.append(EntityModel(
                type=entity_type,
                value=match.group(),
                confidence=0.9,
                position={
                    "start": match.start(),
                    "end": match.end()
                }
            ))
    
    return entities

def create_dataframe_from_entities(entities: List[EntityModel]) -> DataFrameOutput:
    """Create a pandas DataFrame from extracted entities with pagination."""
    # Group entities by type
    entity_groups = {}
    for entity in entities:
        if entity.type not in entity_groups:
            entity_groups[entity.type] = []
        entity_groups[entity.type].append(entity.value)
    
    # Create headers
    headers = list(entity_groups.keys())
    
    # Find the maximum number of entities in any group
    max_entities = max([len(group) for group in entity_groups.values()], default=0)
    
    # Calculate number of sheets needed
    sheet_count = math.ceil(max_entities / MAX_ROWS_PER_SHEET)
    sheets = []
    
    for sheet_idx in range(sheet_count):
        start_idx = sheet_idx * MAX_ROWS_PER_SHEET
        end_idx = min((sheet_idx + 1) * MAX_ROWS_PER_SHEET, max_entities)
        
        sheet_rows = []
        for i in range(start_idx, end_idx):
            row = []
            for entity_type in headers:
                if i < len(entity_groups[entity_type]):
                    row.append(entity_groups[entity_type][i])
                else:
                    row.append("")
            sheet_rows.append(row)
        
        sheets.append({
            "name": f"Sheet{sheet_idx + 1}",
            "rows": sheet_rows,
            "row_count": len(sheet_rows),
            "column_count": len(headers)
        })
    
    return DataFrameOutput(
        headers=headers,
        sheets=sheets,
        total_rows=max_entities,
        sheet_count=sheet_count
    )

def process_spreadsheet(file_path: str) -> tuple:
    """Process Excel or CSV files with pagination."""
    try:
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
        else:  # Excel files
            df = pd.read_excel(file_path)
        
        # Convert to text for entity extraction
        text = df.to_string()
        
        # Get headers
        headers = df.columns.tolist()
        
        # Calculate number of sheets needed
        total_rows = len(df)
        sheet_count = math.ceil(total_rows / MAX_ROWS_PER_SHEET)
        
        # Create sheets
        sheets = []
        for sheet_idx in range(sheet_count):
            start_idx = sheet_idx * MAX_ROWS_PER_SHEET
            end_idx = min((sheet_idx + 1) * MAX_ROWS_PER_SHEET, total_rows)
            
            sheet_df = df.iloc[start_idx:end_idx]
            
            sheets.append({
                "name": f"Sheet{sheet_idx + 1}",
                "rows": sheet_df.values.tolist(),
                "row_count": len(sheet_df),
                "column_count": len(headers)
            })
        
        data_frame = DataFrameOutput(
            headers=headers,
            sheets=sheets,
            total_rows=total_rows,
            sheet_count=sheet_count
        )
        
        return text, data_frame
    except Exception as e:
        print(f"Error processing spreadsheet: {str(e)}")
        return "", DataFrameOutput(headers=[], sheets=[], total_rows=0, sheet_count=0)

def process_docx(file_path: str) -> str:
    """Process Word documents."""
    try:
        doc = Document(file_path)
        text = "\n".join([para.text for para in doc.paragraphs])
        return text
    except Exception as e:
        print(f"Error processing Word document: {str(e)}")
        return ""

def detect_language(text: str) -> str:
    """Detect language of the text."""
    try:
        from langdetect import detect
        return detect(text) if text else "unknown"
    except:
        return "unknown"

def export_to_excel(data_frame: DataFrameOutput, output_path: str) -> str:
    """Export data to Excel with multiple sheets if needed."""
    try:
        with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
            for sheet in data_frame.sheets:
                # Create DataFrame for this sheet
                sheet_df = pd.DataFrame(sheet["rows"], columns=data_frame.headers)
                # Write to Excel
                sheet_df.to_excel(writer, sheet_name=sheet["name"], index=False)
        return output_path
    except Exception as e:
        print(f"Error exporting to Excel: {str(e)}")
        return ""

@app.post("/process", response_model=ProcessingResponse)
async def process_document(file_request: FileRequest, background_tasks: BackgroundTasks):
    """Process document and extract text and entities."""
    start_time = time.time()
    temp_files = []
    
    try:
        # Download file
        file_path = download_file(file_request.file_url, file_request.file_name)
        temp_files.append(file_path)
        
        # Check file size
        if not check_file_size(file_path, file_request.file_type):
            raise HTTPException(status_code=400, detail=f"File exceeds size limit for {file_request.file_type}")
        
        # Initialize variables
        text = ""
        data_frame = None
        
        # Process based on file type
        if file_request.file_type in ["application/pdf"]:
            # PDF processing
            pdf_text, images = extract_text_from_pdf(file_path)
            temp_files.extend(images)
            
            # If PDF has text, use it; otherwise, use OCR on the images
            if pdf_text.strip():
                text = pdf_text
            else:
                for img_path in images:
                    text += process_image_with_ocr(img_path)
                    
        elif file_request.file_type in ["image/png", "image/jpeg", "image/tiff"]:
            # Image processing with OCR
            text = process_image_with_ocr(file_path)
            
        elif file_request.file_type in ["text/csv", "application/vnd.ms-excel", 
                                      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]:
            # Spreadsheet processing
            sheet_text, data_frame = process_spreadsheet(file_path)
            text = sheet_text
            
        elif file_request.file_type == "text/plain":
            # Plain text processing
            with open(file_path, 'r', errors='ignore') as f:
                text = f.read()
                
        elif file_request.file_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            # Word document processing
            text = process_docx(file_path)
            
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")
        
        # Extract entities
        entities = extract_entities_with_ner(text)
        
        # Create entities summary
        entities_summary = {}
        for entity in entities:
            if entity.type not in entities_summary:
                entities_summary[entity.type] = []
            if entity.value not in entities_summary[entity.type]:  # Avoid duplicates
                entities_summary[entity.type].append(entity.value)
        
        # Create DataFrame if not already created
        if data_frame is None:
            data_frame = create_dataframe_from_entities(entities)
        
        # Detect language
        detected_language = detect_language(text)
        
        # Create Excel export if data_frame exists
        excel_output = None
        if data_frame and data_frame.total_rows > 0:
            excel_output = f"{file_path}_export.xlsx"
            export_to_excel(data_frame, excel_output)
            temp_files.append(excel_output)
        
        # Processing metadata
        metadata = {
            "processing_time": time.time() - start_time,
            "character_count": len(text),
            "entity_count": len(entities),
            "processing_timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "has_excel_export": excel_output is not None,
            "sheet_count": data_frame.sheet_count if data_frame else 0,
            "total_rows": data_frame.total_rows if data_frame else 0
        }
        
        # Background task to clean up files after processing
        background_tasks.add_task(cleanup_files, temp_files)
        
        return ProcessingResponse(
            file_id=file_request.file_id,
            full_text=text,
            detected_language=detected_language,
            entities=entities,
            entities_summary=entities_summary,
            data_frame=data_frame,
            metadata=metadata,
            temp_files=temp_files
        )
        
    except Exception as e:
        # Clean up any temporary files
        background_tasks.add_task(cleanup_files, temp_files)
        raise HTTPException(status_code=500, detail=str(e))

def cleanup_files(file_paths: List[str]):
    """Clean up temporary files after processing."""
    for file_path in file_paths:
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"Error removing file {file_path}: {str(e)}")

@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "tesseract_version": pytesseract.get_tesseract_version()}

@app.on_event("startup")
async def startup_event():
    """Run on startup."""
    print(f"Temporary directory created at: {TEMP_DIR}")
    print(f"File size limits: {FILE_SIZE_LIMITS}")
    print(f"Max rows per sheet: {MAX_ROWS_PER_SHEET}")
    print(f"Tesseract version: {pytesseract.get_tesseract_version()}")
    print(f"SpaCy model loaded: {nlp.meta['name']}")

@app.on_event("shutdown")
def shutdown_event():
    """Run on shutdown."""
    print(f"Cleaning up temporary directory: {TEMP_DIR}")
    try:
        shutil.rmtree(TEMP_DIR)
    except Exception as e:
        print(f"Error cleaning up temp directory: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
