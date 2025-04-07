
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusIcon, Upload } from "lucide-react";
import DataAnalysisCard from "@/components/analysis/DataAnalysisCard";
import DataAnalysisPrompt from "@/components/analysis/DataAnalysisPrompt";
import AnalysisResult from "@/components/analysis/AnalysisResult";
import StructuredDataUploadCard from "@/components/analysis/StructuredDataUploadCard";
import MainLayout from "@/components/layout/MainLayout";

const Analysis = () => {
  const [activeTab, setActiveTab] = useState("analysis");
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [requestId, setRequestId] = useState<string | undefined>(undefined);
  
  const handleFileUploaded = (fileData: any) => {
    setSelectedFile(fileData);
    setAnalysisResult(null);
    setRequestId(undefined);
  };
  
  const handleAnalysisComplete = (result: any) => {
    setAnalysisResult(result.result);
    setRequestId(result.requestId);
  };
  
  const handleNewAnalysis = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
    setRequestId(undefined);
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Data Analysis</h1>
            <p className="text-muted-foreground">
              Analyze your data with AI-powered insights
            </p>
          </div>
          <Button onClick={handleNewAnalysis}>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Analysis
          </Button>
        </div>

        <Tabs defaultValue="analysis" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="models">AI Models</TabsTrigger>
            <TabsTrigger value="saved">Saved Analyses</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                {!selectedFile && !analysisResult && <DataAnalysisCard />}
                
                {selectedFile && !analysisResult && (
                  <DataAnalysisPrompt 
                    fileId={selectedFile.id} 
                    fileName={selectedFile.file_name}
                    onAnalysisComplete={handleAnalysisComplete}
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
                  <StructuredDataUploadCard onFileUploaded={handleFileUploaded} />
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
                          onClick={handleNewAnalysis}
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
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generated Reports</CardTitle>
                <CardDescription>
                  View and manage your analysis reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border border-dashed rounded-md">
                  <p className="text-muted-foreground">Reports view will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="models" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Models</CardTitle>
                <CardDescription>
                  Manage and customize AI models for your data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border border-dashed rounded-md">
                  <p className="text-muted-foreground">AI models management view will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Saved Analyses</CardTitle>
                <CardDescription>
                  Access your previously saved analyses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border border-dashed rounded-md">
                  <p className="text-muted-foreground">Saved analyses will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default Analysis;
