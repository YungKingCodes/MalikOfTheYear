import type { Metadata } from "next"
import { LoginForm } from "@/components/login-form"

export const metadata: Metadata = {
  title: "Login | Malik of The Year",
  description: "Sign in to your Malik of The Year account",
}

/**
 * Login page component
 * Receives search parameters but doesn't access them directly
 * to avoid Next.js server component warnings
 */
export default function LoginPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <LoginForm searchParams={searchParams} />
    </div>
  )
}

