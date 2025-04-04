import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Calendar, Users } from "lucide-react"

export function CurrentCompetition() {
  return (
    <section className="container py-16 md:py-24 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-secondary/10 blur-3xl"></div>
      <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-primary/10 blur-3xl"></div>

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center relative z-10">
        <div className="space-y-6">
          <div className="inline-block bg-secondary/10 px-4 py-2 rounded-full">
            <span className="text-sm font-medium text-secondary">2025 Theme</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-secondary">Eid-Al-Athletes</h2>

          <p className="text-muted-foreground text-lg">
            This year's competition celebrates the spirit of athleticism with a nod to traditional Eid festivities.
            Compete across various sports challenges to earn the ultimate title: "The GOAT".
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-secondary/20 bg-secondary/5 hover:bg-secondary/10 transition-colors">
              <CardContent className="flex items-center gap-4 p-4">
                <Calendar className="w-8 h-8 text-secondary" />
                <div>
                  <p className="font-medium">Competition Dates</p>
                  <p className="text-sm text-muted-foreground">June 15 - July 30, 2025</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
              <CardContent className="flex items-center gap-4 p-4">
                <Trophy className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium">Top Prize</p>
                  <p className="text-sm text-muted-foreground">"The GOAT" Trophy</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-secondary/20 bg-secondary/5 hover:bg-secondary/10 transition-colors sm:col-span-2">
              <CardContent className="flex items-center gap-4 p-4">
                <Users className="w-8 h-8 text-secondary" />
                <div>
                  <p className="font-medium">Team Formation</p>
                  <p className="text-sm text-muted-foreground">May 1 - May 30, 2025</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Button
            asChild
            size="lg"
            className="rounded-full bg-primary hover:bg-primary/90 border-2 border-primary/20 px-8 py-6"
          >
            <Link href="/competitions/2025">View Competition Details</Link>
          </Button>
        </div>

        <div className="relative aspect-square rounded-xl overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 mix-blend-overlay z-10"></div>
          <Image
            src="/placeholder.svg?height=800&width=800"
            alt="Eid-Al-Athletes competition theme"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  )
}

