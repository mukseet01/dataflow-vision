
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";

// Get FastAPI URL from environment variable or use a default for local testing
const PYTHON_API_URL = Deno.env.get('FASTAPI_URL') || "http://localhost:8000";

// Create a Supabase client for the Edge Function
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, fileId } = await req.json();
    
    if (!fileId) {
      return new Response(
        JSON.stringify({ error: 'File ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Get the file metadata from Supabase
    const { data: fileData, error: fileError } = await supabase
      .from('file_uploads')
      .select('*')
      .eq('id', fileId)
      .single();
      
    if (fileError || !fileData) {
      return new Response(
        JSON.stringify({ error: 'File not found', details: fileError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    // Update file status to processing
    await supabase
      .from('file_uploads')
      .update({ status: 'processing' })
      .eq('id', fileId);

    // Get temporary download URL for the file
    const { data: { signedURL }, error: signedURLError } = await supabase
      .storage
      .from('uploads')
      .createSignedUrl(fileData.original_path.split('/').pop(), 3600);

    if (signedURLError) {
      throw new Error(`Failed to get signed URL: ${signedURLError.message}`);
    }

    // Call FastAPI backend for processing
    const apiResponse = await fetch(`${PYTHON_API_URL}/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_id: fileId,
        file_url: signedURL,
        file_type: fileData.file_type,
        file_name: fileData.file_name,
      }),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.text();
      throw new Error(`FastAPI service error: ${errorData}`);
    }

    const result = await apiResponse.json();
    
    // Update file status and save extracted data
    await supabase
      .from('file_uploads')
      .update({ 
        status: 'completed',
        detected_language: result.detected_language || null,
        processing_metadata: result.metadata || null
      })
      .eq('id', fileId);
    
    // Save extracted entities if available
    if (result.entities && result.entities.length > 0) {
      const entities = result.entities.map(entity => ({
        file_id: fileId,
        entity_type: entity.type,
        entity_value: entity.value,
        confidence: entity.confidence || null,
        page_number: entity.page_number || null,
        position_data: entity.position || null
      }));
      
      await supabase
        .from('extracted_entities')
        .insert(entities);
    }
    
    // Save structured data with multi-sheet support
    if (result.data_frame) {
      await supabase
        .from('extracted_data')
        .insert({
          file_id: fileId,
          extracted_text: result.full_text || null,
          extracted_entities: result.entities_summary || null,
          data_frame: result.data_frame
        });
    }

    // If there's an Excel export, upload it to storage
    if (result.metadata?.has_excel_export) {
      // Upload logic would go here if we had the actual file
      console.log("Excel export available with", result.metadata.sheet_count, "sheets");
    }

    // Schedule cleanup of temporary files
    if (result.temp_files && result.temp_files.length > 0) {
      // We can't use EdgeRuntime.waitUntil here, so we'll need a different approach
      console.log(`Temporary files to clean up: ${result.temp_files.length}`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        result: {
          ...result,
          sheet_info: result.data_frame ? {
            total_rows: result.data_frame.total_rows,
            sheet_count: result.data_frame.sheet_count
          } : null
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing document:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
