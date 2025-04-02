
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";
import { cn } from "@/lib/utils";

const data = [
  { month: "Jan", documents: 45, accuracy: 92 },
  { month: "Feb", documents: 52, accuracy: 93 },
  { month: "Mar", documents: 48, accuracy: 95 },
  { month: "Apr", documents: 70, accuracy: 97 },
  { month: "May", documents: 83, accuracy: 98 },
  { month: "Jun", documents: 92, accuracy: 98 },
  { month: "Jul", documents: 108, accuracy: 99 },
];

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-3 border border-border rounded-md shadow-sm">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-sm text-primary">
          <span className="font-semibold">{payload[0].value}</span> documents
        </p>
        <p className="text-sm text-accent">
          <span className="font-semibold">{payload[1].value}%</span> accuracy
        </p>
      </div>
    );
  }

  return null;
};

const AnalyticsChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing Analytics</CardTitle>
        <CardDescription>Document processing volume and accuracy over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs text-muted-foreground" />
              <YAxis yAxisId="left" orientation="left" className="text-xs text-muted-foreground" />
              <YAxis yAxisId="right" orientation="right" domain={[85, 100]} className="text-xs text-muted-foreground" />
              <Tooltip content={<CustomTooltip />} />
              <Bar yAxisId="left" dataKey="documents" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="accuracy" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsChart;
