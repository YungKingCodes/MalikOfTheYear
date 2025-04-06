import EditGameClient from "./edit-game-client"
import { Loader2 } from "lucide-react"
import { Suspense } from "react"

interface GamePageProps {
  params: {
    id: string
  }
}

export default function EditGamePage(props: GamePageProps) {
  const { params } = props;
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading game data...</p>
        </div>
      </div>
    }>
      <EditGameClient id={params.id.toString()} />
    </Suspense>
  )
} 