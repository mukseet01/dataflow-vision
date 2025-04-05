
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileWithPreview, getFileIcon } from "@/utils/fileUtils";

interface FileListProps {
  files: FileWithPreview[];
  onRemoveFile: (index: number) => void;
}

const FileList = ({ files, onRemoveFile }: FileListProps) => {
  if (files.length === 0) return null;

  return (
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
                onRemoveFile(index);
              }}
            >
              <XIcon className="h-4 w-4 text-muted-foreground" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;
