
import os
import tempfile

# Create temporary directory for file processing
TEMP_DIR = tempfile.mkdtemp()

def cleanup_files(file_paths):
    """Clean up temporary files after processing."""
    for file_path in file_paths:
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"Error removing file {file_path}: {str(e)}")
