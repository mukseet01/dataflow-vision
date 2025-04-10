
import { useToast } from "@/hooks/use-toast";
import { isValidFileType, FileWithPreview } from "@/utils/fileUtils";

export const useFileValidation = () => {
  const { toast } = useToast();

  // File size limits in MB
  const fileSizeLimits: Record<string, number> = {
    "application/pdf": 50,
    "image/png": 10,
    "image/jpeg": 10,
    "text/csv": 10,
    "application/vnd.ms-excel": 10,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": 20,
    "image/tiff": 20,
    "text/plain": 5,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": 10
  };

  const validateFiles = (files: File[]): FileWithPreview[] => {
    // Filter for valid file types
    const validTypeFiles = files.filter(isValidFileType);
    
    if (validTypeFiles.length !== files.length) {
      toast({
        title: "Unsupported file type",
        description: "Only PDF, Excel, CSV, JSON, images and document files are supported.",
        variant: "destructive",
      });
    }
    
    // Check file size limits
    const invalidSizeFiles = validTypeFiles.filter(file => {
      const sizeLimit = fileSizeLimits[file.type as keyof typeof fileSizeLimits];
      if (!sizeLimit) return false;
      
      const fileSizeMB = file.size / (1024 * 1024);
      return fileSizeMB > sizeLimit;
    });

    if (invalidSizeFiles.length > 0) {
      toast({
        title: "File size exceeds limit",
        description: `Some files exceed the size limit: ${invalidSizeFiles.map(f => f.name).join(', ')}`,
        variant: "destructive",
      });
    }
    
    // Filter out invalid size files
    const validFiles = validTypeFiles.filter(file => {
      const sizeLimit = fileSizeLimits[file.type as keyof typeof fileSizeLimits];
      if (!sizeLimit) return true;
      
      const fileSizeMB = file.size / (1024 * 1024);
      return fileSizeMB <= sizeLimit;
    });

    // Add preview URLs to image files
    return validFiles.map(file => {
      if (file.type.startsWith("image/")) {
        return Object.assign(file, {
          preview: URL.createObjectURL(file)
        });
      }
      return file as FileWithPreview;
    });
  };

  return { validateFiles };
};
