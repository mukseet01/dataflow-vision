
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/layout/MainLayout";
import AnalysisTab from "@/components/analysis/tabs/AnalysisTab";
import ReportsTab from "@/components/analysis/tabs/ReportsTab";
import ModelsTab from "@/components/analysis/tabs/ModelsTab";
import SavedAnalysesTab from "@/components/analysis/tabs/SavedAnalysesTab";
import AnalysisPageHeader from "@/components/analysis/AnalysisPageHeader";

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
        <AnalysisPageHeader onNewAnalysis={handleNewAnalysis} />

        <Tabs defaultValue="analysis" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="models">AI Models</TabsTrigger>
            <TabsTrigger value="saved">Saved Analyses</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-4">
            <AnalysisTab 
              selectedFile={selectedFile}
              analysisResult={analysisResult}
              requestId={requestId}
              onFileUploaded={handleFileUploaded}
              onAnalysisComplete={handleAnalysisComplete}
              onNewAnalysis={handleNewAnalysis}
            />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <ReportsTab />
          </TabsContent>

          <TabsContent value="models" className="space-y-4">
            <ModelsTab />
          </TabsContent>

          <TabsContent value="saved" className="space-y-4">
            <SavedAnalysesTab />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Analysis;
