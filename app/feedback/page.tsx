import { FeedbackForm } from "@/components/feedback/feedback-form"
import { FeedbackList } from "@/components/feedback/feedback-list"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { PlusIcon, SettingsIcon } from "lucide-react"
import Link from "next/link"
import { auth } from "@/auth"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export const metadata = {
  title: "Feedback & Suggestions",
  description: "Submit feedback and vote on suggestions for improving the platform",
}

export default async function FeedbackPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";
  
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-6 md:py-8 space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Feedback & Suggestions</h1>
            <p className="text-muted-foreground mt-1">
              Share your ideas and vote on what should be prioritized
            </p>
          </div>
          <div className="flex justify-end gap-2">
            {isAdmin && (
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/feedback">
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Manage
                </Link>
              </Button>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="sm:w-auto" size="sm">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Feedback
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Submit Feedback</DialogTitle>
                </DialogHeader>
                <FeedbackForm />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Feedback List */}
        <FeedbackList />
      </div>
    </ProtectedRoute>
  )
}

