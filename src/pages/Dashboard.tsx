
import { CalendarIcon, DownloadIcon, MoreHorizontalIcon, PlusIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RecentActivity from "@/components/dashboard/RecentActivity";
import AnalyticsChart from "@/components/dashboard/AnalyticsChart";

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your workspace.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-9">
            <CalendarIcon className="mr-2 h-4 w-4" />
            July 2023
          </Button>
          <Button className="h-9">
            <PlusIcon className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      <DashboardStats />

      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto h-8 gap-1">
                <DownloadIcon className="h-3.5 w-3.5" />
                <span>Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              <DropdownMenuItem>Export as Excel</DropdownMenuItem>
              <DropdownMenuItem>Export as CSV</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>Monthly Performance</CardTitle>
                  <CardDescription>
                    Processing volume and accuracy metrics
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View detailed report</DropdownMenuItem>
                    <DropdownMenuItem>Download data</DropdownMenuItem>
                    <DropdownMenuItem>Share report</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <AnalyticsChart />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest actions in your workspace
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentActivity />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Quick Tasks</CardTitle>
                <CardDescription>Things you might want to do</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Upload new document
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Create analysis report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Configure data sources
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current system performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Processing Queue</p>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <p className="text-sm text-muted-foreground">Healthy (0 pending)</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">API Status</p>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <p className="text-sm text-muted-foreground">Operational</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Model Training</p>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        <p className="text-sm text-muted-foreground">In Progress</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Storage</p>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                        <p className="text-sm text-muted-foreground">78% Used</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>
                Deep dive into your data with AI-powered analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border border-dashed rounded-md">
                <p className="text-muted-foreground">Advanced analytics view will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
              <CardDescription>
                View and manage your automated reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border border-dashed rounded-md">
                <p className="text-muted-foreground">Reports view will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications & Alerts</CardTitle>
              <CardDescription>
                System notifications and custom alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border border-dashed rounded-md">
                <p className="text-muted-foreground">Notifications view will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
