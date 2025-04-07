
import pandas as pd
from typing import Dict, Any, List, Optional
import json
import os

try:
    from pandasai import PandasAI
    from pandasai.llm import OpenAI
    PANDAS_AI_AVAILABLE = True
except ImportError:
    PANDAS_AI_AVAILABLE = False

def analyze_data_with_pandasai(
    file_path: str, 
    prompt: str,
    api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Analyze data using PandasAI and a large language model.
    
    Args:
        file_path: Path to the data file (Excel, CSV, etc.)
        prompt: User's analysis request prompt
        api_key: OpenAI API key
        
    Returns:
        Dictionary containing analysis results
    """
    if not PANDAS_AI_AVAILABLE:
        return {
            "error": "PandasAI is not installed. Please install it with: pip install pandasai"
        }
    
    if not api_key:
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            return {
                "error": "OpenAI API key is required but not provided"
            }
    
    try:
        # Load the data based on file type
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
        elif file_path.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(file_path)
        else:
            return {"error": f"Unsupported file format: {file_path.split('.')[-1]}"}
        
        # Initialize PandasAI with LLM
        llm = OpenAI(api_token=api_key)
        pandas_ai = PandasAI(llm)
        
        # Run the analysis
        result = pandas_ai.run(df, prompt)
        
        # Get dataframe information
        data_summary = {
            "shape": df.shape,
            "columns": df.columns.tolist(),
            "dtypes": {col: str(dtype) for col, dtype in zip(df.dtypes.index, df.dtypes.values)},
            "head": df.head(5).to_dict(orient="records"),
            "missing_values": df.isna().sum().to_dict()
        }
        
        # Prepare the response
        response = {
            "analysis_result": str(result),
            "data_summary": data_summary,
            "visualization": None  # Will be populated if visualization is generated
        }
        
        # Handle visualizations if generated
        # This is a simple check - production code would need more robust detection
        if hasattr(result, "figure_"):
            fig_path = f"{file_path}_analysis_fig.png"
            result.figure_.savefig(fig_path)
            response["visualization"] = fig_path
        
        return response
        
    except Exception as e:
        return {"error": f"Analysis failed: {str(e)}"}

def get_data_preview(file_path: str, max_rows: int = 10) -> Dict[str, Any]:
    """Get a preview of the data in a file."""
    try:
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
        elif file_path.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(file_path)
        else:
            return {"error": f"Unsupported file format: {file_path.split('.')[-1]}"}
            
        return {
            "columns": df.columns.tolist(),
            "rows": df.head(max_rows).to_dict(orient="records"),
            "total_rows": len(df),
            "total_columns": len(df.columns)
        }
    except Exception as e:
        return {"error": f"Failed to preview data: {str(e)}"}
