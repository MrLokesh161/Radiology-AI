"use client"

import type React from "react"

import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { RequireAuth } from "@/components/require-auth"
import { usePathname } from "next/navigation"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <RequireAuth>
      <div className="min-h-dvh grid md:grid-cols-[240px_1fr]">
        <aside className="hidden md:block border-r bg-sidebar">
          <Sidebar />
        </aside>
        <div className="flex flex-col min-w-0">
          <TopBar />
          <main id="main-content" className="p-4">
            {children}
          </main>
        </div>
      </div>
    </RequireAuth>
  )
}
