
# Docker Testing Guide

This guide explains how to test the complete application (frontend and backend) using Docker.

## Prerequisites

- Docker and Docker Compose installed on your system
- Supabase project credentials
- OpenAI API key (for AI processing features)

## Setup Instructions

1. Create an environment file for Docker:

   ```bash
   cp .env.docker.example .env
   ```

2. Edit the `.env` file with your actual credentials:
   - Add your Supabase URL and keys
   - Add your OpenAI API key

3. Start the Docker services:

   ```bash
   docker-compose up -d
   ```

4. Test the services using the provided script:

   ```bash
   chmod +x test-docker-setup.sh
   ./test-docker-setup.sh
   ```

## Testing Workflow

### 1. Access the Application

- Frontend: http://localhost:3000
- Backend: http://localhost:8000

### 2. Test Data Entry Flow

1. Log in to the application
2. Navigate to the Data Entry page
3. Upload test documents (PDF, images, spreadsheets)
4. Verify processing status

### 3. Test Analysis Flow

1. Navigate to the Analysis page
2. Select processed documents
3. Run analysis queries
4. View and export results

### 4. Monitoring and Debugging

View logs for both services:

```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f fastapi-backend

# Frontend only
docker-compose logs -f frontend
```

## Stopping the Services

```bash
docker-compose down
```

To remove volumes as well:

```bash
docker-compose down -v
```

## Manual Testing Endpoints

### Backend Health Check

```bash
curl http://localhost:8000/health
```

### Document Processing Test

```bash
curl -X POST http://localhost:8000/process \
  -H "Content-Type: application/json" \
  -d '{
    "file_id": "test-id",
    "file_url": "https://example.com/sample.pdf",
    "file_name": "sample.pdf",
    "file_type": "application/pdf"
  }'
```

### Data Analysis Test

```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "request_id": "test-request",
    "file_url": "https://example.com/sample.csv",
    "file_name": "sample.csv",
    "file_type": "text/csv",
    "prompt": "Analyze trends in this data",
    "api_key": "your-openai-api-key"
  }'
```
