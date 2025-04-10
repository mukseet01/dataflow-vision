import { useState } from "react";
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
  const { upload, progress, fileData, error, reset } = useFileUpload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (file) {
      await upload(file);
    }
  };

  const handleReset = () => {
    setFile(null);
    reset();
  };

  React.useEffect(() => {
    if (fileData) {
      onFileUploaded(fileData);
    }
  }, [fileData, onFileUploaded]);

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
        {error && (
          <p className="text-sm text-destructive mt-2">Error: {error}</p>
        )}
        {progress > 0 && (
          <Progress value={progress} className="mt-4" />
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {file && (
          <Button variant="ghost" size="sm" onClick={handleReset} disabled={progress > 0}>
            <X className="mr-2 h-4 w-4" />
            Remove
          </Button>
        )}
        <Button onClick={handleUpload} disabled={!file || progress > 0}>
          {progress > 0 ? "Uploading..." : "Upload"}
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
