"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const saved = (localStorage.getItem("raa_theme") as "light" | "dark") || "light"
    setTheme(saved)
    if (saved === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light"
    setTheme(next)
    localStorage.setItem("raa_theme", next)
    if (next === "dark") document.documentElement.classList.add("dark")
    else document.documentElement.classList.remove("dark")
  }

  return (
    <Button variant="outline" size="sm" onClick={toggle} aria-pressed={theme === "dark"} aria-label="Toggle theme">
      {theme === "dark" ? "Dark" : "Light"}
    </Button>
  )
}
