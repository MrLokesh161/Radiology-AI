"use client"

import type React from "react"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

type User = { email: string; name: string }
type AuthContextType = {
  user: User | null
  hydrated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const DEMO = { email: "radiologist@demo.com", password: "demo123", name: "Dr. Demo" }

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem("raa_auth_user")
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as User
        setUser(parsed)
      } catch {}
    }
    setHydrated(true)
  }, [])

  const login = async (email: string, password: string) => {
    // demo-only auth
    if ((email === DEMO.email && password === DEMO.password) || password === "demo123") {
      const u = { email, name: email === DEMO.email ? DEMO.name : email.split("@")[0] }
      setUser(u)
      localStorage.setItem("raa_auth_user", JSON.stringify(u))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("raa_auth_user")
  }

  const value = useMemo(() => ({ user, hydrated, login, logout }), [user, hydrated])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
