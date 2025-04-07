
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Expand, Download, Copy, CheckCheck } from "lucide-react";

interface AnalysisResultProps {
  result: {
    analysis_result: string;
    data_summary?: {
      shape?: [number, number];
      columns?: string[];
      dtypes?: Record<string, string>;
      head?: any[];
      missing_values?: Record<string, number>;
    };
    preview?: {
      columns?: string[];
      rows?: any[];
      total_rows?: number;
      total_columns?: number;
    };
  };
}

const AnalysisResult = ({ result }: AnalysisResultProps) => {
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);
  
  const handleCopyResult = () => {
    navigator.clipboard.writeText(result.analysis_result);
    setCopied(true);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>Analysis Result</CardTitle>
            <CardDescription>AI-generated insights from your data</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleCopyResult}>
            {copied ? <CheckCheck size={16} /> : <Copy size={16} />}
            <span className="ml-2">{copied ? "Copied" : "Copy"}</span>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap bg-muted p-4 rounded-md overflow-auto max-h-[400px]">
            {result.analysis_result}
          </div>
        </CardContent>
      </Card>
      
      {result.data_summary && (
        <Card>
          <CardHeader>
            <CardTitle>Data Summary</CardTitle>
            <CardDescription>Overview of the dataset structure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium mb-2">Dataset Size</h3>
                <p className="text-2xl font-bold">
                  {result.data_summary.shape?.[0] && formatNumber(result.data_summary.shape[0])} rows
                </p>
                <p className="text-muted-foreground">
                  {result.data_summary.shape?.[1]} columns
                </p>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium mb-2">Column Types</h3>
                <div className="space-y-1 text-sm">
                  {result.data_summary.dtypes && 
                    Object.entries(result.data_summary.dtypes)
                      .slice(0, 3)
                      .map(([col, type]) => (
                        <div key={col} className="flex justify-between">
                          <span className="truncate mr-2">{col}</span>
                          <span className="text-muted-foreground">{type}</span>
                        </div>
                      ))}
                  {result.data_summary.dtypes && 
                    Object.keys(result.data_summary.dtypes).length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{Object.keys(result.data_summary.dtypes).length - 3} more columns
                      </p>
                    )}
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium mb-2">Missing Values</h3>
                {result.data_summary.missing_values && 
                  Object.values(result.data_summary.missing_values).some(v => v > 0) ? (
                    <div className="space-y-1 text-sm">
                      {Object.entries(result.data_summary.missing_values)
                        .filter(([_, count]) => count > 0)
                        .slice(0, 3)
                        .map(([col, count]) => (
                          <div key={col} className="flex justify-between">
                            <span className="truncate mr-2">{col}</span>
                            <span className="text-muted-foreground">{count} missing</span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No missing values detected</p>
                  )}
              </div>
            </div>
            
            {result.preview?.rows && result.preview.rows.length > 0 && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">Data Preview</h3>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Expand size={14} className="mr-2" />
                        View Full Table
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-4xl">
                      <SheetHeader>
                        <SheetTitle>Data Preview</SheetTitle>
                        <SheetDescription>
                          First {result.preview.rows.length} rows of {formatNumber(result.preview.total_rows || 0)} total rows
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-6 overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {result.preview.columns?.map((col, i) => (
                                <TableHead key={i}>{col}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {result.preview.rows.map((row, i) => (
                              <TableRow key={i}>
                                {result.preview?.columns?.map((col, j) => (
                                  <TableCell key={j}>{row[col]?.toString() || ''}</TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
                
                <div className="border rounded-md overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {result.preview.columns?.slice(0, 5).map((col, i) => (
                          <TableHead key={i}>{col}</TableHead>
                        ))}
                        {(result.preview.columns?.length || 0) > 5 && (
                          <TableHead>...</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.preview.rows.slice(0, 5).map((row, i) => (
                        <TableRow key={i}>
                          {result.preview?.columns?.slice(0, 5).map((col, j) => (
                            <TableCell key={j}>{row[col]?.toString() || ''}</TableCell>
                          ))}
                          {(result.preview.columns?.length || 0) > 5 && (
                            <TableCell>...</TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {(result.preview.rows.length || 0) > 5 && (
                  <p className="text-xs text-muted-foreground text-right mt-1">
                    Showing 5 of {result.preview.rows.length} rows
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalysisResult;
