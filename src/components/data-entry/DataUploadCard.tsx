
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileUpIcon, PlusIcon, SparklesIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileWithPreview extends File {
  preview?: string;
}

const DataUploadCard = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

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
    const validFiles = newFiles.filter(file => 
      file.type === "application/pdf" || 
      file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel" ||
      file.type === "text/csv" ||
      file.type === "application/json"
    );
    
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

  const processFiles = () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setProgress(0);
    
    // Simulate processing
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 5;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsProcessing(false);
            setFiles([]);
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 150);
  };

  const getFileIcon = (file: File) => {
    if (file.type.includes("pdf")) return "📄";
    if (file.type.includes("spreadsheet") || file.type.includes("excel") || file.type.includes("csv")) return "📊";
    if (file.type.includes("json")) return "📝";
    return "📁";
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
          <div className="space-y-4">
            <div className="text-center py-8">
              <SparklesIcon className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-medium mb-2">Processing with AI</h3>
              <p className="text-muted-foreground mb-4">
                Our AI is extracting and processing data from your files
              </p>
              <Progress value={progress} className="h-2 w-full" />
              <p className="text-xs text-muted-foreground mt-2">{progress}% complete</p>
            </div>
          </div>
        ) : (
          <>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragging 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50 hover:bg-secondary/50"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <FileUpIcon className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-1">Drop files here or click to upload</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Support for PDF, Excel, CSV, and JSON files
              </p>
              <Button type="button" size="sm" variant="secondary">
                <PlusIcon className="h-4 w-4 mr-1" /> Select Files
              </Button>
              <input
                id="file-upload"
                type="file"
                multiple
                accept=".pdf,.xlsx,.xls,.csv,.json"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {files.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">Selected files ({files.length})</h4>
                <ul className="space-y-2">
                  {files.map((file, index) => (
                    <li
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between bg-secondary/50 rounded-md p-2 text-sm"
                    >
                      <div className="flex items-center">
                        <span className="mr-2 text-lg">{getFileIcon(file)}</span>
                        <div>
                          <p className="font-medium truncate max-w-[240px]">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                      >
                        <XIcon className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" disabled={files.length === 0 || isProcessing}>
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
