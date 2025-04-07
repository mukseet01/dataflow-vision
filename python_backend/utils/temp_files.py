
import os
import tempfile
import shutil
from typing import List

# Create a temporary directory for file operations
TEMP_DIR = tempfile.mkdtemp(prefix="document_processor_")

def cleanup_files(file_paths: List[str]) -> None:
    """Clean up temporary files."""
    for file_path in file_paths:
        try:
            if os.path.exists(file_path):
                if os.path.isdir(file_path):
                    shutil.rmtree(file_path)
                else:
                    os.remove(file_path)
        except Exception as e:
            print(f"Error cleaning up {file_path}: {str(e)}")
