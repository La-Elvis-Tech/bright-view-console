
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, DollarSign, Package, Activity } from "lucide-react";

const metrics = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1%",
    trend: "up",
    icon: DollarSign,
    description: "from last month",
  },
  {
    title: "Active Users",
    value: "2,350",
    change: "+180.1%",
    trend: "up",
    icon: Users,
    description: "from last month",
  },
  {
    title: "Inventory Items",
    value: "12,234",
    change: "-19%",
    trend: "down",
    icon: Package,
    description: "from last month",
  },
  {
    title: "Conversion Rate",
    value: "3.2%",
    change: "+5.4%",
    trend: "up",
    icon: Activity,
    description: "from last month",
  },
];

export function DashboardCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {metric.trend === "up" ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={metric.trend === "up" ? "text-green-500" : "text-red-500"}>
                {metric.change}
              </span>
              <span>{metric.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
