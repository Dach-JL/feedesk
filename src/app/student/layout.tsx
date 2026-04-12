"use client"

import { signOut } from "next-auth/react"
import { LogOut, Settings } from "lucide-react"
import Link from "next/link"
import NotificationCenter from "@/components/notifications/NotificationCenter"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Student Portal Header */}
      <header className="h-16 bg-background/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-6 z-10 sticky top-0 shrink-0">
        <div className="flex items-center gap-2.5">
          <Link href="/student" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-black text-sm">F</span>
            </div>
            <span className="text-xl font-black tracking-tight text-foreground">
              Fee<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Desk</span>
              <span className="text-xs ml-2 px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold uppercase tracking-wider translate-y-[-2px] inline-block">Student</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <NotificationCenter />
          
          <Link
            href="/student/settings"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden relative">
        {children}
      </main>
    </div>
  )
}
