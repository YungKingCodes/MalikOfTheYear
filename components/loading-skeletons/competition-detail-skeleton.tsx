import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export function CompetitionDetailSkeleton() {
  return (
    <div className="container py-8 max-w-7xl">
      <div className="flex flex-col space-y-2 mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-4 w-1/2" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="flex pt-6">
              <Skeleton className="h-6 w-6 mr-3" />
              <div className="w-full">
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-4 w-full max-w-[150px]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="overview" disabled>Overview</TabsTrigger>
          <TabsTrigger value="teams" disabled>Teams</TabsTrigger>
          <TabsTrigger value="games" disabled>Games</TabsTrigger>
          <TabsTrigger value="results" disabled>Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle><Skeleton className="h-6 w-40" /></CardTitle>
                <CardDescription><Skeleton className="h-4 w-64" /></CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i}>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-6 w-full max-w-[120px]" />
                    </div>
                  ))}
                </div>
                
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mt-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle><Skeleton className="h-6 w-48" /></CardTitle>
                <CardDescription><Skeleton className="h-4 w-32" /></CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="relative pl-6 pb-4 border-l border-muted last:border-0 last:pb-0">
                      <div className="absolute left-0 top-0 transform -translate-x-1/2 w-3 h-3 rounded-full bg-muted" />
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-40 mb-2" />
                      <Skeleton className="h-4 w-full max-w-[200px]" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function DashboardLoading() {
  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 w-full h-full rounded-full border-4 border-muted animate-pulse"></div>
          <div className="absolute top-0 w-full h-full rounded-full border-t-4 border-primary animate-spin"></div>
        </div>
        <p className="text-muted-foreground text-sm">Loading data...</p>
      </div>
    </div>
  )
}

// General loading component that can be used across the application
export function LoadingSpinner({ text = "Loading data..." }: { text?: string }) {
  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 w-full h-full rounded-full border-4 border-muted animate-pulse"></div>
          <div className="absolute top-0 w-full h-full rounded-full border-t-4 border-primary animate-spin"></div>
        </div>
        <p className="text-muted-foreground text-sm">{text}</p>
      </div>
    </div>
  )
} 