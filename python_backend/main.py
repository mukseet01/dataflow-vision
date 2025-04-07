
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import uvicorn
import os
import tempfile
import time
from typing import List, Optional
import shutil

from models.schemas import FileRequest, ProcessingResponse
from services.document_processor import process_document_handler
from utils.temp_files import TEMP_DIR, cleanup_files
from config.settings import FILE_SIZE_LIMITS, MAX_ROWS_PER_SHEET

app = FastAPI(title="Document Processing API", 
              description="API for OCR and NER processing of various document types")

@app.post("/process", response_model=ProcessingResponse)
async def process_document(file_request: FileRequest, background_tasks: BackgroundTasks):
    """Process document and extract text and entities."""
    return await process_document_handler(file_request, background_tasks)

@app.get("/health")
def health_check():
    """Health check endpoint."""
    import pytesseract
    import spacy
    nlp = spacy.load("en_core_web_sm")
    return {
        "status": "healthy", 
        "tesseract_version": pytesseract.get_tesseract_version(),
        "spacy_model": nlp.meta['name']
    }

@app.on_event("startup")
async def startup_event():
    """Run on startup."""
    print(f"Temporary directory created at: {TEMP_DIR}")
    print(f"File size limits: {FILE_SIZE_LIMITS}")
    print(f"Max rows per sheet: {MAX_ROWS_PER_SHEET}")
    
    import pytesseract
    import spacy
    nlp = spacy.load("en_core_web_sm")
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
