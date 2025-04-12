import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Expand, 
  Download, 
  Copy, 
  CheckCheck,
  FileSpreadsheet,
  FileText,
  Presentation, 
  File 
} from "lucide-react";
import { exportAnalysisReport } from "@/services/analysisService";
import ExportDialog from "./ExportDialog";
import AnalysisTextCard from "./AnalysisTextCard";
import DataSummaryCard from "./DataSummaryCard";

interface AnalysisResultProps {
  result: {
    analysis_result: string;
    data_summary?: {
      shape?: [number, number];
      columns?: string[];
      dtypes?: Record<string, string>;
      head?: any[];
      missing_values?: Record<string, number>;
    };
    preview?: {
      columns?: string[];
      rows?: any[];
      total_rows?: number;
      total_columns?: number;
    };
  };
  requestId?: string;
}

const AnalysisResult = ({ result, requestId }: AnalysisResultProps) => {
  const [copied, setCopied] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);
  
  const handleCopyResult = () => {
    navigator.clipboard.writeText(result.analysis_result);
    setCopied(true);
  };

  return (
    <div className="space-y-4">
      <AnalysisTextCard 
        analysisResult={result.analysis_result} 
        requestId={requestId} 
        copied={copied} 
        onCopy={handleCopyResult}
        onOpenExportDialog={() => setExportDialogOpen(true)} 
      />
      
      {result.data_summary && (
        <DataSummaryCard 
          dataSummary={result.data_summary}
          preview={result.preview}
        />
      )}

      {requestId && (
        <ExportDialog 
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          requestId={requestId}
        />
      )}
    </div>
  );
};

export default AnalysisResult;
