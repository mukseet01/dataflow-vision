
import os
import requests
from fastapi import HTTPException
from config.settings import FILE_SIZE_LIMITS
from utils.temp_files import TEMP_DIR

def check_file_size(file_path: str, file_type: str) -> bool:
    """Check if file size is within limits."""
    if file_type not in FILE_SIZE_LIMITS:
        return False
    
    file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
    return file_size_mb <= FILE_SIZE_LIMITS.get(file_type, 5)

def download_file(file_url: str, file_name: str) -> str:
    """Download file from URL to temporary location."""
    response = requests.get(file_url, stream=True)
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to download file")
    
    file_path = os.path.join(TEMP_DIR, file_name)
    with open(file_path, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    
    return file_path
