
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import DataUploadCard from "@/components/data-entry/DataUploadCard";
import MainLayout from "@/components/layout/MainLayout";

const DataEntry = () => {
  return (
    <MainLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Data Entry</h1>
            <p className="text-muted-foreground">
              Upload and process data with AI automation
            </p>
          </div>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </div>

        <Tabs defaultValue="upload" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upload">Upload Files</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <DataUploadCard />
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Tips</CardTitle>
                    <CardDescription>
                      Make the most of AI data entry
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Supported Formats</h3>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• PDF documents and scanned images</li>
                          <li>• Excel spreadsheets (.xlsx, .xls)</li>
                          <li>• CSV and structured data files</li>
                          <li>• JSON data exports</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Best Practices</h3>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Ensure scanned documents are clear</li>
                          <li>• Group similar document types together</li>
                          <li>• Use templates for recurring document types</li>
                          <li>• Validate AI-extracted data when needed</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manual Data Entry</CardTitle>
                <CardDescription>
                  Create and edit data entries with AI assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border border-dashed rounded-md">
                  <p className="text-muted-foreground">Manual data entry form will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Entry Templates</CardTitle>
                <CardDescription>
                  Create and manage custom templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border border-dashed rounded-md">
                  <p className="text-muted-foreground">Templates management view will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Entry History</CardTitle>
                <CardDescription>
                  View and manage previous data entry sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border border-dashed rounded-md">
                  <p className="text-muted-foreground">Data entry history will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default DataEntry;
