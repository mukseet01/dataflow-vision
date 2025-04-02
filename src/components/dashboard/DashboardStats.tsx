
import { BarChart3, Database, FileCheck2, FileEdit } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";

const DashboardStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Documents Processed"
        value="1,256"
        icon={<FileCheck2 size={24} className="text-primary" />}
        trend={{ value: 12, isPositive: true }}
      />
      <StatCard
        title="Automation Accuracy"
        value="98.7%"
        icon={<FileEdit size={24} className="text-primary" />}
        trend={{ value: 2.3, isPositive: true }}
        variant="primary"
      />
      <StatCard
        title="Data Sources"
        value="8"
        icon={<Database size={24} className="text-primary" />}
      />
      <StatCard
        title="Analytics Reports"
        value="24"
        icon={<BarChart3 size={24} className="text-primary" />}
        trend={{ value: 5, isPositive: true }}
      />
    </div>
  );
};

export default DashboardStats;
