
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const activities = [
  {
    id: 1,
    user: {
      name: "John Doe",
      email: "john@example.com",
      avatar: "/placeholder.svg",
    },
    action: "Created new order",
    target: "#12345",
    timestamp: "2 minutes ago",
    status: "success",
  },
  {
    id: 2,
    user: {
      name: "Jane Smith",
      email: "jane@example.com",
      avatar: "/placeholder.svg",
    },
    action: "Updated inventory",
    target: "Product #456",
    timestamp: "5 minutes ago",
    status: "info",
  },
  {
    id: 3,
    user: {
      name: "Mike Johnson",
      email: "mike@example.com",
      avatar: "/placeholder.svg",
    },
    action: "Payment failed",
    target: "Invoice #789",
    timestamp: "10 minutes ago",
    status: "error",
  },
  {
    id: 4,
    user: {
      name: "Sarah Wilson",
      email: "sarah@example.com",
      avatar: "/placeholder.svg",
    },
    action: "User registered",
    target: "New account",
    timestamp: "15 minutes ago",
    status: "success",
  },
  {
    id: 5,
    user: {
      name: "Tom Brown",
      email: "tom@example.com",
      avatar: "/placeholder.svg",
    },
    action: "Report generated",
    target: "Monthly report",
    timestamp: "20 minutes ago",
    status: "info",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "success":
      return "bg-green-500";
    case "error":
      return "bg-red-500";
    case "info":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case "success":
      return "default";
    case "error":
      return "destructive";
    case "info":
      return "secondary";
    default:
      return "outline";
  }
};

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest user activities and system events</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                <AvatarFallback>
                  {activity.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium leading-none">
                    {activity.user.name}
                  </p>
                  <Badge variant={getStatusVariant(activity.status)}>
                    {activity.action}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {activity.target} • {activity.timestamp}
                </p>
              </div>
              <div className={`h-2 w-2 rounded-full ${getStatusColor(activity.status)}`} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
