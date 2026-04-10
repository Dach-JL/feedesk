"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { 
  LayoutDashboard, GraduationCap, Users, CreditCard, 
  Landmark, History, LogOut, ChevronRight, ShieldCheck 
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

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[260px] bg-zinc-950 border-r border-zinc-800/60 flex-shrink-0 hidden md:flex flex-col">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-black text-sm">F</span>
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            Fee<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Desk</span>
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <div className="px-3 mb-4 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600">
          Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-indigo-600/20 to-purple-600/10 text-white border border-indigo-500/20 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              <Icon className={`h-[18px] w-[18px] flex-shrink-0 ${isActive ? "text-indigo-400" : "text-zinc-600 group-hover:text-zinc-400"}`} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 text-indigo-400/60" />}
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-zinc-800/60">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-zinc-900/50 border border-zinc-800/40">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-inner flex items-center justify-center text-sm font-bold text-white uppercase flex-shrink-0">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-zinc-200 truncate">System Admin</p>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-rose-400 transition-colors mt-0.5 group"
            >
              <LogOut className="w-3 h-3 group-hover:translate-x-[-1px] transition-transform" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
