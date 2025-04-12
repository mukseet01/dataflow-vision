
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SavedAnalysesTab = () => {
  return (
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
  );
};

export default SavedAnalysesTab;
