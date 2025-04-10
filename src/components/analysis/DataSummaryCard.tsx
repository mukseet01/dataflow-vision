
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Expand } from "lucide-react";
import DataPreview from "./DataPreview";

interface DataSummaryCardProps {
  dataSummary: {
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
}

const DataSummaryCard = ({ dataSummary, preview }: DataSummaryCardProps) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
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
              {dataSummary.shape?.[0] && formatNumber(dataSummary.shape[0])} rows
            </p>
            <p className="text-muted-foreground">
              {dataSummary.shape?.[1]} columns
            </p>
          </div>
          
          <div className="border rounded-md p-4">
            <h3 className="text-sm font-medium mb-2">Column Types</h3>
            <div className="space-y-1 text-sm">
              {dataSummary.dtypes && 
                Object.entries(dataSummary.dtypes)
                  .slice(0, 3)
                  .map(([col, type]) => (
                    <div key={col} className="flex justify-between">
                      <span className="truncate mr-2">{col}</span>
                      <span className="text-muted-foreground">{type}</span>
                    </div>
                  ))}
              {dataSummary.dtypes && 
                Object.keys(dataSummary.dtypes).length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{Object.keys(dataSummary.dtypes).length - 3} more columns
                  </p>
                )}
            </div>
          </div>
          
          <div className="border rounded-md p-4">
            <h3 className="text-sm font-medium mb-2">Missing Values</h3>
            {dataSummary.missing_values && 
              Object.values(dataSummary.missing_values).some(v => v > 0) ? (
                <div className="space-y-1 text-sm">
                  {Object.entries(dataSummary.missing_values)
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
        
        {preview?.rows && preview.rows.length > 0 && (
          <DataPreview preview={preview} />
        )}
      </CardContent>
    </Card>
  );
};

export default DataSummaryCard;
