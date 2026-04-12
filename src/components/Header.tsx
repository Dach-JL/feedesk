"use client"

import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import NotificationCenter from "./notifications/NotificationCenter"
import { ThemeToggle } from "./ThemeToggle"

const pageTitles: Record<string, { title: string; description: string }> = {
  "/dashboard": { title: "Overview", description: "Your institution at a glance" },
  "/dashboard/classes": { title: "Classes & Courses", description: "Manage academic structures" },
  "/dashboard/students": { title: "Student Directory", description: "Enrollment & profiles" },
  "/dashboard/fee-plans": { title: "Fee Plans", description: "Billing structures & schedules" },
  "/dashboard/payments": { title: "Payment Processing", description: "Record & track transactions" },
  "/dashboard/verifications": { title: "Verifications", description: "Payment review dashboard" },
  "/dashboard/receipts": { title: "Receipts & History", description: "Transaction logs & PDF exports" },
}

export default function Header() {
  const pathname = usePathname()
  const pageInfo = pageTitles[pathname] || { title: "Dashboard", description: "" }

  return (
    <header className="h-16 bg-background/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-6 md:px-8 z-10 w-full relative shrink-0">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground leading-none">
            {pageInfo.title}
          </h2>
          {pageInfo.description && (
            <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">{pageInfo.description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <NotificationCenter />
      </div>
    </header>
  )
}
