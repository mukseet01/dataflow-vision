
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

// Define the document processing function
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { fileUrl, fileName, fileType, fileId } = await req.json()
    
    if (!fileUrl || !fileName || !fileType || !fileId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Create a Supabase client to update the file status
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log(`Starting processing for file: ${fileName} (${fileType})`)
    
    try {
      // Update file status to processing
      await supabase
        .from('file_uploads')
        .update({ status: 'processing' })
        .eq('id', fileId)
    } catch (error) {
      console.error('Error updating file status:', error)
      // Continue processing even if status update fails
    }
      
    // Simulate document processing - in a real implementation, this would 
    // extract text, entities, etc. using libraries or external services
    const extractedText = `Sample extracted text from ${fileName}`
    const extractedEntities = { 
      names: ['John Doe', 'Jane Smith'],
      dates: ['2025-05-03'],
      amounts: ['$1,234.56']
    }
    
    // Create a structured data representation
    const dataFrame = {
      headers: ['Name', 'Date', 'Amount'],
      sheets: [{ 
        name: "Sheet1",
        row_count: 2,
        column_count: 3,
        data: [
          ['John Doe', '2025-05-03', '$1,234.56'],
          ['Jane Smith', '2025-05-03', '$789.01']
        ]
      }],
      total_rows: 2,
      sheet_count: 1
    }
    
    // Store the extracted data
    try {
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
        console.error('Error inserting extracted data:', extractionError)
        throw extractionError
      }
      
      // Extract entities to the entities table for better querying
      for (const type in extractedEntities) {
        for (const value of extractedEntities[type]) {
          await supabase
            .from('extracted_entities')
            .insert({
              file_id: fileId,
              entity_type: type,
              entity_value: value,
              confidence: 0.95 // Mock confidence score
            })
            .catch(err => console.error('Error inserting entity:', err))
        }
      }
    } catch (error) {
      console.error('Error processing extraction data:', error)
      // Continue to update status even if extraction fails
    }
    
    // Update file status to completed
    try {
      await supabase
        .from('file_uploads')
        .update({ 
          status: 'completed',
          processing_metadata: {
            processing_time_ms: 1500, // Mock processing time
            character_count: extractedText.length,
            entity_count: Object.values(extractedEntities).flat().length,
            processing_timestamp: new Date().toISOString()
          }
        })
        .eq('id', fileId)
    } catch (error) {
      console.error('Error updating file status to completed:', error)
    }
    
    console.log(`Processing completed for file: ${fileName}`)
    
    return new Response(
      JSON.stringify({ 
        success: true,
        fileId,
        extractedText,
        extractedEntities,
        dataFrame
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing document:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
