"use client"

import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"
import { useAuth } from "./auth-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { LogOut } from "lucide-react"

export function TopBar() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const onSignOut = () => {
    logout()
    toast({ title: "Signed out" })
  }

  return (
    <header className="border-b bg-background">
      <div className="px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div aria-hidden className="h-8 w-8 rounded-md bg-primary" />
          <span className="font-semibold">Radiology AI Assistant</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-md border px-2 py-1 hover:bg-accent focus-visible:outline-none focus-visible:ring-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm">{user.name}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" aria-hidden />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login" className="underline underline-offset-4 text-sm">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
