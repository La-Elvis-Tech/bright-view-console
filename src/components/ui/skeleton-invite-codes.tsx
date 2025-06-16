
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function SkeletonInviteCodes() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[350px]" />
        </div>

        {/* Main Card */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <Skeleton className="h-6 w-[200px] mx-auto" />
            <Skeleton className="h-4 w-[300px] mx-auto" />
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Info boxes */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-start space-x-3">
                  <Skeleton className="h-5 w-5 rounded-full mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-[200px]" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </div>
            ))}

            {/* Action buttons */}
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-[120px]" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
