import Link from "next/link"

export default function Sidebar() {
  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex-shrink-0 hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-zinc-800">
        <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
          FeeDesk
        </h1>
      </div>
      <nav className="flex-1 p-4 space-y-2 mt-4">
        <Link href="/dashboard" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-zinc-100 bg-zinc-800/80 shadow-sm border border-zinc-700/50">
          Overview
        </Link>
        <Link href="/dashboard/classes" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors">
          Classes
        </Link>
        <Link href="/dashboard/students" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors">
          Students
        </Link>
        <Link href="/dashboard/payments" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors">
          Payments
        </Link>
      </nav>
      <div className="p-4 border-t border-zinc-800/80">
        <div className="flex items-center gap-3 px-2 py-2 hover:bg-zinc-800/50 rounded-lg cursor-pointer transition-colors">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-inner flex items-center justify-center text-sm font-bold text-white uppercase transform hover:scale-105 transition-transform">
            AD
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-200">System Admin</p>
            <p className="text-xs text-zinc-500 hover:text-zinc-300">Sign out</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
