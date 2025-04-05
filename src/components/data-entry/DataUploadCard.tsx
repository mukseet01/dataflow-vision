
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SparklesIcon } from "lucide-react";
import { useFileUpload } from "@/hooks/use-file-upload";
import UploadArea from "./UploadArea";
import ProcessingProgress from "./ProcessingProgress";

const DataUploadCard = () => {
  const {
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
  } = useFileUpload();

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
          <UploadArea
            files={files}
            isDragging={isDragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onFileChange={handleFileChange}
            onRemoveFile={removeFile}
          />
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="ghost" 
          disabled={files.length === 0 || isProcessing}
          onClick={resetFiles}
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
