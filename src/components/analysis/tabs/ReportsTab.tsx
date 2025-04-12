
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ReportsTab = () => {
  return (
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
  );
};

export default ReportsTab;
