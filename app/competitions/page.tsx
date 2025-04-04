import type { Metadata } from "next"
import CompetitionsClientPage from "./CompetitionsClientPage"

export const metadata: Metadata = {
  title: "Competitions | Malik of The Year",
  description: "Competition management for Malik of The Year",
}

export default function CompetitionsPage() {
  return <CompetitionsClientPage />
}

