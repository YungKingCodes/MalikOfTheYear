import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Trophy, Users, Calendar, Award, Crown } from "lucide-react"
import { HeroSection } from "@/components/hero-section"
import { FeatureCard } from "@/components/feature-card"
import { CurrentCompetition } from "@/components/current-competition"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />

      <section className="container py-12 space-y-6 md:py-16 lg:py-24 relative">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-secondary/10 blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-primary/10 blur-3xl -z-10"></div>

        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-secondary">
            Manage Your Competition with Ease
          </h2>
          <p className="max-w-[700px] mx-auto text-muted-foreground">
            Everything you need to organize and run your annual sports competition.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Trophy className="w-10 h-10 text-secondary" />}
            title="Annual Competitions"
            description="Create and manage unique themed competitions each year with custom branding and games."
          />
          <FeatureCard
            icon={<Users className="w-10 h-10 text-primary" />}
            title="Team Management"
            description="Build balanced teams based on player skills and proficiencies with our smart team creation system."
          />
          <FeatureCard
            icon={<Calendar className="w-10 h-10 text-secondary" />}
            title="Game Selection"
            description="Easily select games for each year's competition from your game pool or add new ones."
          />
          <FeatureCard
            icon={<Award className="w-10 h-10 text-primary" />}
            title="Player Profiles"
            description="Track player skills, proficiencies, and titles earned across multiple competitions."
          />
          <FeatureCard
            icon={<Crown className="w-10 h-10 text-secondary" />}
            title="Captain Voting"
            description="Streamlined voting system for teams to select their captains democratically."
          />
          <FeatureCard
            icon={<Trophy className="w-10 h-10 text-primary" />}
            title="Leaderboards"
            description="Real-time leaderboards and statistics to track team and player performance."
          />
        </div>

        <div className="flex justify-center pt-8">
          <Button
            asChild
            size="lg"
            className="rounded-full bg-primary hover:bg-primary/90 border-2 border-primary/20 px-8 py-6"
          >
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </section>

      <CurrentCompetition />

      <section className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 py-16 md:py-24">
        <div className="container text-center space-y-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-secondary">Ready to crown your Malik?</h2>
          <p className="max-w-[600px] mx-auto text-muted-foreground">
            Start managing your competition today with your comprehensive platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-primary hover:bg-primary/90 border-2 border-primary/20 px-8 py-6"
            >
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

