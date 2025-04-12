
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { useFileUpload } from "@/hooks/use-file-upload";

interface StructuredDataUploadCardProps {
  onFileUploaded: (fileData: any) => void;
}

const StructuredDataUploadCard = ({ onFileUploaded }: StructuredDataUploadCardProps) => {
  const { 
    handleDragOver, 
    handleDragLeave, 
    handleDrop, 
    handleFileChange, 
    isDragging, 
    isUploading, 
    uploadFile 
  } = useFileUpload();
  
  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFileUpload(e.target.files[0]);
    }
  };
  
  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    // Check file type
    const allowedTypes = [
      'text/csv', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
      'application/vnd.ms-excel', // xls
      'application/json'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a CSV, Excel, or JSON file");
      return;
    }
    
    try {
      // Upload file using our hook
      setIsUploading(true);
      const result = await uploadFile(file);
      
      if (result && result.id) {
        onFileUploaded(result);
        toast.success("File uploaded successfully");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Data</CardTitle>
        <CardDescription>
          Upload structured data for analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-4 transition-all ${
            isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:border-primary"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleFileDrop}
        >
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <UploadCloud className="h-7 w-7 text-primary" />
          </div>
          
          <div className="text-center">
            <p className="text-sm font-medium">
              Drag & drop your file here or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports CSV, Excel and JSON files
            </p>
          </div>
          
          <input
            type="file"
            accept=".csv,.xlsx,.xls,.json"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Select a file"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StructuredDataUploadCard;
