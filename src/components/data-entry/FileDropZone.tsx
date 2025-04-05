
import { FileUpIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileDropZoneProps {
  isDragging: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onClick: () => void;
}

const FileDropZone = ({ 
  isDragging, 
  onDragOver, 
  onDragLeave, 
  onDrop, 
  onClick 
}: FileDropZoneProps) => {
  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
        isDragging 
          ? "border-primary bg-primary/5" 
          : "border-border hover:border-primary/50 hover:bg-secondary/50"
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
    >
      <FileUpIcon className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-1">Drop files here or click to upload</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Support for PDF, Excel, CSV, JSON, images, and documents
      </p>
      <div className="mb-4">
        <p className="text-xs text-muted-foreground">
          Size limits: PDF (50MB), Images (10MB), Excel (10-20MB), CSV (10MB), Text (5MB), Word (10MB)
        </p>
      </div>
      <Button type="button" size="sm" variant="secondary">
        <PlusIcon className="h-4 w-4 mr-1" /> Select Files
      </Button>
    </div>
  );
};

export default FileDropZone;
