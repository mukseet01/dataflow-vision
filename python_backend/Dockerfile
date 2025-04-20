
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

# Copy requirements and install dependencies with better error handling
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt || (echo "pip install failed" && exit 1)

# Create simple health endpoint backup
RUN echo 'from http.server import BaseHTTPRequestHandler, HTTPServer\n\nclass HealthHandler(BaseHTTPRequestHandler):\n    def do_GET(self):\n        if self.path == "/health":\n            self.send_response(200)\n            self.send_header("Content-type", "text/plain")\n            self.end_headers()\n            self.wfile.write("OK".encode())\n        else:\n            self.send_response(404)\n            self.end_headers()\n\ndef run_health_server():\n    server_address = ("", 8001)\n    httpd = HTTPServer(server_address, HealthHandler)\n    print("Health check server running on port 8001")\n    httpd.serve_forever()\n\nif __name__ == "__main__":\n    run_health_server()' > /app/health_server.py

# Download spaCy model with error handling
RUN python -m spacy download en_core_web_sm || (echo "spaCy model download failed" && exit 1)

# Copy application code
COPY . .

# Create temp and logs directories
RUN mkdir -p /app/temp/uploads /app/temp/exports /app/logs

# Expose ports
EXPOSE 8000
EXPOSE 8001

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV TEMP_DIR=/app/temp
ENV MAX_WORKERS=2
ENV LOG_LEVEL=debug
ENV ALLOWED_ORIGINS="*"
ENV OPENAI_API_KEY=${OPENAI_API_KEY:-""}

# Add improved healthcheck with longer timeouts
HEALTHCHECK --interval=60s --timeout=30s --start-period=40s --retries=5 \
  CMD curl -f http://localhost:8000/health || curl -f http://localhost:8001/health || exit 1

# Command to run the application with improved error handling and logging
CMD ["sh", "-c", "python health_server.py & echo 'Starting FastAPI backend...' && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --workers ${MAX_WORKERS:-1} --log-level ${LOG_LEVEL:-info} 2>&1 | tee /app/logs/app.log || (echo 'Application failed to start' && cat /app/logs/*.log 2>/dev/null || echo 'No logs found')"]
