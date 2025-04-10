
import { useFilesState } from "./use-files-state";
import { useDragDrop } from "./use-drag-drop";
import { useFileValidation } from "./use-file-validation";
import { useFileProcessing } from "./use-file-processing";

export const useFileUpload = () => {
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

  return {
    files,
    isDragging,
    isProcessing,
    progress,
    handleDragOver,
    handleDragLeave,
    handleDrop: handleFileDrop,
    handleFileChange: handleInputChange,
    removeFile,
    processFiles: startProcessing,
    resetFiles
  };
};
