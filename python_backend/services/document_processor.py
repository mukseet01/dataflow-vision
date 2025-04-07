
import os
import time
from fastapi import BackgroundTasks, HTTPException
from typing import Dict, List, Any

from models.schemas import FileRequest, ProcessingResponse
from utils.file_utils import check_file_size, download_file
from utils.temp_files import cleanup_files
from services.ocr_service import extract_text_from_pdf, process_image_with_ocr
from services.ner_service import extract_entities_with_ner
from services.dataframe_service import create_dataframe_from_entities, process_spreadsheet, export_to_excel
from services.docx_service import process_docx
from services.language_service import detect_language

async def process_document_handler(file_request: FileRequest, background_tasks: BackgroundTasks) -> ProcessingResponse:
    """Process document and extract text and entities."""
    start_time = time.time()
    temp_files = []
    
    try:
        # Download file
        file_path = download_file(file_request.file_url, file_request.file_name)
        temp_files.append(file_path)
        
        # Check file size
        if not check_file_size(file_path, file_request.file_type):
            raise HTTPException(status_code=400, detail=f"File exceeds size limit for {file_request.file_type}")
        
        # Initialize variables
        text = ""
        data_frame = None
        
        # Process based on file type
        if file_request.file_type in ["application/pdf"]:
            # PDF processing
            pdf_text, images = extract_text_from_pdf(file_path)
            temp_files.extend(images)
            
            # If PDF has text, use it; otherwise, use OCR on the images
            if pdf_text.strip():
                text = pdf_text
            else:
                for img_path in images:
                    text += process_image_with_ocr(img_path)
                    
        elif file_request.file_type in ["image/png", "image/jpeg", "image/tiff"]:
            # Image processing with OCR
            text = process_image_with_ocr(file_path)
            
        elif file_request.file_type in ["text/csv", "application/vnd.ms-excel", 
                                      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]:
            # Spreadsheet processing
            sheet_text, data_frame = process_spreadsheet(file_path)
            text = sheet_text
            
        elif file_request.file_type == "text/plain":
            # Plain text processing
            with open(file_path, 'r', errors='ignore') as f:
                text = f.read()
                
        elif file_request.file_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            # Word document processing
            text = process_docx(file_path)
            
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")
        
        # Extract entities
        entities = extract_entities_with_ner(text)
        
        # Create entities summary
        entities_summary = {}
        for entity in entities:
            if entity.type not in entities_summary:
                entities_summary[entity.type] = []
            if entity.value not in entities_summary[entity.type]:  # Avoid duplicates
                entities_summary[entity.type].append(entity.value)
        
        # Create DataFrame if not already created
        if data_frame is None:
            data_frame = create_dataframe_from_entities(entities)
        
        # Detect language
        detected_language = detect_language(text)
        
        # Create Excel export if data_frame exists
        excel_output = None
        if data_frame and data_frame.total_rows > 0:
            excel_output = f"{file_path}_export.xlsx"
            export_to_excel(data_frame, excel_output)
            temp_files.append(excel_output)
        
        # Processing metadata
        metadata = {
            "processing_time": time.time() - start_time,
            "character_count": len(text),
            "entity_count": len(entities),
            "processing_timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "has_excel_export": excel_output is not None,
            "sheet_count": data_frame.sheet_count if data_frame else 0,
            "total_rows": data_frame.total_rows if data_frame else 0
        }
        
        # Background task to clean up files after processing
        background_tasks.add_task(cleanup_files, temp_files)
        
        return ProcessingResponse(
            file_id=file_request.file_id,
            full_text=text,
            detected_language=detected_language,
            entities=entities,
            entities_summary=entities_summary,
            data_frame=data_frame,
            metadata=metadata,
            temp_files=temp_files
        )
        
    except Exception as e:
        # Clean up any temporary files
        background_tasks.add_task(cleanup_files, temp_files)
        raise HTTPException(status_code=500, detail=str(e))
