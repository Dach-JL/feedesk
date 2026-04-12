"use client"

import Header from "@/components/Header"
import { AdminQuickMenu } from "@/components/dashboard/AdminQuickMenu"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="flex flex-col flex-1 w-0 overflow-hidden relative">
        <Header />
        <main className="flex-1 relative overflow-y-auto focus:outline-none scroll-smooth bg-muted/20">
          <div className="py-6 md:py-8 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
