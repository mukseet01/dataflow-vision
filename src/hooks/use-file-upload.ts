
import { useState } from "react";
import { useFilesState } from "./use-files-state";
import { useDragDrop } from "./use-drag-drop";
import { useFileValidation } from "./use-file-validation";
import { useFileProcessing } from "./use-file-processing";
import { FileWithPreview } from "@/utils/fileUtils";
import { uploadFile as uploadFileService } from "@/services/uploadService";

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileData, setFileData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const {
    files,
    progress,
    isProcessing,
    addFiles,
    removeFile,
    resetFiles,
    updateProgress,
    setProcessingState
  } = useFilesState();

  const { isDragging, handleDragOver, handleDragLeave, handleDrop, handleFileChange } = useDragDrop();
  const { validateFiles } = useFileValidation();
  const { processFiles } = useFileProcessing();

  const handleFiles = (newFiles: File[]) => {
    const validatedFiles = validateFiles(newFiles);
    if (validatedFiles.length > 0) {
      addFiles(validatedFiles);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleDrop(e, handleFiles);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e, handleFiles);
  };

  const startProcessing = async () => {
    setProcessingState(true);
    
    try {
      await processFiles(
        files,
        updateProgress,
        () => {
          resetFiles();
          setProcessingState(false);
        }
      );
    } catch {
      setProcessingState(false);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);
    try {
      const validatedFiles = validateFiles([file]);
      if (validatedFiles.length === 0) {
        throw new Error("File validation failed");
      }
      
      // Upload the file using the service
      const result = await uploadFileService(file);
      setFileData(result);
      return result;
    } catch (err: any) {
      setError(err.message || "Upload failed");
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    resetFiles();
    setFileData(null);
    setError(null);
  };

  return {
    files,
    isDragging,
    isProcessing,
    isUploading,
    progress,
    fileData,
    error,
    handleDragOver,
    handleDragLeave,
    handleDrop: handleFileDrop,
    handleFileChange: handleInputChange,
    removeFile,
    processFiles: startProcessing,
    resetFiles,
    uploadFile,
    reset
  };
};
