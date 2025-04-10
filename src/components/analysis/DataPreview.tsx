
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Expand } from "lucide-react";

interface DataPreviewProps {
  preview: {
    columns?: string[];
    rows?: any[];
    total_rows?: number;
    total_columns?: number;
  };
}

const DataPreview = ({ preview }: DataPreviewProps) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
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
                First {preview.rows?.length} rows of {formatNumber(preview.total_rows || 0)} total rows
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {preview.columns?.map((col, i) => (
                      <TableHead key={i}>{col}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.rows?.map((row, i) => (
                    <TableRow key={i}>
                      {preview.columns?.map((col, j) => (
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
              {preview.columns?.slice(0, 5).map((col, i) => (
                <TableHead key={i}>{col}</TableHead>
              ))}
              {(preview.columns?.length || 0) > 5 && (
                <TableHead>...</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {preview.rows?.slice(0, 5).map((row, i) => (
              <TableRow key={i}>
                {preview.columns?.slice(0, 5).map((col, j) => (
                  <TableCell key={j}>{row[col]?.toString() || ''}</TableCell>
                ))}
                {(preview.columns?.length || 0) > 5 && (
                  <TableCell>...</TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {(preview.rows?.length || 0) > 5 && (
        <p className="text-xs text-muted-foreground text-right mt-1">
          Showing 5 of {preview.rows?.length} rows
        </p>
      )}
    </div>
  );
};

export default DataPreview;
