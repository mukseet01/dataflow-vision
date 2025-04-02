
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type ActivityType = "upload" | "process" | "analyze" | "export";

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  time: string;
  user?: {
    name: string;
    avatar?: string;
    initials: string;
  };
}

const activities: ActivityItem[] = [
  {
    id: "1",
    type: "upload",
    title: "Sales Data Uploaded",
    description: "Q2 2023 Sales Report.xlsx was uploaded",
    time: "10 minutes ago",
    user: {
      name: "John Doe",
      initials: "JD",
    },
  },
  {
    id: "2",
    type: "process",
    title: "Invoice Processing Complete",
    description: "32 invoices were processed with AI",
    time: "1 hour ago",
  },
  {
    id: "3",
    type: "analyze",
    title: "Analysis Generated",
    description: "Customer Segmentation Analysis complete",
    time: "3 hours ago",
    user: {
      name: "Sarah Chen",
      initials: "SC",
    },
  },
  {
    id: "4",
    type: "export",
    title: "Report Exported",
    description: "Monthly Financial Report exported as PDF",
    time: "Yesterday",
  },
  {
    id: "5",
    type: "upload",
    title: "Employee Records Uploaded",
    description: "Updated employee database with new entries",
    time: "2 days ago",
    user: {
      name: "Mike Johnson",
      initials: "MJ",
    },
  },
];

const getActivityIcon = (type: ActivityType) => {
  const baseClasses = "h-2 w-2 rounded-full";
  
  switch (type) {
    case "upload":
      return <span className={cn(baseClasses, "bg-blue-500")} />;
    case "process":
      return <span className={cn(baseClasses, "bg-purple-500")} />;
    case "analyze":
      return <span className={cn(baseClasses, "bg-green-500")} />;
    case "export":
      return <span className={cn(baseClasses, "bg-amber-500")} />;
    default:
      return <span className={cn(baseClasses, "bg-gray-500")} />;
  }
};

const RecentActivity = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions in your workspace</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.map((activity) => (
            <div key={activity.id} className="flex">
              <div className="relative mr-4">
                {activity.user ? (
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {activity.user.initials}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background">
                    {getActivityIcon(activity.type)}
                  </div>
                )}
                <span className="absolute -left-1 top-10 bottom-0 w-0.5 bg-border" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
