
def detect_language(text: str) -> str:
    """Detect language of the text."""
    try:
        from langdetect import detect
        return detect(text) if text else "unknown"
    except Exception as e:
        print(f"Error detecting language: {str(e)}")
        return "unknown"
