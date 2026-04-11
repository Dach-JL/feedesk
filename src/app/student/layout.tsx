"use client"

import { signOut } from "next-auth/react"
import { LogOut, Settings } from "lucide-react"
import Link from "next/link"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      {/* Student Portal Header */}
      <header className="h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between px-6 z-10 sticky top-0 shrink-0">
        <div className="flex items-center gap-2.5">
          <Link href="/student" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-black text-sm">F</span>
            </div>
            <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
              Fee<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Desk</span>
              <span className="text-xs ml-2 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider translate-y-[-2px] inline-block">Student</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/student/settings"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
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
