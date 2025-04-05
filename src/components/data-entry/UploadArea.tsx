
import { useRef } from "react";
import FileDropZone from "./FileDropZone";
import FileList from "./FileList";
import { FileWithPreview } from "@/utils/fileUtils";

interface UploadAreaProps {
  files: FileWithPreview[];
  isDragging: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
}

const UploadArea = ({
  files,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
  onRemoveFile
}: UploadAreaProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <>
      <FileDropZone
        isDragging={isDragging}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={handleClick}
      />
      <input
        ref={fileInputRef}
        id="file-upload"
        type="file"
        multiple
        accept=".pdf,.xlsx,.xls,.csv,.json"
        className="hidden"
        onChange={onFileChange}
      />
      <FileList 
        files={files} 
        onRemoveFile={onRemoveFile} 
      />
    </>
  );
};

export default UploadArea;
