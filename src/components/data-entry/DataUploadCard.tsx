
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SparklesIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileWithPreview, isValidFileType } from "@/utils/fileUtils";
import { uploadFile, processFile } from "@/services/uploadService";
import FileDropZone from "./FileDropZone";
import FileList from "./FileList";
import ProcessingProgress from "./ProcessingProgress";

const DataUploadCard = () => {
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
        description: "Only PDF, Excel, CSV, and JSON files are supported.",
        variant: "destructive",
      });
    }
    
    const filesWithPreview = validFiles.map(file => {
      if (file.type.startsWith("image/")) {
        return Object.assign(file, {
          preview: URL.createObjectURL(file)
        });
      }
      return file;
    });
    
    setFiles(prev => [...prev, ...filesWithPreview]);
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
          
          // Process the file with our edge function
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Data</CardTitle>
        <CardDescription>
          Upload files for AI-powered data extraction and processing
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isProcessing ? (
          <ProcessingProgress progress={progress} />
        ) : (
          <>
            <FileDropZone
              isDragging={isDragging}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-upload")?.click()}
            />
            <input
              id="file-upload"
              type="file"
              multiple
              accept=".pdf,.xlsx,.xls,.csv,.json"
              className="hidden"
              onChange={handleFileChange}
            />
            <FileList 
              files={files} 
              onRemoveFile={removeFile} 
            />
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="ghost" 
          disabled={files.length === 0 || isProcessing}
          onClick={() => setFiles([])}
        >
          Cancel
        </Button>
        <Button 
          onClick={processFiles} 
          disabled={files.length === 0 || isProcessing}
        >
          <SparklesIcon className="h-4 w-4 mr-1" /> Process with AI
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DataUploadCard;
