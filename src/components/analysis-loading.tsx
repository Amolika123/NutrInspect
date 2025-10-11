import { Skeleton } from "@/components/ui/skeleton";

export function AnalysisLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Skeleton className="w-full aspect-square rounded-xl" />
        </div>
        <div className="md:col-span-2 space-y-6">
          <Skeleton className="h-10 w-3/4 rounded-md" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-card rounded-xl">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-32 w-32 rounded-full" />
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="p-6 bg-card rounded-xl space-y-4">
              <Skeleton className="h-8 w-1/2" />
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-md" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6 bg-card rounded-xl space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-5/6" />
      </div>
    </div>
  );
}
