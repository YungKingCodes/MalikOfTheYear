import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/site-header"
import { DbInitProvider } from "@/lib/db-init-provider"
import { Toaster } from "@/components/ui/toaster"
import { GlobalLoadingIndicator } from "@/components/global-loading-indicator"
import { Providers } from "@/app/providers"
import { AuthLoadingOverlay } from "@/components/ui/auth-loading-overlay"
import { LoadingTimeoutWrapper } from "@/components/ui/loading-timeout-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Malik of The Year - Sports Competition Management",
  description: "Your sports competition management platform to crown your GOAT",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon-152.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Providers>
            <DbInitProvider>
              <LoadingTimeoutWrapper maxTimeout={3000}>
                <AuthLoadingOverlay />
                <GlobalLoadingIndicator />
                <div className="relative flex min-h-screen flex-col">
                  <SiteHeader />
                  <main className="flex-1">{children}</main>
                </div>
                <Toaster />
              </LoadingTimeoutWrapper>
            </DbInitProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}