"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { createFeedback, type FeedbackFormValues } from "@/app/actions/feedback"
import { useRouter } from "next/navigation"

export function FeedbackForm() {
  const [formData, setFormData] = useState<FeedbackFormValues>({
    title: "",
    description: "",
    category: "feature",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleChange = (field: keyof FeedbackFormValues, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and description for your feedback.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await createFeedback(formData)

      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback! Others can now vote on it.",
      })

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "feature",
      })

      // Refresh the page to show the new feedback
      router.refresh()
    } catch (error) {
      toast({
        title: "Error submitting feedback",
        description: error instanceof Error ? error.message : "There was a problem submitting your feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="bg-primary/5 rounded-t-lg p-4 md:p-6">
        <CardTitle className="text-primary text-xl">Submit Feedback</CardTitle>
        <CardDescription>Share your ideas and suggestions</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <CardContent className="p-4 md:p-6 pt-4 md:pt-6 space-y-3 md:space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              placeholder="Brief summary of your feedback"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
              className="h-9 md:h-10"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => handleChange("category", value)}
            >
              <SelectTrigger className="h-9 md:h-10">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feature">Feature Request</SelectItem>
                <SelectItem value="bug">Bug Report</SelectItem>
                <SelectItem value="improvement">Improvement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Provide details about your feedback or suggestion"
              rows={4}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              required
              className="min-h-[100px] md:min-h-[120px] resize-y"
            />
          </div>
        </CardContent>
        <CardFooter className="p-4 md:p-6 pt-2 md:pt-4">
          <Button type="submit" className="w-full bg-primary h-9 md:h-10" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              "Submit Feedback"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

