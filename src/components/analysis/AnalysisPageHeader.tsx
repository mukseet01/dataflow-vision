
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

interface AnalysisPageHeaderProps {
  onNewAnalysis: () => void;
}

const AnalysisPageHeader = ({ onNewAnalysis }: AnalysisPageHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Analysis</h1>
        <p className="text-muted-foreground">
          Analyze your data with AI-powered insights
        </p>
      </div>
      <Button onClick={onNewAnalysis}>
        <PlusIcon className="mr-2 h-4 w-4" />
        New Analysis
      </Button>
    </div>
  );
};

export default AnalysisPageHeader;
