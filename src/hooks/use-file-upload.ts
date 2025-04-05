
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { FileWithPreview, isValidFileType } from "@/utils/fileUtils";
import { uploadFile, processFile } from "@/services/uploadService";

export const useFileUpload = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(isValidFileType);
    
    if (validFiles.length !== newFiles.length) {
      toast({
        title: "Unsupported file type",
        description: "Only PDF, Excel, CSV, JSON, images and document files are supported.",
        variant: "destructive",
      });
    }
    
    // Check file size limits
    const fileSizeLimits = {
      "application/pdf": 50,
      "image/png": 10,
      "image/jpeg": 10,
      "text/csv": 10,
      "application/vnd.ms-excel": 10,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": 20,
      "image/tiff": 20,
      "text/plain": 5,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": 10
    };

    const invalidSizeFiles = validFiles.filter(file => {
      const sizeLimit = fileSizeLimits[file.type as keyof typeof fileSizeLimits];
      if (!sizeLimit) return false;
      
      const fileSizeMB = file.size / (1024 * 1024);
      return fileSizeMB > sizeLimit;
    });

    if (invalidSizeFiles.length > 0) {
      toast({
        title: "File size exceeds limit",
        description: `Some files exceed the size limit: ${invalidSizeFiles.map(f => f.name).join(', ')}`,
        variant: "destructive",
      });
      
      // Filter out invalid size files
      const validSizeFiles = validFiles.filter(file => {
        const sizeLimit = fileSizeLimits[file.type as keyof typeof fileSizeLimits];
        if (!sizeLimit) return true;
        
        const fileSizeMB = file.size / (1024 * 1024);
        return fileSizeMB <= sizeLimit;
      });

      const filesWithPreview = validSizeFiles.map(file => {
        if (file.type.startsWith("image/")) {
          return Object.assign(file, {
            preview: URL.createObjectURL(file)
          });
        }
        return file;
      });
      
      setFiles(prev => [...prev, ...filesWithPreview]);
    } else {
      const filesWithPreview = validFiles.map(file => {
        if (file.type.startsWith("image/")) {
          return Object.assign(file, {
            preview: URL.createObjectURL(file)
          });
        }
        return file;
      });
      
      setFiles(prev => [...prev, ...filesWithPreview]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files => {
      const newFiles = [...files];
      const file = newFiles[index];
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const processFiles = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setProgress(0);
    
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
          setProgress(prev => Math.min(prev + progressIncrement, 100));
          
          return fileData;
        } catch (error: any) {
          console.error(`Error processing file ${file.name}:`, error);
          toast({
            title: "Processing Error",
            description: `Failed to process ${file.name}. ${error.message}`,
            variant: "destructive",
          });
          
          // Still update progress even on error
          setProgress(prev => Math.min(prev + progressIncrement, 100));
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
      setTimeout(() => {
        setFiles([]);
        setIsProcessing(false);
      }, 500);
      
    } catch (error: any) {
      console.error("Error during file processing:", error);
      toast({
        title: "Processing Failed",
        description: `An unexpected error occurred. ${error.message}`,
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const resetFiles = () => setFiles([]);

  return {
    files,
    isDragging,
    isProcessing,
    progress,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange,
    removeFile,
    processFiles,
    resetFiles
  };
};
