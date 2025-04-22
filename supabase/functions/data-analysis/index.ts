
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";

// Get FastAPI URL from environment variable or use a default for local testing
const PYTHON_API_URL = Deno.env.get('FASTAPI_URL') || "http://localhost:8000";

// Create a Supabase client for the Edge Function with service role to bypass RLS
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

// Get OpenAI API key from Supabase secrets
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') ?? '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { action } = requestData;
    
    // Validate OpenAI API key is present
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not configured' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }
    
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
  
  // Log temporary files for cleanup
  if (result.temp_files && result.temp_files.length > 0) {
    console.log(`Temporary files to clean up: ${result.temp_files.length}`);
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
  
  // If the export generated a file, return its download URL
  if (result.download_url) {
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
