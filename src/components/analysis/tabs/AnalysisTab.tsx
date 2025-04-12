
import { useState } from "react";
import DataAnalysisCard from "@/components/analysis/DataAnalysisCard";
import DataAnalysisPrompt from "@/components/analysis/DataAnalysisPrompt";
import AnalysisResult from "@/components/analysis/AnalysisResult";
import StructuredDataUploadCard from "@/components/analysis/StructuredDataUploadCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface AnalysisTabProps {
  selectedFile: any;
  analysisResult: any;
  requestId?: string;
  onFileUploaded: (fileData: any) => void;
  onAnalysisComplete: (result: any) => void;
  onNewAnalysis: () => void;
}

const AnalysisTab = ({
  selectedFile,
  analysisResult,
  requestId,
  onFileUploaded,
  onAnalysisComplete,
  onNewAnalysis,
}: AnalysisTabProps) => {
  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        {!selectedFile && !analysisResult && <DataAnalysisCard />}
        
        {selectedFile && !analysisResult && (
          <DataAnalysisPrompt 
            fileId={selectedFile.id} 
            fileName={selectedFile.file_name}
            onAnalysisComplete={onAnalysisComplete}
          />
        )}
        
        {analysisResult && (
          <AnalysisResult 
            result={analysisResult}
            requestId={requestId} 
          />
        )}
      </div>
      <div>
        {!selectedFile ? (
          <StructuredDataUploadCard onFileUploaded={onFileUploaded} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Selected Data Source</CardTitle>
              <CardDescription>
                Your file is ready for analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-md">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedFile.file_name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.file_size)}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={onNewAnalysis}
                >
                  Upload Different File
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {selectedFile && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Available Models</CardTitle>
              <CardDescription>
                AI models for data analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-primary/10 rounded-md">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                      <span className="text-xs font-medium text-primary">GPT</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">OpenAI GPT</p>
                      <p className="text-xs text-muted-foreground">Best for natural language analysis</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled={!!analysisResult}>Select</Button>
                </div>
                
                <div className="flex items-center justify-between p-2 rounded-md">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mr-3">
                      <span className="text-xs font-medium">ML</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">AutoML</p>
                      <p className="text-xs text-muted-foreground">Automated machine learning</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled={true}>Coming Soon</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AnalysisTab;
