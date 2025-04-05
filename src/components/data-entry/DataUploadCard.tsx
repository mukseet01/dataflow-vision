
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileUpIcon, PlusIcon, SparklesIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FileWithPreview extends File {
  preview?: string;
}

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
    const validFiles = newFiles.filter(file => 
      file.type === "application/pdf" || 
      file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel" ||
      file.type === "text/csv" ||
      file.type === "application/json"
    );
    
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

  const uploadFile = async (file: File) => {
    try {
      // Upload file to Supabase Storage
      const filename = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(filename, file);

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from("uploads")
        .getPublicUrl(filename);

      // Save file metadata to database - Fixed TypeScript errors here
      const { data: fileData, error: fileError } = await supabase
        .from('file_uploads')
        .insert({
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          original_path: publicUrl,
          ocr_required: file.type === "application/pdf",
        })
        .select()
        .single();

      if (fileError) {
        throw new Error(fileError.message);
      }

      return fileData;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
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
          const { error } = await supabase.functions.invoke('process-document', {
            body: { fileId: fileData.id }
          });
          
          if (error) throw new Error(error.message);
          
          // Update progress
          setProgress(prev => Math.min(prev + progressIncrement, 100));
          
          return fileData;
        } catch (error) {
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
      
    } catch (error) {
      console.error("Error during file processing:", error);
      toast({
        title: "Processing Failed",
        description: `An unexpected error occurred. ${error.message}`,
        variant: "destructive",
      });
      setIsProcessing(false);
    }
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
              <p className="text-xs text-muted-foreground mt-2">{Math.round(progress)}% complete</p>
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
