
// Define the FastAPI backend URL - change this to your Replit URL when deployed
const FASTAPI_BACKEND_URL = "https://your-replit-fastapi-url.replit.co";

export async function uploadFile(file: File) {
  try {
    console.log(`Uploading file: ${file.name} (${file.type}, ${file.size} bytes)`);
    
    // Generate a unique ID for the file
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // OPTION 1: Direct upload using FormData (when backend supports multipart/form-data)
    // This is more efficient but requires the backend to handle file uploads
    /*
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_id', fileId);
    
    const response = await fetch(`${FASTAPI_BACKEND_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }
    
    const fileData = await response.json();
    */
    
    // OPTION 2: Upload to a temporary storage and send URL to backend
    // For demo purposes, we'll create a temporary URL using a blob URL
    // In a real application, you would upload to a storage service like Firebase, AWS S3, etc.
    const objectUrl = URL.createObjectURL(file);
    
    // Create file metadata
    const fileData = {
      id: fileId,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      original_path: objectUrl,
      upload_timestamp: new Date().toISOString(),
      status: 'uploaded'
    };
    
    console.log("File uploaded successfully:", fileData);
    return fileData;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

export async function processFile(fileId: string, fileData: any) {
  try {
    console.log("Processing file with ID:", fileId);
    
    // Call our FastAPI backend for document processing
    const response = await fetch(`${FASTAPI_BACKEND_URL}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        file_id: fileId,
        file_url: fileData.original_path,
        file_name: fileData.file_name,
        file_type: fileData.file_type
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response from FastAPI:", errorText);
      throw new Error(`Processing error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Processing completed successfully:", data);
    
    // In a real app, you would store this data in a database
    // Here we'll just return it to the caller
    return data;
  } catch (error) {
    console.error(`Error processing file with ID ${fileId}:`, error);
    throw error;
  }
}

// Helper function to create a downloadable URL for a Blob
export function createDownloadableUrl(content: Blob, filename: string): string {
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  return url;
}
