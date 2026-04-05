export default function Header() {
  return (
    <header className="h-16 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between px-6 z-10 w-full relative shrink-0">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Dashboard</h2>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-indigo-500 border-2 border-white dark:border-zinc-950"></span>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
      </div>
    </header>
  )
}
