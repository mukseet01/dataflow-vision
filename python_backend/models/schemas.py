
from pydantic import BaseModel
from typing import Dict, List, Any, Optional

class FileRequest(BaseModel):
    file_id: str
    file_url: str
    file_type: str
    file_name: str

class EntityModel(BaseModel):
    type: str
    value: str
    confidence: Optional[float] = None
    page_number: Optional[int] = None
    position: Optional[Dict[str, Any]] = None

class SheetInfo(BaseModel):
    name: str
    row_count: int
    column_count: int

class DataFrameOutput(BaseModel):
    headers: List[str]
    sheets: List[Dict[str, Any]]
    total_rows: int
    sheet_count: int

class ProcessingResponse(BaseModel):
    file_id: str
    full_text: Optional[str] = None
    detected_language: Optional[str] = None
    entities: List[EntityModel] = []
    entities_summary: Optional[Dict[str, List[str]]] = None
    data_frame: Optional[DataFrameOutput] = None
    metadata: Optional[Dict[str, Any]] = None
    temp_files: List[str] = []

# New schemas for data analysis
class AnalysisRequest(BaseModel):
    request_id: str
    file_url: str
    file_name: str
    file_type: str
    prompt: str
    api_key: Optional[str] = None

class AnalysisResponse(BaseModel):
    request_id: str
    analysis_result: str
    data_summary: Dict[str, Any]
    preview: Dict[str, Any]
    visualization: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    temp_files: List[str] = []
