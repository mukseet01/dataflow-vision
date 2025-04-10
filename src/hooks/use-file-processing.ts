
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { uploadFile, processFile } from "@/services/uploadService";
import { FileWithPreview } from "@/utils/fileUtils";

export const useFileProcessing = () => {
  const { toast } = useToast();
  
  const processFiles = async (
    files: FileWithPreview[], 
    onProgress: (progress: number) => void,
    onComplete: () => void
  ) => {
    if (files.length === 0) return;
    
    try {
      // Calculate progress increment per file
      const progressIncrement = 100 / files.length;
      
      // Upload all files to Supabase
      const uploadPromises = files.map(async (file, index) => {
        try {
          // Upload file and get metadata
          const fileData = await uploadFile(file);
          
          if (!fileData) {
            throw new Error("File upload did not return file data");
          }
          
          // Process the file with our document processor
          await processFile(fileData.id);
          
          // Update progress
          onProgress((index + 1) * progressIncrement);
          
          return fileData;
        } catch (error: any) {
          console.error(`Error processing file ${file.name}:`, error);
          toast({
            title: "Processing Error",
            description: `Failed to process ${file.name}. ${error.message}`,
            variant: "destructive",
          });
          
          // Still update progress even on error
          onProgress((index + 1) * progressIncrement);
          return null;
        }
      });
      
      // Wait for all uploads and processing to complete
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(Boolean);
      
      if (successfulUploads.length > 0) {
        toast({
          title: "Processing Complete",
          description: `Successfully processed ${successfulUploads.length} of ${files.length} files.`,
        });
      }
      
      // Wait a moment before resetting UI
      setTimeout(onComplete, 500);
      
      return successfulUploads;
    } catch (error: any) {
      console.error("Error during file processing:", error);
      toast({
        title: "Processing Failed",
        description: `An unexpected error occurred. ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
  };

  return { processFiles };
};
