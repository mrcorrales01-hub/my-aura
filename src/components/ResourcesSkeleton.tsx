import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const ResourcesSkeleton = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header skeleton */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-6 w-96 mx-auto" />
      </div>

      {/* Search skeleton */}
      <Card className="p-4 mb-8">
        <Skeleton className="h-10 w-full" />
      </Card>

      {/* Tabs skeleton */}
      <div className="mb-6">
        <div className="grid w-full grid-cols-3 lg:grid-cols-6 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Resources grid skeleton */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-full" />
              </div>
            </div>
            <Skeleton className="h-16 w-full" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};