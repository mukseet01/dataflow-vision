
import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  BarChart3, 
  ClipboardCheck, 
  Database, 
  FileText, 
  Grid, 
  Home, 
  LineChart, 
  LogOut, 
  Menu, 
  Settings, 
  User 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface NavItemProps {
  icon: ReactNode;
  label: string;
  to: string;
  isActive: boolean;
}

const NavItem = ({ icon, label, to, isActive }: NavItemProps) => {
  return (
    <Link 
      to={to} 
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        isActive 
          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
          : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  
  const navItems = [
    { icon: <Home size={20} />, label: "Dashboard", to: "/dashboard" },
    { icon: <ClipboardCheck size={20} />, label: "Data Entry", to: "/data-entry" },
    { icon: <BarChart3 size={20} />, label: "Analysis", to: "/analysis" },
    { icon: <Database size={20} />, label: "Data Sources", to: "/data-sources" },
    { icon: <LineChart size={20} />, label: "Reports", to: "/reports" },
    { icon: <FileText size={20} />, label: "Templates", to: "/templates" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-sidebar fixed inset-y-0 left-0 z-10 flex flex-col border-r border-sidebar-border transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-64" : "w-[70px]"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="h-8 w-8 rounded-md bg-brand-500 text-white flex items-center justify-center font-bold text-lg">
              DS
            </div>
            <span className={cn("font-semibold text-sidebar-foreground transition-opacity", 
              sidebarOpen ? "opacity-100" : "opacity-0"
            )}>
              DataSplend
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={20} />
          </Button>
        </div>
        
        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                icon={item.icon}
                label={item.label}
                to={item.to}
                isActive={location.pathname === item.to}
              />
            ))}
          </div>
          <div className="mt-8 pt-4 border-t border-sidebar-border/50 space-y-1">
            <NavItem
              icon={<Settings size={20} />}
              label="Settings"
              to="/settings"
              isActive={location.pathname === "/settings"}
            />
          </div>
        </nav>
        
        {/* User */}
        <div className="p-4 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 text-left text-sidebar-foreground hover:bg-sidebar-accent/50",
                  !sidebarOpen && "justify-center"
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-brand-500 text-white">US</AvatarFallback>
                </Avatar>
                {sidebarOpen && (
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">User Name</p>
                    <p className="text-xs text-sidebar-foreground/70 truncate">user@example.com</p>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                  <User size={16} />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                  <Settings size={16} />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/logout" className="flex items-center gap-2 text-destructive cursor-pointer">
                  <LogOut size={16} />
                  <span>Log out</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
      
      {/* Main content */}
      <main className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        sidebarOpen ? "ml-64" : "ml-[70px]"
      )}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
