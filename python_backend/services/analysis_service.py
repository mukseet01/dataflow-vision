
import os
import time
from typing import Dict, Any, Optional
from fastapi import BackgroundTasks, HTTPException
from models.schemas import AnalysisRequest, AnalysisResponse
from utils.file_utils import download_file, check_file_size
from utils.temp_files import cleanup_files
from utils.pandas_ai_utils import analyze_data_with_pandasai, get_data_preview

async def process_analysis_request(analysis_request: AnalysisRequest, background_tasks: BackgroundTasks) -> AnalysisResponse:
    """Process data analysis request using PandasAI."""
    start_time = time.time()
    temp_files = []
    
    try:
        # Download file
        file_path = download_file(analysis_request.file_url, analysis_request.file_name)
        temp_files.append(file_path)
        
        # Check file size (limit to 50MB for analysis)
        if os.path.getsize(file_path) > 50 * 1024 * 1024:  # 50MB
            raise HTTPException(status_code=400, detail="File too large for analysis (max 50MB)")
            
        # Get data preview
        preview = get_data_preview(file_path)
        
        # Run the analysis
        result = analyze_data_with_pandasai(
            file_path=file_path,
            prompt=analysis_request.prompt,
            api_key=analysis_request.api_key
        )
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
            
        # Process visualization if available
        visualization_path = None
        if result.get("visualization"):
            visualization_path = result["visualization"]
            temp_files.append(visualization_path)
            
        # Prepare metadata
        metadata = {
            "processing_time": time.time() - start_time,
            "file_name": analysis_request.file_name,
            "processing_timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        
        # Add cleanup task
        background_tasks.add_task(cleanup_files, temp_files)
        
        return AnalysisResponse(
            request_id=analysis_request.request_id,
            analysis_result=result["analysis_result"],
            data_summary=result["data_summary"],
            visualization=visualization_path,
            preview=preview,
            metadata=metadata,
            temp_files=temp_files
        )
        
    except Exception as e:
        # Clean up files
        background_tasks.add_task(cleanup_files, temp_files)
        raise HTTPException(status_code=500, detail=str(e))
