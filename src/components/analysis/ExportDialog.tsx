
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText, Presentation, File } from "lucide-react";
import { exportAnalysisReport } from "@/services/analysisService";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string;
}

const ExportDialog = ({ open, onOpenChange, requestId }: ExportDialogProps) => {
  const [exportTitle, setExportTitle] = useState("Data Analysis Report");
  const [exportFormat, setExportFormat] = useState<'pdf' | 'pptx' | 'xlsx' | 'docx'>('pdf');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportAnalysisReport(requestId, {
        format: exportFormat,
        title: exportTitle
      });
      onOpenChange(false);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Analysis Report</DialogTitle>
          <DialogDescription>
            Choose a format and title for your exported report
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="title" className="text-right">Title</label>
            <Input 
              id="title" 
              value={exportTitle}
              onChange={(e) => setExportTitle(e.target.value)}
              className="col-span-3"
              placeholder="Enter report title" 
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right">Format</label>
            <div className="col-span-3 flex flex-wrap gap-2">
              <Button 
                variant={exportFormat === 'pdf' ? "default" : "outline"} 
                size="sm"
                onClick={() => setExportFormat('pdf')}
              >
                <File className="mr-1 h-4 w-4" /> PDF
              </Button>
              <Button 
                variant={exportFormat === 'pptx' ? "default" : "outline"} 
                size="sm"
                onClick={() => setExportFormat('pptx')}
              >
                <Presentation className="mr-1 h-4 w-4" /> PowerPoint
              </Button>
              <Button 
                variant={exportFormat === 'docx' ? "default" : "outline"} 
                size="sm"
                onClick={() => setExportFormat('docx')}
              >
                <FileText className="mr-1 h-4 w-4" /> Word
              </Button>
              <Button 
                variant={exportFormat === 'xlsx' ? "default" : "outline"} 
                size="sm"
                onClick={() => setExportFormat('xlsx')}
              >
                <FileSpreadsheet className="mr-1 h-4 w-4" /> Excel
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? "Exporting..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
