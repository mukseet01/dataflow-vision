
import { supabase } from "@/integrations/supabase/client";

export async function uploadFile(file: File) {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("You must be logged in to upload files");
    }
    
    // Upload file to Supabase Storage
    const filename = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("uploads")
      .upload(filename, file);

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from("uploads")
      .getPublicUrl(filename);

    // Determine if OCR is required
    const requiresOcr = file.type === "application/pdf" || 
                        file.type.startsWith("image/");
                        
    // Save file metadata to database with user_id
    const { data: fileData, error: fileError } = await supabase
      .from('file_uploads')
      .insert({
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        original_path: publicUrl,
        ocr_required: requiresOcr,
        user_id: user.id // Add user_id to comply with RLS
      })
      .select()
      .single();

    if (fileError) {
      throw new Error(fileError.message);
    }

    return fileData;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

export async function processFile(fileId: string, fileData: any) {
  try {
    // Call our document processing edge function
    const { data, error } = await supabase.functions.invoke('document-processing', {
      body: { 
        fileId: fileId,
        fileUrl: fileData.original_path,
        fileName: fileData.file_name,
        fileType: fileData.file_type
      }
    });
    
    if (error) {
      console.error("Error from document processing function:", error);
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    console.error(`Error processing file with ID ${fileId}:`, error);
    throw error;
  }
}
