
import cv2
import numpy as np
import pytesseract
from PIL import Image
import fitz  # PyMuPDF

def extract_text_from_pdf(file_path: str) -> tuple:
    """Extract text from PDF and convert pages to images."""
    try:
        doc = fitz.open(file_path)
        text = ""
        images = []
        
        for page_num, page in enumerate(doc):
            # Extract text
            text += page.get_text()
            
            # Convert to image
            pix = page.get_pixmap(matrix=fitz.Matrix(300/72, 300/72))
            img_path = f"{file_path}_page_{page_num}.png"
            pix.save(img_path)
            images.append(img_path)
        
        return text, images
    except Exception as e:
        print(f"Error extracting text from PDF: {str(e)}")
        return "", []

def process_image_with_ocr(image_path: str) -> str:
    """Process image with Tesseract OCR."""
    try:
        # Read image
        img = cv2.imread(image_path)
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply thresholding
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Save processed image
        processed_img_path = f"{image_path}_processed.png"
        cv2.imwrite(processed_img_path, thresh)
        
        # Use Tesseract for OCR
        text = pytesseract.image_to_string(Image.open(processed_img_path))
        
        return text
    except Exception as e:
        print(f"Error processing image with OCR: {str(e)}")
        return ""
