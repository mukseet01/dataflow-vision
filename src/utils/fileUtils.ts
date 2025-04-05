
export interface FileWithPreview extends File {
  preview?: string;
}

export const getFileIcon = (file: File) => {
  if (file.type.includes("pdf")) return "📄";
  if (file.type.includes("spreadsheet") || file.type.includes("excel") || file.type.includes("csv")) return "📊";
  if (file.type.includes("json")) return "📝";
  return "📁";
};

export const isValidFileType = (file: File): boolean => {
  return (
    file.type === "application/pdf" || 
    file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.type === "application/vnd.ms-excel" ||
    file.type === "text/csv" ||
    file.type === "application/json"
  );
};
