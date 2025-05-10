
// Define the FastAPI backend URL - change this to your Replit URL when deployed
const FASTAPI_BACKEND_URL = "https://your-replit-fastapi-url.replit.co";

export async function uploadFile(file: File) {
  try {
    console.log(`Uploading file: ${file.name} (${file.type}, ${file.size} bytes)`);
    
    // Generate a unique ID for the file
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Since we're testing without an actual backend connection,
    // we'll use the client-side approach to simulate file processing
    
    // Create a blob URL for the file (this is only for demo purposes)
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
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Since we're testing without an actual backend,
    // create a simulated response
    const simulatedResponse = {
      file_id: fileId,
      full_text: `This is simulated extracted text from ${fileData.file_name}. For testing purposes only.`,
      detected_language: "en",
      entities: [
        { type: "EMAIL", value: "test@example.com", confidence: 0.95 },
        { type: "DATE", value: "2023-01-15", confidence: 0.9 },
        { type: "PHONE_NUMBER", value: "555-123-4567", confidence: 0.85 }
      ],
      entities_summary: {
        "EMAIL": ["test@example.com"],
        "DATE": ["2023-01-15"],
        "PHONE_NUMBER": ["555-123-4567"]
      },
      data_frame: {
        headers: ["Type", "Value", "Confidence"],
        sheets: [
          {
            name: "Extracted Data",
            row_count: 3,
            column_count: 3,
            rows: [
              ["EMAIL", "test@example.com", "95%"],
              ["DATE", "2023-01-15", "90%"],
              ["PHONE_NUMBER", "555-123-4567", "85%"]
            ]
          }
        ],
        total_rows: 3,
        sheet_count: 1
      },
      metadata: {
        processing_time: 1.25,
        character_count: 100,
        entity_count: 3
      }
    };
    
    console.log("Processing completed successfully:", simulatedResponse);
    return simulatedResponse;
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
