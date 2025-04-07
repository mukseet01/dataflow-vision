
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";

const PYTHON_API_URL = "https://your-fastapi-service-url.com"; // Replace with your deployed FastAPI service URL

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
    const requestData = await req.json();
    const { action } = requestData;
    
    // Handle different action types
    if (action === 'analyze') {
      return await handleAnalysis(requestData);
    } else if (action === 'export') {
      return await handleExport(requestData);
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in data-analysis function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function handleAnalysis(requestData: any) {
  const { fileId, prompt, requestId } = requestData;
  
  if (!fileId || !prompt) {
    return new Response(
      JSON.stringify({ error: 'File ID and prompt are required' }),
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
  
  // Update analysis request status to processing
  await supabase
    .from('analysis_requests')
    .update({ status: 'processing' })
    .eq('id', requestId);

  // Get temporary download URL for the file
  const { data: { signedURL }, error: signedURLError } = await supabase
    .storage
    .from('uploads')
    .createSignedUrl(fileData.original_path.split('/').pop(), 3600);

  if (signedURLError) {
    throw new Error(`Failed to get signed URL: ${signedURLError.message}`);
  }

  // Get OpenAI API key from Supabase secrets
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY') ?? '';

  // Call FastAPI backend for processing
  const apiResponse = await fetch(`${PYTHON_API_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      request_id: requestId,
      file_url: signedURL,
      file_name: fileData.file_name,
      file_type: fileData.file_type,
      prompt: prompt,
      api_key: openaiApiKey,
    }),
  });

  if (!apiResponse.ok) {
    const errorData = await apiResponse.text();
    throw new Error(`FastAPI service error: ${errorData}`);
  }

  const result = await apiResponse.json();
  
  // Update analysis request with results
  await supabase
    .from('analysis_requests')
    .update({ 
      status: 'completed',
      results: {
        analysis_result: result.analysis_result,
        data_summary: result.data_summary,
        metadata: result.metadata
      }
    })
    .eq('id', requestId);
  
  // Schedule cleanup of temporary files
  if (result.temp_files && result.temp_files.length > 0) {
    EdgeRuntime.waitUntil(cleanupTempFiles(result.temp_files));
  }
  
  return new Response(
    JSON.stringify({ 
      success: true,
      result: {
        analysis_result: result.analysis_result,
        data_summary: result.data_summary,
        preview: result.preview
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleExport(requestData: any) {
  const { requestId, format, title } = requestData;
  
  if (!requestId || !format) {
    return new Response(
      JSON.stringify({ error: 'Request ID and format are required' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
  
  // Get the analysis request data
  const { data: analysisData, error: analysisError } = await supabase
    .from('analysis_requests')
    .select('*, file_uploads(*)')
    .eq('id', requestId)
    .single();
    
  if (analysisError || !analysisData) {
    return new Response(
      JSON.stringify({ error: 'Analysis not found', details: analysisError }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
    );
  }
  
  // Get OpenAI API key from Supabase secrets
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY') ?? '';

  // Call FastAPI backend for export processing
  const apiResponse = await fetch(`${PYTHON_API_URL}/export`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      request_id: requestId,
      format: format,
      title: title || 'Data Analysis Report',
      analysis_data: analysisData.results,
      api_key: openaiApiKey,
    }),
  });

  if (!apiResponse.ok) {
    const errorData = await apiResponse.text();
    throw new Error(`FastAPI export error: ${errorData}`);
  }

  const result = await apiResponse.json();
  
  // If the export generated a file, upload it to Supabase storage
  if (result.export_file_path) {
    // The Python backend would have created a temporary file
    // We would need to upload this to Supabase Storage and get a download URL
    // This is a placeholder for the actual implementation
    
    // Return the download URL
    return new Response(
      JSON.stringify({ 
        success: true,
        downloadUrl: result.download_url
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } else {
    throw new Error('Export failed to generate a file');
  }
}

// Background task to clean up temporary files
async function cleanupTempFiles(tempFiles: string[]) {
  try {
    console.log('Starting cleanup of temporary files');
    
    // Wait for some time to ensure processing is complete
    await new Promise(resolve => setTimeout(resolve, 60000)); // 1 minute delay
    
    // Delete temporary files
    for (const filePath of tempFiles) {
      const pathParts = filePath.split('/');
      const fileName = pathParts[pathParts.length - 1];
      
      // Logic to clean up files would go here
      console.log(`Cleaning up temporary file: ${fileName}`);
    }
    
    console.log('Temporary files cleanup completed');
  } catch (error) {
    console.error('Error cleaning up temporary files:', error);
  }
}
