
# FastAPI Backend Setup on Replit

This document provides step-by-step instructions for setting up the FastAPI backend on Replit to work with your Lovable app.

## Step 1: Create a new Replit project

1. Go to [Replit](https://replit.com/) and sign in or create an account
2. Click on "Create" to create a new Repl
3. Select "Python" as the template
4. Give your Repl a name (e.g., "document-processor-backend")
5. Click "Create Repl"

## Step 2: Upload the FastAPI backend code

1. In your new Repl, create a new file called `main.py`
2. Copy the contents of `fastapi_backend.py` from your Lovable project and paste it into `main.py`
3. Create a new file called `requirements.txt`
4. Copy the contents of `fastapi_requirements.txt` and paste it into `requirements.txt`

## Step 3: Install dependencies and run the server

1. Replit should automatically detect the `requirements.txt` file and install the dependencies
2. If not, open the Shell and run: `pip install -r requirements.txt`
3. Click the "Run" button at the top of the Replit interface to start the server

## Step 4: Update your Lovable app

1. After the server starts, Replit will display a URL for your API (e.g., `https://document-processor-backend.yourusername.repl.co`)
2. Copy this URL
3. In your Lovable app, update `src/services/uploadService.ts` to use this URL:
   ```typescript
   const FASTAPI_BACKEND_URL = "https://document-processor-backend.yourusername.repl.co";
   ```

## Step 5: Test the integration

1. Make sure both your Replit backend and Lovable app are running
2. Try uploading a file in your Lovable app
3. Check the logs in both applications to ensure they're communicating properly

## Troubleshooting

### CORS Issues
If you encounter CORS issues, make sure the `allow_origins` parameter in the FastAPI CORS middleware is properly configured:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development - replace with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Connection Timeouts
Replit may sleep after periods of inactivity. If you're experiencing connection issues after the Repl has been idle:
1. Consider upgrading to a paid Replit plan to avoid this
2. Implement a "keep-alive" mechanism that pings your Repl periodically

### File Processing Errors
The provided code is a simplified version. For more advanced document processing:
1. Add necessary libraries to `requirements.txt` (e.g., PyPDF2, pytesseract, pandas)
2. Expand the code to handle different file types properly
