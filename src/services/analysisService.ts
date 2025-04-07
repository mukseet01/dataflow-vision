
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AnalysisRequest {
  prompt: string;
  fileId: string;
}

export async function createAnalysisRequest(request: AnalysisRequest) {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      toast.error("You must be logged in to analyze data");
      return null;
    }
    
    // Create analysis request record
    const { data: requestData, error: requestError } = await supabase
      .from('analysis_requests')
      .insert({
        user_id: user.id,
        file_id: request.fileId,
        prompt: request.prompt,
      })
      .select()
      .single();
      
    if (requestError) {
      throw new Error(requestError.message);
    }
    
    // Call the data analysis edge function
    const { data: analysisData, error: analysisError } = await supabase.functions.invoke('data-analysis', {
      body: { 
        action: 'analyze',
        fileId: request.fileId,
        prompt: request.prompt,
        requestId: requestData.id
      }
    });
    
    if (analysisError) {
      throw new Error(analysisError.message);
    }
    
    return {
      requestId: requestData.id,
      ...analysisData
    };
  } catch (error) {
    console.error("Error analyzing data:", error);
    toast.error(`Analysis failed: ${error.message}`);
    throw error;
  }
}

export async function getAnalysisRequests() {
  try {
    const { data, error } = await supabase
      .from('analysis_requests')
      .select('*, file_uploads(*)')
      .order('created_at', { ascending: false });
      
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching analysis requests:", error);
    toast.error(`Failed to load analysis history: ${error.message}`);
    throw error;
  }
}

export async function getAnalysisById(id: string) {
  try {
    const { data, error } = await supabase
      .from('analysis_requests')
      .select('*, file_uploads(*)')
      .eq('id', id)
      .single();
      
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching analysis with ID ${id}:`, error);
    toast.error(`Failed to load analysis: ${error.message}`);
    throw error;
  }
}
