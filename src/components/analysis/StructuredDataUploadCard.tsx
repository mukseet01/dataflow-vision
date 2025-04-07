
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { FileSpreadsheet, Upload, AlertCircle } from "lucide-react";
import useFileUpload from "@/hooks/use-file-upload";
import UploadArea from "@/components/data-entry/UploadArea";

const FILE_TYPES = {
  SPREADSHEETS: {
    label: "Spreadsheets",
    formats: ".csv,.xlsx,.xls",
    icon: <FileSpreadsheet className="h-5 w-5" />
  }
};

interface StructuredDataUploadCardProps {
  onFileUploaded: (fileData: any) => void;
}

const StructuredDataUploadCard = ({ onFileUploaded }: StructuredDataUploadCardProps) => {
  const [selectedType, setSelectedType] = useState<string>("SPREADSHEETS");
  
  const {
    files,
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange,
    removeFile,
    processFiles,
    resetFiles
  } = useFileUpload();
  
  // Filter accepted file types based on selection
  const acceptedFileTypes = FILE_TYPES[selectedType as keyof typeof FILE_TYPES]?.formats || "";
  
  const isUploadButtonDisabled = files.length === 0;
  
  const handleTypeSelection = (type: string) => {
    if (files.length > 0) {
      resetFiles();
    }
    setSelectedType(type);
  };
  
  const handleProcess = async () => {
    try {
      const uploadedFiles = await processFiles();
      
      if (uploadedFiles && uploadedFiles.length > 0 && onFileUploaded) {
        onFileUploaded(uploadedFiles[0]);
        toast.success(`File uploaded successfully: ${uploadedFiles[0].file_name}`);
      }
    } catch (error) {
      console.error("Error processing files:", error);
      toast.error("Failed to process files. Please try again.");
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          <CardTitle>Data Source</CardTitle>
        </div>
        <CardDescription>
          Upload a structured data file for analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="px-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {Object.entries(FILE_TYPES).map(([key, { label, icon }]) => (
              <Button
                key={key}
                variant={selectedType === key ? "default" : "outline"}
                size="sm"
                onClick={() => handleTypeSelection(key)}
                className="flex items-center gap-1"
              >
                {icon}
                {label}
              </Button>
            ))}
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Upload file</p>
            <UploadArea
              files={files}
              isDragging={isDragging}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onFileChange={handleFileChange}
              onRemoveFile={removeFile}
              acceptedFileTypes={acceptedFileTypes}
            />
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-2 rounded-md">
            <div className="flex gap-2 items-start">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-300">
                Supported formats: CSV, Excel. Maximum file size: 50MB.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/50 p-4 flex justify-end">
        <Button 
          onClick={handleProcess}
          disabled={isUploadButtonDisabled}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload for Analysis
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StructuredDataUploadCard;
