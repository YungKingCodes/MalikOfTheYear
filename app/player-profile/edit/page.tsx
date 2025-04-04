import type { Metadata } from "next"
import { PlayerProficiencyEditor } from "@/components/player-profile/proficiency-editor"
import { ProtectedRoute } from "@/components/protected-route"

export const metadata: Metadata = {
  title: "Edit Proficiencies | Malik of The Year",
  description: "Edit your proficiency scores for the Malik of The Year competition",
}

export default function EditPlayerProfilePage() {
  return (
    <ProtectedRoute>
    <div className="container py-8 space-y-8 animate-in fade-in-50 duration-500">
      <h1 className="text-3xl font-bold tracking-tight">Edit Your Proficiencies</h1>
      <p className="text-muted-foreground max-w-3xl">
        Rate your proficiency in each skill area. Be honest in your self-assessment as this will help team captains
        create balanced teams. Your proficiency scores can be updated until you are assigned to a team.
      </p>

      <PlayerProficiencyEditor />
    </div>
    </ProtectedRoute>
  )
}

