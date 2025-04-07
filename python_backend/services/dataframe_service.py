
import math
import pandas as pd
from typing import List, Dict, Any, Optional, Tuple
from models.schemas import EntityModel, DataFrameOutput
from config.settings import MAX_ROWS_PER_SHEET

def create_dataframe_from_entities(entities: List[EntityModel]) -> DataFrameOutput:
    """Create a pandas DataFrame from extracted entities with pagination."""
    # Group entities by type
    entity_groups = {}
    for entity in entities:
        if entity.type not in entity_groups:
            entity_groups[entity.type] = []
        entity_groups[entity.type].append(entity.value)
    
    # Create headers
    headers = list(entity_groups.keys())
    
    # Find the maximum number of entities in any group
    max_entities = max([len(group) for group in entity_groups.values()], default=0)
    
    # Calculate number of sheets needed
    sheet_count = math.ceil(max_entities / MAX_ROWS_PER_SHEET)
    sheets = []
    
    for sheet_idx in range(sheet_count):
        start_idx = sheet_idx * MAX_ROWS_PER_SHEET
        end_idx = min((sheet_idx + 1) * MAX_ROWS_PER_SHEET, max_entities)
        
        sheet_rows = []
        for i in range(start_idx, end_idx):
            row = []
            for entity_type in headers:
                if i < len(entity_groups[entity_type]):
                    row.append(entity_groups[entity_type][i])
                else:
                    row.append("")
            sheet_rows.append(row)
        
        sheets.append({
            "name": f"Sheet{sheet_idx + 1}",
            "rows": sheet_rows,
            "row_count": len(sheet_rows),
            "column_count": len(headers)
        })
    
    return DataFrameOutput(
        headers=headers,
        sheets=sheets,
        total_rows=max_entities,
        sheet_count=sheet_count
    )

def process_spreadsheet(file_path: str) -> Tuple[str, Optional[DataFrameOutput]]:
    """Process Excel or CSV files with pagination."""
    try:
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
        else:  # Excel files
            df = pd.read_excel(file_path)
        
        # Convert to text for entity extraction
        text = df.to_string()
        
        # Get headers
        headers = df.columns.tolist()
        
        # Calculate number of sheets needed
        total_rows = len(df)
        sheet_count = math.ceil(total_rows / MAX_ROWS_PER_SHEET)
        
        # Create sheets
        sheets = []
        for sheet_idx in range(sheet_count):
            start_idx = sheet_idx * MAX_ROWS_PER_SHEET
            end_idx = min((sheet_idx + 1) * MAX_ROWS_PER_SHEET, total_rows)
            
            sheet_df = df.iloc[start_idx:end_idx]
            
            sheets.append({
                "name": f"Sheet{sheet_idx + 1}",
                "rows": sheet_df.values.tolist(),
                "row_count": len(sheet_df),
                "column_count": len(headers)
            })
        
        data_frame = DataFrameOutput(
            headers=headers,
            sheets=sheets,
            total_rows=total_rows,
            sheet_count=sheet_count
        )
        
        return text, data_frame
    except Exception as e:
        print(f"Error processing spreadsheet: {str(e)}")
        return "", None

def export_to_excel(data_frame: DataFrameOutput, output_path: str) -> str:
    """Export data to Excel with multiple sheets if needed."""
    try:
        with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
            for sheet in data_frame.sheets:
                # Create DataFrame for this sheet
                sheet_df = pd.DataFrame(sheet["rows"], columns=data_frame.headers)
                # Write to Excel
                sheet_df.to_excel(writer, sheet_name=sheet["name"], index=False)
        return output_path
    except Exception as e:
        print(f"Error exporting to Excel: {str(e)}")
        return ""
