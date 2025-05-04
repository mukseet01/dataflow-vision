
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
      let successCount = 0;
      
      // Upload all files to Supabase
      const uploadPromises = files.map(async (file, index) => {
        try {
          console.log(`Starting upload for file: ${file.name}`);
          
          // Upload file and get metadata
          const fileData = await uploadFile(file);
          
          if (!fileData || !fileData.id) {
            throw new Error("File upload did not return valid file data");
          }
          
          console.log(`File uploaded successfully: ${file.name}, ID: ${fileData.id}`);
          
          // Process the file with our document processor
          const processingResult = await processFile(fileData.id, fileData);
          console.log(`Processing result for ${file.name}:`, processingResult);
          
          // Update progress
          onProgress(Math.min(100, (index + 1) * progressIncrement));
          successCount++;
          
          return { fileData, processingResult };
        } catch (error: any) {
          console.error(`Error processing file ${file.name}:`, error);
          toast({
            title: "Processing Error",
            description: `Failed to process ${file.name}: ${error.message}`,
            variant: "destructive",
          });
          
          // Still update progress even on error
          onProgress(Math.min(100, (index + 1) * progressIncrement));
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
      } else if (files.length > 0) {
        toast({
          title: "Processing Failed",
          description: "No files were successfully processed. Please try again.",
          variant: "destructive",
        });
      }
      
      // Wait a moment before resetting UI
      setTimeout(onComplete, 800);
      
      return successfulUploads;
    } catch (error: any) {
      console.error("Error during file processing:", error);
      toast({
        title: "Processing Failed",
        description: `An unexpected error occurred: ${error.message}`,
        variant: "destructive",
      });
      onComplete();
      throw error;
    }
  };

  return { processFiles };
};
