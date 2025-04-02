
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  Layers, 
  GanttChart, 
  BarChartHorizontal,
  Download
} from "lucide-react";
import { 
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

const data = [
  { name: "Jan", revenue: 2400, expenses: 1800, profit: 600 },
  { name: "Feb", revenue: 1800, expenses: 1600, profit: 200 },
  { name: "Mar", revenue: 3200, expenses: 2000, profit: 1200 },
  { name: "Apr", revenue: 4500, expenses: 2500, profit: 2000 },
  { name: "May", revenue: 4900, expenses: 2700, profit: 2200 },
  { name: "Jun", revenue: 5200, expenses: 3100, profit: 2100 },
  { name: "Jul", revenue: 6000, expenses: 3400, profit: 2600 },
];

const analysisTemplates = [
  { id: "financial", name: "Financial Performance" },
  { id: "sales", name: "Sales Trend Analysis" },
  { id: "customer", name: "Customer Segmentation" },
  { id: "inventory", name: "Inventory Optimization" },
  { id: "marketing", name: "Marketing Campaign ROI" },
];

const DataAnalysisCard = () => {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Data Analysis</CardTitle>
            <CardDescription>
              Analyze your data with AI-powered insights
            </CardDescription>
          </div>
          <Select defaultValue="financial">
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select analysis type" />
            </SelectTrigger>
            <SelectContent>
              {analysisTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border border-border rounded-lg p-4">
          <h3 className="text-sm font-medium mb-3">Key Insights</h3>
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 shrink-0">
                <BarChart3 size={14} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Revenue is trending upward</p>
                <p className="text-xs text-muted-foreground">
                  Revenue has increased by 24% over the last 6 months
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 shrink-0">
                <PieChart size={14} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Expenses are stabilizing</p>
                <p className="text-xs text-muted-foreground">
                  Expense growth has slowed to 5% month-over-month
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 shrink-0">
                <LineChart size={14} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Profit margins improving</p>
                <p className="text-xs text-muted-foreground">
                  Profit margin has increased from 25% to 43% since January
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" className="text-xs text-muted-foreground" />
              <YAxis className="text-xs text-muted-foreground" />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="revenue" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
              <Area type="monotone" dataKey="expenses" stackId="1" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive) / 0.2)" />
              <Area type="monotone" dataKey="profit" stackId="1" stroke="hsl(215, 89%, 55%)" fill="hsla(215, 89%, 55%, 0.2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Chart Options</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" className="flex flex-col h-auto py-2 px-2">
                <LineChart size={16} className="mb-1" />
                <span className="text-xs">Line</span>
              </Button>
              <Button variant="outline" size="sm" className="flex flex-col h-auto py-2 px-2">
                <BarChart3 size={16} className="mb-1" />
                <span className="text-xs">Bar</span>
              </Button>
              <Button variant="outline" size="sm" className="flex flex-col h-auto py-2 px-2">
                <BarChartHorizontal size={16} className="mb-1" />
                <span className="text-xs">Horizontal</span>
              </Button>
              <Button variant="outline" size="sm" className="flex flex-col h-auto py-2 px-2">
                <PieChart size={16} className="mb-1" />
                <span className="text-xs">Pie</span>
              </Button>
              <Button variant="outline" size="sm" className="flex flex-col h-auto py-2 px-2">
                <Layers size={16} className="mb-1" />
                <span className="text-xs">Area</span>
              </Button>
              <Button variant="outline" size="sm" className="flex flex-col h-auto py-2 px-2">
                <GanttChart size={16} className="mb-1" />
                <span className="text-xs">Gantt</span>
              </Button>
            </div>
          </div>
          <div className="border border-border rounded-lg p-4">
            <h3 className="text-sm font-medium mb-2">AI-Generated Insights</h3>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                • Based on current trends, revenue is projected to grow by 15% in Q3
              </p>
              <p className="text-xs text-muted-foreground">
                • Expenses could be optimized by focusing on vendor consolidation
              </p>
              <p className="text-xs text-muted-foreground">
                • Consider reallocating resources to high-profit products in the next quarter
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline">
          <Download size={16} className="mr-2" />
          Export Report
        </Button>
        <Button>Run Advanced Analysis</Button>
      </CardFooter>
    </Card>
  );
};

export default DataAnalysisCard;
