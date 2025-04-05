
import { SparklesIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProcessingProgressProps {
  progress: number;
}

const ProcessingProgress = ({ progress }: ProcessingProgressProps) => {
  return (
    <div className="text-center py-8">
      <SparklesIcon className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
      <h3 className="text-lg font-medium mb-2">Processing with AI</h3>
      <p className="text-muted-foreground mb-4">
        Our AI is extracting and processing data from your files
      </p>
      <Progress value={progress} className="h-2 w-full" />
      <p className="text-xs text-muted-foreground mt-2">{Math.round(progress)}% complete</p>
    </div>
  );
};

export default ProcessingProgress;
