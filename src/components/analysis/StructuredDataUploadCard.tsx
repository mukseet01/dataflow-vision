
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, X, FileType } from "lucide-react";
import { useFileUpload } from "@/hooks/use-file-upload";
import { Progress } from "@/components/ui/progress";

interface StructuredDataUploadCardProps {
  onFileUploaded: (fileData: any) => void;
}

const StructuredDataUploadCard = ({ onFileUploaded }: StructuredDataUploadCardProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const { 
    files, 
    handleFileChange: handleFileUploadChange, 
    processFiles, 
    isProcessing, 
    progress,
    resetFiles
  } = useFileUpload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (file) {
      setIsUploading(true);
      setUploadProgress(10);
      
      try {
        // Simulate file upload process
        setUploadProgress(50);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUploadProgress(100);
        
        // Add file to the useFileUpload hook for processing
        handleFileUploadChange({
          target: { files: [file] }
        } as React.ChangeEvent<HTMLInputElement>);
        
        // Process the file
        await processFiles();
        
        // The most recent file would be the last one in the files array
        if (files.length > 0) {
          const uploadedFile = files[files.length - 1];
          // Simulate getting file data from the server
          const fileData = {
            id: `file-${Date.now()}`,
            file_name: uploadedFile.name,
            file_size: uploadedFile.size,
            file_type: uploadedFile.type
          };
          onFileUploaded(fileData);
        }
      } catch (error) {
        console.error("Upload error:", error);
        setUploadError("Failed to upload file. Please try again.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleReset = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadError(null);
    resetFiles();
  };

  useEffect(() => {
    return () => {
      // Cleanup function
      if (file && 'preview' in file && file.preview) {
        URL.revokeObjectURL(file.preview as string);
      }
    };
  }, [file]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Structured Data</CardTitle>
        <CardDescription>
          Supported formats: CSV, XLSX, JSON
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!file ? (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md bg-muted/50 text-muted-foreground">
            <UploadCloud className="h-10 w-10 mb-4" />
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-sm hover:text-primary transition-colors"
            >
              Click to upload a file
            </label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".csv, .xlsx, .json"
            />
          </div>
        ) : (
          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-md">
            <FileType className="h-10 w-10" />
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
          </div>
        )}
        {uploadError && (
          <p className="text-sm text-destructive mt-2">Error: {uploadError}</p>
        )}
        {uploadProgress > 0 && (
          <Progress value={uploadProgress} className="mt-4" />
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {file && (
          <Button variant="ghost" size="sm" onClick={handleReset} disabled={isUploading}>
            <X className="mr-2 h-4 w-4" />
            Remove
          </Button>
        )}
        <Button onClick={handleUpload} disabled={!file || isUploading}>
          {isUploading ? "Uploading..." : "Upload"}
        </Button>
      </CardFooter>
    </Card>
  );
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default StructuredDataUploadCard;
