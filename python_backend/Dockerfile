
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

# Install dependencies with retry mechanism
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt || \
    (echo "Retrying pip install" && pip install --no-cache-dir -r requirements.txt)

# Create simple health endpoint
RUN echo 'from http.server import BaseHTTPRequestHandler, HTTPServer\n\nclass HealthHandler(BaseHTTPRequestHandler):\n    def do_GET(self):\n        if self.path == "/health":\n            self.send_response(200)\n            self.send_header("Content-type", "text/plain")\n            self.end_headers()\n            self.wfile.write("OK".encode())\n        else:\n            self.send_response(404)\n            self.end_headers()\n\ndef run_health_server():\n    server_address = ("", 8001)\n    httpd = HTTPServer(server_address, HealthHandler)\n    print("Health check server running on port 8001")\n    httpd.serve_forever()\n\nif __name__ == "__main__":\n    run_health_server()' > /app/health_server.py

# Download spaCy model
RUN python -m spacy download en_core_web_sm || echo "SpaCy model download may have failed, will try again at runtime"

# Copy application code
COPY . .

# Create temp and logs directories with appropriate permissions
RUN mkdir -p /app/temp/uploads /app/temp/exports /app/logs && \
    chmod -R 777 /app/temp /app/logs

# Expose ports
EXPOSE 8000
EXPOSE 8001

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV TEMP_DIR=/app/temp
ENV MAX_WORKERS=2
ENV LOG_LEVEL=debug
ENV ALLOWED_ORIGINS="*"

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8000/health || curl -f http://localhost:8001/health || exit 1

# Command to run the application
CMD ["sh", "-c", "python health_server.py & python -m uvicorn main:app --host 0.0.0.0 --port 8000 --workers ${MAX_WORKERS:-1} --log-level ${LOG_LEVEL:-info}"]
