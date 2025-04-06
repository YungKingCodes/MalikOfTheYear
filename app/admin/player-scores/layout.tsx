import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Player Scores Dashboard",
  description: "View all player scores for your competition",
}

export default function AdminPlayerScoresLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 