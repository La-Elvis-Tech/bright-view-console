
import { DashboardCards } from "@/components/DashboardCards";
import { DashboardCharts } from "@/components/DashboardCharts";
import { RecentActivity } from "@/components/RecentActivity";

const Index = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your business today.
        </p>
      </div>
      
      <DashboardCards />
      
      <DashboardCharts />
      
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <RecentActivity />
        </div>
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left p-2 rounded hover:bg-accent transition-colors">
                Create New Order
              </button>
              <button className="w-full text-left p-2 rounded hover:bg-accent transition-colors">
                Add Inventory Item
              </button>
              <button className="w-full text-left p-2 rounded hover:bg-accent transition-colors">
                Generate Report
              </button>
              <button className="w-full text-left p-2 rounded hover:bg-accent transition-colors">
                Manage Users
              </button>
            </div>
          </div>
          
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-2">System Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Server Status</span>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600">Online</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Database</span>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600">Healthy</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">API Response</span>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs text-yellow-600">125ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
