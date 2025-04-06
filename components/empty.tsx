import { ReactNode } from "react"

interface EmptyProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export function Empty({ icon, title, description, action }: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-lg bg-muted/30">
      <div className="w-12 h-12 mb-4 text-muted-foreground">
        {icon}
      </div>
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-4">{description}</p>
      {action}
    </div>
  )
} 