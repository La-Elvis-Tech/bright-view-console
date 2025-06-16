
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface SkeletonCardProps {
  className?: string;
  showHeader?: boolean;
  headerHeight?: string;
  contentLines?: number;
  showAvatar?: boolean;
}

export function SkeletonCard({ 
  className, 
  showHeader = true, 
  headerHeight = "h-6", 
  contentLines = 3,
  showAvatar = false
}: SkeletonCardProps) {
  return (
    <div className={cn("p-6 space-y-3", className)}>
      {showAvatar && (
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      )}
      
      {showHeader && (
        <Skeleton className={cn("w-[250px]", headerHeight)} />
      )}
      
      <div className="space-y-2">
        {Array.from({ length: contentLines }).map((_, i) => (
          <Skeleton 
            key={i} 
            className={cn(
              "h-4",
              i === contentLines - 1 ? "w-[180px]" : "w-full"
            )} 
          />
        ))}
      </div>
    </div>
  )
}
