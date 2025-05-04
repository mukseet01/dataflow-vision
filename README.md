
# Document Processing Application

This fullstack application is designed to process documents using FastAPI and React. It's structured to be easily deployable on Replit for development and testing.

## Project Structure

### Frontend (React + TypeScript)
- `src/components/data-entry/`: Components for data entry and file upload
- `src/services/uploadService.ts`: Service for communicating with the FastAPI backend
- `src/hooks/`: Custom React hooks including file upload and processing logic

### Backend (FastAPI)
- `fastapi_backend.py`: Main FastAPI application with document processing endpoints
- `fastapi_requirements.txt`: Python dependencies for the FastAPI backend
- `python_backend/`: More comprehensive backend code with additional processing capabilities

## Setting Up on Replit

This project is designed to be run on two separate Replit instances:
- One for the FastAPI backend
- One for the React frontend

Please refer to `FASTAPI_REPLIT_SETUP.md` for detailed instructions on setting up both parts on Replit.

## Features

- File upload and validation
- Document text extraction
- Entity recognition (emails, dates, phone numbers, etc.)
- Structured data processing (CSV, Excel)
- Language detection
- Data visualization and export

## Development

1. Set up the backend and frontend on separate Replit instances as described in the setup guide
2. Update the `FASTAPI_BACKEND_URL` in `src/services/uploadService.ts` to point to your backend Repl
3. Test the integration using the data entry page

## Todo

- Implement OCR for PDF and image files
- Add authentication
- Improve entity extraction with machine learning models
- Add more export formats
