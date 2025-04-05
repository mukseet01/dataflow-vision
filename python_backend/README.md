
# Document Processing Backend

This is a FastAPI-based backend service for document processing, OCR, and named entity recognition.

## Features

- Document uploading with file size limits
- OCR for PDF and image files using Tesseract
- Text extraction from Word documents and spreadsheets
- Named Entity Recognition (NER) using spaCy
- Structured data extraction and DataFrame creation
- Temporary file management with automatic cleanup

## Setup and Deployment

### Option 1: Docker

1. Build the Docker image:
   ```
   docker build -t document-processor .
   ```

2. Run the container:
   ```
   docker run -p 8000:8000 document-processor
   ```

### Option 2: Manual Setup

1. Install system dependencies:
   ```
   apt-get update && apt-get install -y tesseract-ocr libtesseract-dev tesseract-ocr-eng poppler-utils
   ```

2. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Download spaCy model:
   ```
   python -m spacy download en_core_web_sm
   ```

4. Run the application:
   ```
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

## API Endpoints

- `POST /process`: Process a document and extract text, entities, and structured data
- `GET /health`: Health check endpoint

## File Size Limits

- PDF: 50MB
- PNG/JPG: 10MB
- CSV/XLS: 10MB
- XLSX: 20MB
- TIFF: 20MB
- TXT: 5MB
- DOCX: 10MB

## Deployment Notes

When deploying this service, make sure to:
1. Set up proper authentication/authorization
2. Configure appropriate scaling based on expected load
3. Ensure the service is accessible from your Supabase Edge Function
