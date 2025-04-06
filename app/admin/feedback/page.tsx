import { ProtectedRoute } from "@/components/auth/protected-route"
import { getFeedback, updateFeedbackStatus } from "@/app/actions/feedback"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { redirect } from "next/navigation"
import { auth } from "@/auth"

export const metadata = {
  title: "Feedback Management",
  description: "Admin tools for managing user feedback and suggestions",
}

interface FeedbackItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  votes: number;
  userId: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  hasVoted: boolean;
}

export default async function AdminFeedbackPage() {
  // Server-side auth check
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/unauthorized");
  }
  
  const feedbackItems = await getFeedback();
  
  return (
    <div className="container mx-auto py-6 md:py-8 space-y-6 md:space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Feedback Management</h1>
        <p className="text-muted-foreground">
          Review and manage user feedback and suggestions
        </p>
      </div>
      
      <FeedbackDashboard feedbackItems={feedbackItems} />
    </div>
  )
}

async function updateFeedbackStatusAction(formData: FormData) {
  "use server";
  const feedbackId = formData.get('feedbackId') as string;
  const status = formData.get('status') as string;
  return updateFeedbackStatus(feedbackId, status);
}

function FeedbackDashboard({ feedbackItems }: { feedbackItems: FeedbackItem[] }) {
  // Calculate statistics
  const totalFeedback = feedbackItems.length;
  const openFeedback = feedbackItems.filter(item => item.status === "open").length;
  const inProgressFeedback = feedbackItems.filter(item => item.status === "in-progress").length;
  const completedFeedback = feedbackItems.filter(item => item.status === "completed").length;
  const rejectedFeedback = feedbackItems.filter(item => item.status === "rejected").length;
  
  // Most voted feedback
  const sortedByVotes = [...feedbackItems].sort((a, b) => b.votes - a.votes);
  const topFeedback = sortedByVotes.slice(0, 5);
  
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Stats Cards */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Feedback Overview</CardTitle>
          <CardDescription>Total feedback and distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{totalFeedback}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Open</p>
              <p className="text-2xl font-bold text-amber-500">{openFeedback}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-blue-500">{inProgressFeedback}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-500">{completedFeedback}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Top Feedback */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Top Requested Features</CardTitle>
          <CardDescription>Most voted feedback items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topFeedback.map(item => (
              <div key={item.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={item.status === "completed" ? "default" : "outline"}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1).replace("-", " ")}
                    </Badge>
                    <Badge variant="secondary">{item.category}</Badge>
                    <span className="text-xs text-muted-foreground">{item.votes} votes</span>
                  </div>
                  <p className="font-medium">{item.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <form action={updateFeedbackStatusAction}>
                    <input type="hidden" name="feedbackId" value={item.id} />
                    <input type="hidden" name="status" value="in-progress" />
                    <Button 
                      type="submit"
                      size="sm" 
                      variant="outline"
                      className="h-8 gap-1"
                      disabled={item.status === "in-progress"}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      <span className="sr-only md:not-sr-only md:text-xs">In Progress</span>
                    </Button>
                  </form>
                  <form action={updateFeedbackStatusAction}>
                    <input type="hidden" name="feedbackId" value={item.id} />
                    <input type="hidden" name="status" value="completed" />
                    <Button 
                      type="submit"
                      size="sm" 
                      variant="outline"
                      className="h-8 gap-1"
                      disabled={item.status === "completed"}
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span className="sr-only md:not-sr-only md:text-xs">Complete</span>
                    </Button>
                  </form>
                  <form action={updateFeedbackStatusAction}>
                    <input type="hidden" name="feedbackId" value={item.id} />
                    <input type="hidden" name="status" value="rejected" />
                    <Button 
                      type="submit"
                      size="sm" 
                      variant="outline"
                      className="h-8 gap-1 text-destructive"
                      disabled={item.status === "rejected"}
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span className="sr-only md:not-sr-only md:text-xs">Reject</span>
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* All Feedback */}
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>All Feedback</CardTitle>
          <Tabs defaultValue="all" className="mt-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            
            {["all", "open", "in-progress", "completed", "rejected"].map(tabValue => (
              <TabsContent key={tabValue} value={tabValue} className="mt-4 space-y-4">
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 p-3 text-xs font-medium text-muted-foreground border-b">
                    <div className="col-span-5">Feedback</div>
                    <div className="col-span-2">Category</div>
                    <div className="col-span-1 text-center">Votes</div>
                    <div className="col-span-2">Submitted By</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>
                  
                  {feedbackItems
                    .filter(item => tabValue === "all" || item.status === tabValue)
                    .map(item => (
                      <div key={item.id} className="grid grid-cols-12 p-3 text-sm border-b last:border-0 items-center">
                        <div className="col-span-5">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</div>
                          <div className="text-xs mt-1 text-muted-foreground">
                            {format(new Date(item.createdAt), "MMM d, yyyy")}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <Badge variant="secondary">
                            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                          </Badge>
                        </div>
                        <div className="col-span-1 text-center font-medium">{item.votes}</div>
                        <div className="col-span-2 flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            {item.user.image ? (
                              <AvatarImage src={item.user.image} alt={item.user.name || ""} />
                            ) : null}
                            <AvatarFallback className="text-[10px]">
                              {item.user.name?.substring(0, 2).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs truncate max-w-[100px]">{item.user.name || "Anonymous"}</span>
                        </div>
                        <div className="col-span-2 flex items-center justify-end gap-2">
                          <form action={updateFeedbackStatusAction}>
                            <input type="hidden" name="feedbackId" value={item.id} />
                            <input type="hidden" name="status" value="in-progress" />
                            <Button 
                              type="submit"
                              size="sm" 
                              variant="outline"
                              className="h-7 w-7 p-0"
                              disabled={item.status === "in-progress"}
                              title="Mark as In Progress"
                            >
                              <Clock className="h-3.5 w-3.5" />
                              <span className="sr-only">In Progress</span>
                            </Button>
                          </form>
                          <form action={updateFeedbackStatusAction}>
                            <input type="hidden" name="feedbackId" value={item.id} />
                            <input type="hidden" name="status" value="completed" />
                            <Button 
                              type="submit"
                              size="sm" 
                              variant="outline"
                              className="h-7 w-7 p-0"
                              disabled={item.status === "completed"}
                              title="Mark as Completed"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              <span className="sr-only">Complete</span>
                            </Button>
                          </form>
                          <form action={updateFeedbackStatusAction}>
                            <input type="hidden" name="feedbackId" value={item.id} />
                            <input type="hidden" name="status" value="rejected" />
                            <Button 
                              type="submit"
                              size="sm" 
                              variant="outline"
                              className="h-7 w-7 p-0 text-destructive"
                              disabled={item.status === "rejected"}
                              title="Reject"
                            >
                              <AlertTriangle className="h-3.5 w-3.5" />
                              <span className="sr-only">Reject</span>
                            </Button>
                          </form>
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  )
} 