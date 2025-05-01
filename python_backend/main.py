
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import tempfile
import time
from typing import List, Optional
import shutil

from models.schemas import FileRequest, ProcessingResponse, AnalysisRequest, AnalysisResponse, ExportRequest, ExportResponse
from services.document_processor import process_document_handler
from services.analysis_service import process_analysis_request
from services.export_service import generate_export
from utils.temp_files import TEMP_DIR, cleanup_files
from config.settings import FILE_SIZE_LIMITS, MAX_ROWS_PER_SHEET

app = FastAPI(title="Document Processing API", 
              description="API for OCR, NER, and data analysis of various document types")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/process", response_model=ProcessingResponse)
async def process_document(file_request: FileRequest, background_tasks: BackgroundTasks):
    """Process document and extract text and entities."""
    return await process_document_handler(file_request, background_tasks)

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_data(analysis_request: AnalysisRequest, background_tasks: BackgroundTasks):
    """Analyze data using PandasAI."""
    return await process_analysis_request(analysis_request, background_tasks)

@app.post("/export", response_model=ExportResponse)
async def export_analysis(export_request: ExportRequest, background_tasks: BackgroundTasks):
    """Export analysis data to various document formats."""
    return await generate_export(export_request, background_tasks)

# Root endpoint for health checks - Railway expects this
@app.get("/")
def root_health_check():
    """Root health check endpoint."""
    return {"status": "ok"}

# Health check endpoint at /health
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

# API health check endpoint
@app.get("/api/health")
def api_health_check():
    """API health check endpoint."""
    return {"status": "ok"}

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
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
