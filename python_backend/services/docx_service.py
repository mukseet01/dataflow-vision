
from docx import Document

def process_docx(file_path: str) -> str:
    """Process Word documents."""
    try:
        doc = Document(file_path)
        text = "\n".join([para.text for para in doc.paragraphs])
        return text
    except Exception as e:
        print(f"Error processing Word document: {str(e)}")
        return ""
