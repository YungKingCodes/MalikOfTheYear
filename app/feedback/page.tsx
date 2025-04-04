import type { Metadata } from "next"
import { FeedbackList } from "@/components/feedback/feedback-list"
import { FeedbackForm } from "@/components/feedback/feedback-form"

export const metadata: Metadata = {
  title: "Feedback | Malik of The Year",
  description: "Submit and vote on feedback for the Malik of The Year platform",
}

export default function FeedbackPage() {
  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-primary">Platform Feedback</h1>
        <p className="text-muted-foreground">
          Help us improve the Malik of The Year platform by submitting your feedback and suggestions. Vote on existing
          feedback to help us prioritize improvements.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="order-2 md:order-1 md:col-span-1">
          <FeedbackForm />
        </div>
        <div className="order-1 md:order-2 md:col-span-2">
          <FeedbackList />
        </div>
      </div>
    </div>
  )
}

