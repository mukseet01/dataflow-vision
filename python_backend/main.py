
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import uvicorn
import os
import tempfile
import time
from typing import List, Optional
import shutil

from models.schemas import FileRequest, ProcessingResponse, AnalysisRequest, AnalysisResponse
from services.document_processor import process_document_handler
from services.analysis_service import process_analysis_request
from utils.temp_files import TEMP_DIR, cleanup_files
from config.settings import FILE_SIZE_LIMITS, MAX_ROWS_PER_SHEET

app = FastAPI(title="Document Processing API", 
              description="API for OCR, NER, and data analysis of various document types")

@app.post("/process", response_model=ProcessingResponse)
async def process_document(file_request: FileRequest, background_tasks: BackgroundTasks):
    """Process document and extract text and entities."""
    return await process_document_handler(file_request, background_tasks)

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_data(analysis_request: AnalysisRequest, background_tasks: BackgroundTasks):
    """Analyze data using PandasAI."""
    return await process_analysis_request(analysis_request, background_tasks)

@app.get("/health")
def health_check():
    """Health check endpoint."""
    import pytesseract
    import spacy
    
    packages = {"tesseract": "", "spacy": "", "pandas": "", "pandasai": ""}
    
    try:
        import pandas
        packages["pandas"] = pandas.__version__
    except ImportError:
        packages["pandas"] = "not installed"
        
    try:
        import pandasai
        packages["pandasai"] = pandasai.__version__
    except ImportError:
        packages["pandasai"] = "not installed"
    
    try:
        nlp = spacy.load("en_core_web_sm")
        packages["spacy"] = nlp.meta['name']
    except:
        packages["spacy"] = "failed to load"
    
    try:
        packages["tesseract"] = pytesseract.get_tesseract_version()
    except:
        packages["tesseract"] = "failed to load"
        
    return {
        "status": "healthy", 
        "packages": packages
    }

@app.on_event("startup")
async def startup_event():
    """Run on startup."""
    print(f"Temporary directory created at: {TEMP_DIR}")
    print(f"File size limits: {FILE_SIZE_LIMITS}")
    print(f"Max rows per sheet: {MAX_ROWS_PER_SHEET}")

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
