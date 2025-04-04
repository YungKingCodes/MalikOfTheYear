import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Register | Malik of The Year",
  description: "Create an account for Malik of The Year",
}

export default function RegisterPage() {
  // Redirect to login page since we only support Google sign-in now
  redirect("/auth/login")
} 