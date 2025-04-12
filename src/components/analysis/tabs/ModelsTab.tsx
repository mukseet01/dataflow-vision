
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ModelsTab = () => {
  return (
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
  );
};

export default ModelsTab;
