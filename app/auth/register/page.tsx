import type { Metadata } from "next"
import { RegisterForm } from "@/components/register-form"

export const metadata: Metadata = {
  title: "Register | Malik of The Year",
  description: "Create an account for Malik of The Year",
}

export default function RegisterPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 animate-in fade-in-50 duration-500">
      <RegisterForm />
    </div>
  )
} 