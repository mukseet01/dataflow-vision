
import { supabase } from "@/integrations/supabase/client";

// Define the FastAPI backend URL - change this to your Replit URL when deployed
const FASTAPI_BACKEND_URL = "https://your-replit-fastapi-url.replit.app";

export async function uploadFile(file: File) {
  try {
    // Get current user - use anonymous upload if not authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    // Upload file to Supabase Storage
    const filename = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("uploads")
      .upload(filename, file);

    if (uploadError) {
      throw new Error(`File upload error: ${uploadError.message}`);
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from("uploads")
      .getPublicUrl(filename);

    // Determine if OCR is required
    const requiresOcr = file.type === "application/pdf" || 
                        file.type.startsWith("image/");
                        
    // Save file metadata to database - use anonymous user if not logged in
    const { data: fileData, error: fileError } = await supabase
      .from('file_uploads')
      .insert({
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        original_path: publicUrl,
        ocr_required: requiresOcr,
        user_id: user?.id || '00000000-0000-0000-0000-000000000000', // Use anonymous ID if no user
        status: 'pending'
      })
      .select()
      .single();

    if (fileError) {
      throw new Error(`Database error: ${fileError.message}`);
    }

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
    
    // Call our external FastAPI backend for document processing
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
    
    // Update the file status in Supabase
    const { error: updateError } = await supabase
      .from('file_uploads')
      .update({ 
        status: 'processed',
        processing_metadata: data.metadata,
        detected_language: data.detected_language
      })
      .eq('id', fileId);
      
    if (updateError) {
      console.error("Error updating file status:", updateError);
    }
    
    // Store extracted data in database
    const { error: extractedDataError } = await supabase
      .from('extracted_data')
      .insert({
        file_id: fileId,
        extracted_text: data.full_text,
        extracted_entities: data.entities_summary,
        data_frame: data.data_frame
      });
      
    if (extractedDataError) {
      console.error("Error storing extracted data:", extractedDataError);
    }
    
    console.log("Processing completed successfully:", data);
    return data;
  } catch (error) {
    console.error(`Error processing file with ID ${fileId}:`, error);
    
    // Update the file status to 'failed'
    await supabase
      .from('file_uploads')
      .update({ 
        status: 'failed'
      })
      .eq('id', fileId);
      
    throw error;
  }
}
