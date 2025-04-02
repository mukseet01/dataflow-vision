
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import DataAnalysisCard from "@/components/analysis/DataAnalysisCard";
import MainLayout from "@/components/layout/MainLayout";

const Analysis = () => {
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
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Analysis
          </Button>
        </div>

        <Tabs defaultValue="analysis" className="space-y-4">
          <TabsList>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="models">AI Models</TabsTrigger>
            <TabsTrigger value="saved">Saved Analyses</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <DataAnalysisCard />
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Available Data Sources</CardTitle>
                    <CardDescription>
                      Select data for your analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Recently Added</h3>
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full justify-start text-sm">
                            <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                            Q2 Financial Data
                          </Button>
                          <Button variant="outline" className="w-full justify-start text-sm">
                            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                            Customer Feedback Survey
                          </Button>
                          <Button variant="outline" className="w-full justify-start text-sm">
                            <span className="w-2 h-2 rounded-full bg-purple-500 mr-2" />
                            Marketing Campaign Results
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Connected Sources</h3>
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full justify-start text-sm">
                            <span className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
                            CRM Database
                          </Button>
                          <Button variant="outline" className="w-full justify-start text-sm">
                            <span className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                            Sales Dashboard
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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

export default Analysis;
