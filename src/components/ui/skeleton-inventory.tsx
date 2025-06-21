
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function SkeletonInventory() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[400px]" />
      </div>

      {/* Stats */}
      <Card className="bg-white dark:bg-neutral-900 border-neutral-200/60 dark:border-neutral-800/60">
        <CardContent className="p-3 lg:p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse p-3 lg:p-4 bg-neutral-50/80 dark:bg-neutral-800/40 rounded-lg border border-neutral-200/40 dark:border-neutral-700/40">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-5" />
                  </div>
                  <div>
                    <Skeleton className="h-3 w-16 mb-1" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="bg-white dark:bg-neutral-900 border-neutral-200/60 dark:border-neutral-800/60">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="flex flex-col gap-4">
                <Skeleton className="h-10 w-full" />
                <div className="flex gap-2 overflow-x-auto">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-[100px] flex-shrink-0" />
                  ))}
                </div>
              </div>
            </div>
            <div>
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-white dark:bg-neutral-900 border-neutral-200/60 dark:border-neutral-800/60">
        <CardContent className="p-0">
          <div className="w-full">
            {/* Table Header */}
            <div className="flex items-center space-x-4 p-4 border-b border-neutral-200/60 dark:border-neutral-800/60">
              <Skeleton className="h-4 w-4" />
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1" />
              ))}
            </div>
            
            {/* Table Rows */}
            <div className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
              {Array.from({ length: 8 }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex items-center space-x-4 p-4">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-4 w-[60px]" />
                  <Skeleton className="h-4 w-[60px]" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-8 w-[80px]" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
