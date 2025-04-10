
import { useState } from "react";
import { FileWithPreview } from "@/utils/fileUtils";

export const useFilesState = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const addFiles = (newFiles: FileWithPreview[]) => {
    setFiles(prev => [...prev, ...newFiles]);
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

  const resetFiles = () => setFiles([]);

  const updateProgress = (value: number) => {
    setProgress(Math.min(value, 100));
  };

  const setProcessingState = (state: boolean) => {
    setIsProcessing(state);
    if (state === true) {
      setProgress(0);
    }
  };

  return {
    files,
    progress,
    isProcessing,
    addFiles,
    removeFile,
    resetFiles,
    updateProgress,
    setProcessingState
  };
};
