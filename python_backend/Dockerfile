
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
    wget \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install dependencies with retry mechanism and explicit uvicorn install
RUN pip3 install --upgrade pip && \
    pip3 install --no-cache-dir uvicorn && \
    pip3 install --no-cache-dir -r requirements.txt

# Download spaCy model
RUN python3 -m spacy download en_core_web_sm || echo "SpaCy model download may have failed, will try again at runtime"

# Copy application code
COPY . .

# Create temp and logs directories with appropriate permissions
RUN mkdir -p /app/temp/uploads /app/temp/exports /app/logs && \
    chmod -R 777 /app/temp /app/logs

# Expose port
EXPOSE ${PORT:-8000}

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV TEMP_DIR=/app/temp
ENV MAX_WORKERS=2
ENV LOG_LEVEL=info
ENV ALLOWED_ORIGINS="*"

# Add which command to help debug PATH issues
RUN apt-get update && apt-get install -y which && which python3 && whereis python3

# Command to run the application - using absolute path to Python
CMD ["/usr/local/bin/python3", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "${PORT:-8000}"]
