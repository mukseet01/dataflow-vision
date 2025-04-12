
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AnalysisRequest {
  prompt: string;
  fileId: string;
}

export interface ExportOptions {
  format: 'pdf' | 'pptx' | 'xlsx' | 'docx';
  title?: string;
}

export async function createAnalysisRequest(request: AnalysisRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
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
  } catch (error: any) {
    console.error("Error analyzing data:", error);
    toast.error(`Analysis failed: ${error.message}`);
    throw error;
  }
}

export async function exportAnalysisReport(requestId: string, options: ExportOptions) {
  try {
    const { data, error } = await supabase.functions.invoke('data-analysis', {
      body: { 
        action: 'export',
        requestId,
        format: options.format,
        title: options.title || 'Data Analysis Report'
      }
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    // If URL is returned, trigger download
    if (data?.downloadUrl) {
      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.download = options.title ? `${options.title}.${options.format}` : `analysis-report.${options.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Report exported successfully as ${options.format.toUpperCase()}`);
      return data;
    } else {
      throw new Error("No download URL returned");
    }
  } catch (error: any) {
    console.error("Error exporting analysis:", error);
    toast.error(`Export failed: ${error.message}`);
    throw error;
  }
}

export async function getAnalysisRequests() {
  try {
    // With RLS in place, this will automatically only return the current user's data
    const { data, error } = await supabase
      .from('analysis_requests')
      .select('*, file_uploads(*)')
      .order('created_at', { ascending: false });
      
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  } catch (error: any) {
    console.error("Error fetching analysis requests:", error);
    toast.error(`Failed to load analysis history: ${error.message}`);
    throw error;
  }
}

export async function getAnalysisById(id: string) {
  try {
    // With RLS in place, this will only return analysis owned by the current user
    const { data, error } = await supabase
      .from('analysis_requests')
      .select('*, file_uploads(*)')
      .eq('id', id)
      .single();
      
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  } catch (error: any) {
    console.error(`Error fetching analysis with ID ${id}:`, error);
    toast.error(`Failed to load analysis: ${error.message}`);
    throw error;
  }
}
