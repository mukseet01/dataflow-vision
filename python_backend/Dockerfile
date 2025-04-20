
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    tesseract-ocr-eng \
    poppler-utils \
    libgl1-mesa-glx \
    libglib2.0-0 \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies with better error handling
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt || (echo "pip install failed" && exit 1)

# Download spaCy model with error handling
RUN python -m spacy download en_core_web_sm || (echo "spaCy model download failed" && exit 1)

# Copy application code
COPY . .

# Create temp and logs directories
RUN mkdir -p /app/temp/uploads /app/temp/exports /app/logs

# Expose port
EXPOSE 8000

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV TEMP_DIR=/app/temp
ENV MAX_WORKERS=2
ENV LOG_LEVEL=debug
ENV ALLOWED_ORIGINS="*"
ENV OPENAI_API_KEY=${OPENAI_API_KEY:-""}

# Add improved healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=20s --retries=5 \
  CMD curl -f http://localhost:8000/health || exit 1

# Command to run the application with improved error handling and logging
CMD ["sh", "-c", "echo 'Starting FastAPI backend...' && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --workers ${MAX_WORKERS:-1} --log-level ${LOG_LEVEL:-info} 2>&1 | tee /app/logs/app.log || (echo 'Application failed to start' && cat /app/logs/*.log 2>/dev/null || echo 'No logs found')"]
