
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy, CheckCheck } from "lucide-react";

interface AnalysisTextCardProps {
  analysisResult: string;
  requestId?: string;
  copied: boolean;
  onCopy: () => void;
  onOpenExportDialog: () => void;
}

const AnalysisTextCard = ({ 
  analysisResult, 
  requestId, 
  copied, 
  onCopy, 
  onOpenExportDialog 
}: AnalysisTextCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Analysis Result</CardTitle>
          <CardDescription>AI-generated insights from your data</CardDescription>
        </div>
        <div className="flex space-x-2">
          {requestId && (
            <Button variant="outline" size="sm" onClick={onOpenExportDialog}>
              <Download size={16} className="mr-2" />
              Export
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onCopy}>
            {copied ? <CheckCheck size={16} /> : <Copy size={16} />}
            <span className="ml-2">{copied ? "Copied" : "Copy"}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-wrap bg-muted p-4 rounded-md overflow-auto max-h-[400px]">
          {analysisResult}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisTextCard;
