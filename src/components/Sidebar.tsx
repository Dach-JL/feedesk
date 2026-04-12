"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { 
  LayoutDashboard, GraduationCap, Users, CreditCard, 
  Landmark, History, LogOut, ChevronRight, ShieldCheck, X 
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/classes", label: "Classes", icon: GraduationCap },
  { href: "/dashboard/students", label: "Students", icon: Users },
  { href: "/dashboard/fee-plans", label: "Fee Plans", icon: CreditCard },
  { href: "/dashboard/payments", label: "Payments", icon: Landmark },
  { href: "/dashboard/verifications", label: "Verifications", icon: ShieldCheck },
  { href: "/dashboard/receipts", label: "Receipts", icon: History },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Backdrop for Mobile */}
      <div 
        className={`fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <aside className={`fixed md:relative inset-y-0 left-0 z-[70] w-[280px] bg-card border-r border-border flex-shrink-0 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      }`}>
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-black text-sm">F</span>
            </div>
            <span className="text-xl font-black tracking-tight text-foreground">
              Fee<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Desk</span>
            </span>
          </div>
          <button 
            onClick={onClose}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <div className="px-3 mb-4 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
            Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <Icon className={`h-[18px] w-[18px] flex-shrink-0 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 text-primary/60" />}
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-muted/50 border border-border/40">
            <div className="w-9 h-9 rounded-xl bg-primary shadow-inner flex items-center justify-center text-sm font-bold text-primary-foreground uppercase flex-shrink-0">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">System Admin</p>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors mt-0.5 group"
              >
                <LogOut className="w-3 h-3 group-hover:translate-x-[-1px] transition-transform" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
