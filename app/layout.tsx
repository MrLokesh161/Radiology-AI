import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"
import { DataProvider } from "@/components/data-provider"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Radiology AI Assistant",
  description: "An AI-powered assistant for radiologists to help with report generation and image analysis.",
  generator: "Next.js",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}
        suppressHydrationWarning
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-primary text-primary-foreground px-3 py-2 rounded-md"
        >
          Skip to main content
        </a>
        <Suspense fallback={null}>
          <AuthProvider>
            <DataProvider>{children}</DataProvider>
          </AuthProvider>
        </Suspense>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
