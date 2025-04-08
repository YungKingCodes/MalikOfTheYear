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
    <div className="container mx-auto py-4 md:py-6 space-y-4 md:space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Feedback Management</h1>
        <p className="text-sm md:text-base text-muted-foreground">
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
    <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {/* Stats Cards */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg md:text-xl">Feedback Overview</CardTitle>
          <CardDescription className="text-xs md:text-sm">Total feedback and distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-xl md:text-2xl font-bold">{totalFeedback}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Open</p>
              <p className="text-xl md:text-2xl font-bold text-amber-500">{openFeedback}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">In Progress</p>
              <p className="text-xl md:text-2xl font-bold text-blue-500">{inProgressFeedback}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-xl md:text-2xl font-bold text-green-500">{completedFeedback}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Voted Feedback */}
      <Card className="sm:col-span-2 lg:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg md:text-xl">Top Voted Feedback</CardTitle>
          <CardDescription className="text-xs md:text-sm">Most popular suggestions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topFeedback.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {item.votes} votes
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      <Card className="col-span-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg md:text-xl">All Feedback</CardTitle>
          <CardDescription className="text-xs md:text-sm">Manage and respond to feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feedbackItems.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border">
                <div className="flex items-start gap-3 sm:w-1/3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={item.user.image || undefined} alt={item.user.name || ""} />
                    <AvatarFallback>{item.user.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.user.name || "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(item.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{item.category}</Badge>
                    <Badge variant={item.status === "open" ? "default" : "secondary"}>
                      {item.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-start">
                  <form action={updateFeedbackStatusAction}>
                    <input type="hidden" name="feedbackId" value={item.id} />
                    <input type="hidden" name="status" value="in-progress" />
                    <Button type="submit" variant="outline" size="sm" className="w-full">
                      <Clock className="h-4 w-4 mr-2" />
                      In Progress
                    </Button>
                  </form>
                  <form action={updateFeedbackStatusAction}>
                    <input type="hidden" name="feedbackId" value={item.id} />
                    <input type="hidden" name="status" value="completed" />
                    <Button type="submit" variant="outline" size="sm" className="w-full">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 