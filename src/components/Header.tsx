"use client"

import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import NotificationCenter from "./notifications/NotificationCenter"

const pageTitles: Record<string, { title: string; description: string }> = {
  "/dashboard": { title: "Overview", description: "Your institution at a glance" },
  "/dashboard/classes": { title: "Classes & Courses", description: "Manage academic structures" },
  "/dashboard/students": { title: "Student Directory", description: "Enrollment & profiles" },
  "/dashboard/fee-plans": { title: "Fee Plans", description: "Billing structures & schedules" },
  "/dashboard/payments": { title: "Payment Processing", description: "Record & track transactions" },
  "/dashboard/verifications": { title: "Verifications", description: "Payment review dashboard" },
  "/dashboard/receipts": { title: "Receipts & History", description: "Transaction logs & PDF exports" },
}

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname()
  const pageInfo = pageTitles[pathname] || { title: "Dashboard", description: "" }

  return (
    <header className="h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between px-6 md:px-8 z-10 w-full relative shrink-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white leading-none">
            {pageInfo.title}
          </h2>
          {pageInfo.description && (
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5 hidden sm:block">{pageInfo.description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <NotificationCenter />
      </div>
    </header>
  )
}
