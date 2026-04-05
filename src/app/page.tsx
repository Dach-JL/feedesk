import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-zinc-50 dark:bg-zinc-950 font-sans">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col gap-8">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 drop-shadow-sm text-center">
          FeeDesk Management
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium">
          The ultimate platform for school fee tracking and administration.
        </p>
        
        <div className="flex gap-4 mt-8">
          <Link 
            href="/login" 
            className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-105 transition-all w-48 text-center text-lg"
          >
            Access Portal
          </Link>
        </div>
      </div>
    </main>
  )
}
