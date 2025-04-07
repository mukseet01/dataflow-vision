import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { createAnalysisRequest } from "@/services/analysisService";
import { toast } from "sonner";

interface DataAnalysisPromptProps {
  fileId: string;
  fileName: string;
  onAnalysisComplete?: (result: any) => void;
}

const DataAnalysisPrompt = ({ 
  fileId, 
  fileName,
  onAnalysisComplete 
}: {
  fileId: string;
  fileName: string;
  onAnalysisComplete: (result: any) => void;
}) => {
  const [prompt, setPrompt] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };
  
  const handleSubmitPrompt = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter an analysis prompt");
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      const result = await createAnalysisRequest({
        prompt,
        fileId
      });
      
      if (result) {
        onAnalysisComplete({
          result: result,
          requestId: result.requestId
        });
      }
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const promptSuggestions = [
    "Analyze the relationship between column A and column B",
    "Find the top 5 values in this dataset and explain why they stand out",
    "Create a summary of key trends in the data",
    "Generate a correlation matrix for numeric columns",
    "Calculate summary statistics and identify outliers"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Analysis Prompt</CardTitle>
        <CardDescription>
          Ask an AI to analyze "{fileName}"
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmitPrompt}>
        <CardContent className="space-y-4">
          <Textarea 
            placeholder="Describe what analysis you want to perform on this data..." 
            className="min-h-[120px]"
            value={prompt}
            onChange={handlePromptChange}
          />
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Suggested prompts:</p>
            <div className="flex flex-wrap gap-2">
              {promptSuggestions.map((suggestion, i) => (
                <Button 
                  key={i} 
                  type="button"
                  size="sm"
                  variant="outline" 
                  onClick={() => setPrompt(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isAnalyzing || !prompt.trim()}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze with AI
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default DataAnalysisPrompt;
