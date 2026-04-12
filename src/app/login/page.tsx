"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Loader2, Lock, Mail } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    })

    if (res?.error) {
      setError("Invalid email or password")
      setLoading(false)
    } else {
      // Fetch session manually to determine role for dynamic routing
      const sessionRes = await fetch("/api/auth/session")
      const sessionData = await sessionRes.json()
      
      if (sessionData?.user?.role === "student") {
        router.push("/student")
      } else {
        router.push("/dashboard")
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-zinc-950 items-center justify-center">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-transparent to-purple-950/50" />
        
        <div className="relative z-10 px-16 max-w-lg">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white font-black text-xl">F</span>
            </div>
            <span className="text-3xl font-black tracking-tight text-white">
              Fee<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Desk</span>
            </span>
          </div>
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Smart fee management for modern institutions
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Streamline enrollment, automate billing, process payments, and generate professional receipts — all from one elegant dashboard.
          </p>
          <div className="mt-10 flex flex-col gap-3">
            {["Real-time financial analytics", "Instant PDF receipt generation", "Smart outstanding dues tracking"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-zinc-300">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black text-sm">F</span>
            </div>
            <span className="text-xl font-black tracking-tight text-foreground">
              FeeDesk
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="mt-2 text-muted-foreground">
              Enter your credentials to access the management portal.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="p-3.5 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl text-center font-medium animate-slide-up">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  className="w-full h-12 px-4 pl-11 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring transition-all hover:border-accent"
                  placeholder="admin@feedesk.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  className="w-full h-12 px-4 pl-11 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring transition-all hover:border-accent"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full h-12 flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 p-4 rounded-xl bg-muted border border-border">
            <p className="text-xs text-muted-foreground text-center">
              Demo credentials: <span className="font-semibold text-foreground">admin@feedesk.com</span> / <span className="font-semibold text-foreground">admin</span>
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              &larr; Back to homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
