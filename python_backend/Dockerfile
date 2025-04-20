
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

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download spaCy model
RUN python -m spacy download en_core_web_sm

# Copy application code
COPY . .

# Create temp directories
RUN mkdir -p /app/temp/uploads /app/temp/exports

# Expose port
EXPOSE 8000

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV TEMP_DIR=/app/temp
ENV MAX_WORKERS=4
ENV LOG_LEVEL=info
ENV ALLOWED_ORIGINS="*"
ENV OPENAI_API_KEY=${OPENAI_API_KEY:-""}

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Command to run the application with improved error handling
CMD ["sh", "-c", "python -m uvicorn main:app --host 0.0.0.0 --port 8000 --workers ${MAX_WORKERS:-1} --log-level ${LOG_LEVEL:-info} || (echo 'Application failed to start' && cat error.log* 2>/dev/null || echo 'No error logs found')"]
