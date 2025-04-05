
export interface FileWithPreview extends File {
  preview?: string;
}

export const getFileIcon = (file: File) => {
  if (file.type.includes("pdf")) return "📄";
  if (file.type.includes("spreadsheet") || file.type.includes("excel") || file.type.includes("csv")) return "📊";
  if (file.type.includes("json")) return "📝";
  if (file.type.includes("image")) return "🖼️";
  if (file.type.includes("document") || file.type.includes("docx")) return "📃";
  if (file.type.includes("text/plain")) return "📋";
  return "📁";
};

export const isValidFileType = (file: File): boolean => {
  return (
    file.type === "application/pdf" || 
    file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.type === "application/vnd.ms-excel" ||
    file.type === "text/csv" ||
    file.type === "application/json" ||
    file.type === "image/png" ||
    file.type === "image/jpeg" ||
    file.type === "image/tiff" ||
    file.type === "text/plain" ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
};

export const getFileTypeLabel = (file: File): string => {
  if (file.type === "application/pdf") return "PDF";
  if (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") return "Excel";
  if (file.type === "application/vnd.ms-excel") return "Excel";
  if (file.type === "text/csv") return "CSV";
  if (file.type === "application/json") return "JSON";
  if (file.type === "image/png") return "PNG";
  if (file.type === "image/jpeg") return "JPEG";
  if (file.type === "image/tiff") return "TIFF";
  if (file.type === "text/plain") return "Text";
  if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "Word";
  return "Unknown";
};

export const getFileSizeLimit = (fileType: string): number => {
  const fileSizeLimits = {
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
  
  return fileSizeLimits[fileType as keyof typeof fileSizeLimits] || 5;
};
