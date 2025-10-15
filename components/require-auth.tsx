"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "./auth-provider"
import { Skeleton } from "@/components/ui/skeleton"

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, hydrated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (hydrated && !user) {
      router.replace("/login?next=" + encodeURIComponent(pathname || "/dashboard"))
    }
  }, [hydrated, user, router, pathname])

  if (!hydrated) {
    return (
      <div className="p-4 grid gap-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (!user) return null
  return <>{children}</>
}
