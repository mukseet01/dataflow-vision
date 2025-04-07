
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SparklesIcon, FileSpreadsheet, FileBarChart2, Database } from "lucide-react";
import { useFileUpload } from "@/hooks/use-file-upload";
import UploadArea from "@/components/data-entry/UploadArea";
import ProcessingProgress from "@/components/data-entry/ProcessingProgress";
import { toast } from "sonner";

interface StructuredDataUploadCardProps {
  onFileUploaded?: (fileData: any) => void;
}

const StructuredDataUploadCard = ({ onFileUploaded }: StructuredDataUploadCardProps) => {
  const [fileType, setFileType] = useState<string>("excel");
  
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
  
  // Filter accepted file types based on selection
  const getAcceptedTypes = () => {
    switch (fileType) {
      case "excel":
        return ".xlsx,.xls,.csv";
      case "json":
        return ".json";
      case "database":
        return ".sqlite,.db";
      default:
        return ".xlsx,.xls,.csv,.json,.sqlite,.db";
    }
  };
  
  const handleProcess = async () => {
    try {
      const uploadedFiles = await processFiles();
      
      if (uploadedFiles && uploadedFiles.length > 0 && onFileUploaded) {
        onFileUploaded(uploadedFiles[0]);
        toast.success(`File uploaded successfully: ${uploadedFiles[0].file_name}`);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Data for Analysis</CardTitle>
        <CardDescription>
          Upload structured data files for AI-powered analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant={fileType === "excel" ? "default" : "outline"}
            size="sm"
            onClick={() => setFileType("excel")}
            className="flex items-center"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1" />
            Excel/CSV
          </Button>
          <Button
            type="button"
            variant={fileType === "json" ? "default" : "outline"}
            size="sm"
            onClick={() => setFileType("json")}
            className="flex items-center"
          >
            <FileBarChart2 className="h-4 w-4 mr-1" />
            JSON
          </Button>
          <Button
            type="button"
            variant={fileType === "database" ? "default" : "outline"}
            size="sm"
            onClick={() => setFileType("database")}
            className="flex items-center"
          >
            <Database className="h-4 w-4 mr-1" />
            Database
          </Button>
        </div>
        
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
            acceptedFileTypes={getAcceptedTypes()}
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
          onClick={handleProcess} 
          disabled={files.length === 0 || isProcessing}
        >
          <SparklesIcon className="h-4 w-4 mr-1" /> Upload for Analysis
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StructuredDataUploadCard;
