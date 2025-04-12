
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

// Define the document processing function
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { fileId } = await req.json()
    
    if (!fileId) {
      return new Response(
        JSON.stringify({ error: 'File ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    // Create a client with the service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey)
    
    // Get the file metadata
    const { data: fileData, error: fileError } = await supabase
      .from('file_uploads')
      .select('*')
      .eq('id', fileId)
      .single()
      
    if (fileError || !fileData) {
      return new Response(
        JSON.stringify({ error: 'File not found', details: fileError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }
    
    // Update file status to processing
    await supabase
      .from('file_uploads')
      .update({ status: 'processing' })
      .eq('id', fileId)
    
    // Simulate document processing
    // In a real implementation, this would call OCR, NER, etc. services
    const extractedText = `Sample extracted text from ${fileData.file_name}`
    const extractedEntities = { 
      names: ['John Doe', 'Jane Smith'],
      dates: ['2025-04-05'],
      amounts: ['$1,234.56']
    }
    
    // Create a structured data representation
    const dataFrame = {
      headers: ['Name', 'Date', 'Amount'],
      rows: [
        ['John Doe', '2025-04-05', '$1,234.56'],
        ['Jane Smith', '2025-04-05', '$789.01']
      ]
    }
    
    // Save extracted data to the database
    const { data: extractedData, error: extractionError } = await supabase
      .from('extracted_data')
      .insert({
        file_id: fileId,
        extracted_text: extractedText,
        extracted_entities: extractedEntities,
        data_frame: dataFrame
      })
      .select()
      .single()
    
    if (extractionError) {
      await supabase
        .from('file_uploads')
        .update({ status: 'failed' })
        .eq('id', fileId)
        
      return new Response(
        JSON.stringify({ error: 'Failed to save extracted data', details: extractionError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    // Update file status to completed
    await supabase
      .from('file_uploads')
      .update({ status: 'completed' })
      .eq('id', fileId)
    
    return new Response(
      JSON.stringify({ 
        success: true,
        extractedData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
