
# Setting Up Your Fullstack App on Replit

This guide provides step-by-step instructions for setting up both your FastAPI backend and React frontend on separate Replit projects.

## Backend Setup on Replit

1. Go to [Replit](https://replit.com/) and sign in or create an account
2. Click on "Create" to create a new Repl
3. Select "Python" as the template
4. Name your Repl (e.g., "document-processor-backend")
5. Click "Create Repl"

### Setting up the FastAPI backend files

1. In your new Repl, create a new file called `main.py`
2. Copy the contents of `fastapi_backend.py` from this project and paste it into `main.py`
3. Create a new file called `requirements.txt`
4. Copy the contents of `fastapi_requirements.txt` and paste it into `requirements.txt`
5. For more advanced document processing, you can also upload the Python backend folder structure:
   - Create folders: `services`, `utils`, `config`, `models`
   - Upload the corresponding files from the `python_backend` directory

### Running the backend

1. Replit should automatically detect the `requirements.txt` file and install the dependencies
2. Click the "Run" button at the top of the Replit interface to start the server
3. After the server starts, Replit will display a URL for your API (e.g., `https://document-processor-backend.yourusername.repl.co`)
4. Copy this URL as you'll need it for the frontend configuration

## Frontend Setup on Replit

1. Go to [Replit](https://replit.com/) again
2. Click "Create" to create a new Repl
3. Choose "React TypeScript" as the template (or "React" if TypeScript is not available)
4. Name your Repl (e.g., "document-processor-frontend")
5. Click "Create Repl"

### Setting up the frontend files

1. Once your React Repl is created, you need to update the frontend code to point to your backend
2. In your Repl, navigate to `src/services/uploadService.ts` (you may need to create this file) 
3. Update the `FASTAPI_BACKEND_URL` variable to use the URL from your backend Repl:
   ```typescript
   const FASTAPI_BACKEND_URL = "https://your-backend-repl-url.replit.co";
   ```
4. Upload your React components, hooks, and other frontend code from this project to the appropriate directories in your Repl

### Running the frontend

1. Replit should automatically install the necessary dependencies based on the `package.json`
2. Click the "Run" button to start your React application
3. Replit will display your frontend application in a preview window

## Testing the Integration

1. Make sure both your backend and frontend Repls are running
2. Try uploading a file in your frontend application
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

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Replit Documentation](https://docs.replit.com/)
- [Deploying FastAPI on Replit](https://blog.replit.com/fastapi-tutorial)
