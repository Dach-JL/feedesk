import Link from "next/link"
import { 
  Users, GraduationCap, CreditCard, Receipt, BarChart3, Shield, 
  ArrowRight, CheckCircle2, Zap, Globe, Clock, Lock 
} from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Student Portal",
    description: "Secure, role-based access for students to check balances, view payment history, and report digital transactions.",
    color: "from-indigo-500 to-purple-600",
    bgLight: "bg-indigo-50",
    bgDark: "dark:bg-indigo-950/30",
    borderColor: "border-indigo-200 dark:border-indigo-800/50",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
  {
    icon: Zap,
    title: "Digital Proofs",
    description: "Support for Telebirr and CBE receipts. Students upload screenshots that admins can verify with a single click.",
    color: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50",
    bgDark: "dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Lock,
    title: "Verified Receipts",
    description: "Receipts are automatically unlocked and ready for download only after admin verification, ensuring financial integrity.",
    color: "from-amber-500 to-orange-600",
    bgLight: "bg-amber-50",
    bgDark: "dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800/50",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    icon: GraduationCap,
    title: "Class Management",
    description: "Organize classes and courses effortlessly. Track enrollment counts and manage academic structures from one central hub.",
    color: "from-violet-500 to-indigo-600",
    bgLight: "bg-violet-50",
    bgDark: "dark:bg-violet-950/30",
    borderColor: "border-violet-200 dark:border-violet-800/50",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    icon: Users,
    title: "Student Directory",
    description: "Maintain a comprehensive student registry. Enroll, search, and manage student profiles with class assignments in seconds.",
    color: "from-blue-500 to-cyan-600",
    bgLight: "bg-blue-50",
    bgDark: "dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800/50",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Get an executive snapshot of total revenue, today's collections, and a live report of students with outstanding balances.",
    color: "from-rose-500 to-red-600",
    bgLight: "bg-rose-50",
    bgDark: "dark:bg-rose-950/30",
    borderColor: "border-rose-200 dark:border-rose-800/50",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
]

const stats = [
  { label: "Faster enrollment", value: "10x" },
  { label: "Time saved weekly", value: "12hrs" },
  { label: "Error reduction", value: "98%" },
  { label: "System uptime", value: "99.9%" },
]

const benefits = [
  { icon: Shield, text: "Dual-role student/admin access" },
  { icon: Globe, text: "Telebirr & CBE digital proof support" },
  { icon: Clock, text: "Real-time verification workflow" },
  { icon: Lock, text: "Automated receipt security unlock" },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 overflow-hidden">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-black text-sm">F</span>
            </div>
            <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
              Fee<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Desk</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <a href="#features" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Features</a>
            <a href="#stats" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Why FeeDesk</a>
            <a href="#security" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Security</a>
          </div>
          <Link
            href="/login"
            className="px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-6">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-200/20 to-purple-200/20 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="animate-slide-up inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-200 dark:border-indigo-800/50 bg-indigo-50/80 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Built for schools & training institutes
          </div>

          {/* Headline */}
          <h1 className="animate-slide-up-delay-1 text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
            Fee management
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient">
              made effortless
            </span>
          </h1>

          {/* Subheadline */}
          <p className="animate-slide-up-delay-2 mt-6 text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed text-balance">
            A powerful, elegant platform to manage student enrollment, collect fees, 
            track outstanding dues, and generate professional receipts — all from one dashboard.
          </p>

          {/* CTA Buttons */}
          <div className="animate-slide-up-delay-3 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all text-lg"
            >
              Launch Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-4 text-zinc-700 dark:text-zinc-300 font-semibold rounded-2xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all text-lg"
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Floating UI Preview Cards */}
        <div className="animate-slide-up-delay-4 max-w-4xl mx-auto mt-20 relative">
          <div className="bg-zinc-900 dark:bg-zinc-900 rounded-3xl shadow-2xl shadow-zinc-900/20 dark:shadow-black/50 border border-zinc-800 overflow-hidden">
            {/* Window Chrome */}
            <div className="flex items-center gap-2 px-5 py-4 border-b border-zinc-800">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <div className="ml-4 flex-1 h-7 bg-zinc-800 rounded-lg flex items-center px-4">
                <span className="text-xs text-zinc-500 font-mono">feedesk.app/dashboard</span>
              </div>
            </div>
            {/* Dashboard Preview */}
            <div className="p-6 flex gap-4">
              {/* Mini Sidebar */}
              <div className="hidden md:flex flex-col w-44 gap-2 flex-shrink-0">
                <div className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 mb-4">FeeDesk</div>
                {["Overview", "Classes", "Students", "Verifications", "Payments", "Receipts"].map((item, i) => (
                  <div key={item} className={`px-3 py-2 rounded-lg text-xs font-medium ${i === 3 ? 'bg-indigo-500/10 text-indigo-400' : i === 0 ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300 transition-colors cursor-default'}`}>
                    {item}
                  </div>
                ))}
              </div>
              {/* Content */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="animate-float bg-zinc-800 rounded-xl p-4 border border-zinc-700/50">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Revenue</div>
                    <div className="text-xl font-bold text-white">$24,500</div>
                    <div className="text-[10px] text-emerald-500 mt-1">+12.5% today</div>
                  </div>
                  <div className="animate-float-delayed bg-zinc-800 rounded-xl p-4 border border-zinc-700/50">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Students</div>
                    <div className="text-xl font-bold text-white">1,204</div>
                    <div className="text-[10px] text-zinc-400 mt-1">12 classes</div>
                  </div>
                  <div className="animate-float bg-zinc-800 rounded-xl p-4 border border-zinc-700/50" style={{ animationDelay: '2s' }}>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Pending</div>
                    <div className="text-xl font-bold text-amber-500">$3,200</div>
                    <div className="text-[10px] text-rose-500 mt-1">Action needed</div>
                  </div>
                </div>
                <div className="bg-zinc-800/60 rounded-xl p-4 border border-zinc-700/30 space-y-2">
                  <div className="text-xs font-semibold text-zinc-300">Recent Transactions</div>
                  {[
                    { name: "Jane Cooper", amount: "$850.00", status: "Completed" },
                    { name: "Floyd Miles", amount: "$420.00", status: "Completed" },
                    { name: "Devon Webb", amount: "$1,200.00", status: "Completed" },
                  ].map((tx) => (
                    <div key={tx.name} className="flex items-center justify-between py-1.5 border-t border-zinc-700/40">
                      <span className="text-xs text-zinc-400">{tx.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-emerald-400">{tx.amount}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/30 text-emerald-400 border border-emerald-800/40">{tx.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Floating UI Element - Mobile Verification Notification */}
          <div className="absolute -top-12 -right-12 hidden lg:block animate-float-delayed">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-4 border border-zinc-200 dark:border-zinc-800 flex items-center gap-4 max-w-[240px]">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Receipt className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Payment Verified</div>
                <div className="text-xs font-bold text-zinc-900 dark:text-white">Receipt unlocked for #Student_01</div>
              </div>
            </div>
          </div>

          {/* Floating UI Element - Student Upload */}
          <div className="absolute top-1/2 -left-20 hidden lg:block animate-float">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-4 border border-zinc-200 dark:border-zinc-800 flex items-center gap-4 max-w-[240px]">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Student Portal</div>
                <div className="text-xs font-bold text-zinc-900 dark:text-white">New Telebirr proof uploaded</div>
              </div>
            </div>
          </div>

          {/* Glow underneath */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl rounded-full" />
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 px-6 border-y border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-indigo-500 to-purple-600">
                {stat.value}
              </div>
              <div className="mt-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
              Every tool you need, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">one platform</span>
            </h2>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              From enrollment to receipts — FeeDesk handles the entire financial lifecycle of your institution with precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className={`group relative p-8 rounded-3xl border ${feature.borderColor} ${feature.bgLight} ${feature.bgDark} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default`}
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Security / Trust Section */}
      <section id="security" className="py-24 px-6 bg-zinc-50/50 dark:bg-zinc-900/30 border-y border-zinc-200/60 dark:border-zinc-800/60">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
              Built for trust.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">Designed for scale.</span>
            </h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400 leading-relaxed">
              FeeDesk is engineered with enterprise-grade security patterns. Every API route is protected by session-based authentication, and your financial data is stored securely on Neon&apos;s serverless PostgreSQL with encrypted connections.
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((b) => {
                const Icon = b.icon
                return (
                  <div key={b.text} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{b.text}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Visual Shield */}
          <div className="relative flex items-center justify-center w-72 h-72 flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 dark:from-emerald-600/10 dark:to-teal-600/10 rounded-full blur-2xl animate-pulse-glow" />
            <div className="relative w-48 h-48 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl shadow-emerald-500/20 flex items-center justify-center animate-float">
              <Shield className="w-20 h-20 text-white/90" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
              Up and running in <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">minutes</span>
            </h2>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
              Three simple steps — that&apos;s all it takes to transform your fee management workflow.
            </p>
          </div>

          <div className="space-y-12">
            {[
              { step: "01", title: "Set up your institutional structure", desc: "Create classes and enroll students. Use our smart templates to register existing students via admin dashboard." },
              { step: "02", title: "Students report payments", desc: "Students log into their secure portal to view outstanding fees and upload digital proofs from Telebirr or CBE." },
              { step: "03", title: "Verify, track & unlock", desc: "Admins review proofs in a single click. Verified payments automatically update balances and unlock professional PDF receipts." },
            ].map((item, i) => (
              <div key={item.step} className="flex items-start gap-6 md:gap-8 group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  {item.step}
                </div>
                <div className="pt-1">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{item.title}</h3>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">{item.desc}</p>
                  {i < 2 && <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-800 ml-0 mt-6" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 md:py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-[0.03] dark:opacity-[0.06]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight">
            Ready to modernize <br />your fee management?
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
            Join institutions that have simplified their financial workflow with FeeDesk. Start collecting, tracking, and reporting in minutes.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.03] active:scale-[0.97] transition-all text-lg"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Instant setup</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Full access</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-10 px-6 bg-zinc-50/50 dark:bg-zinc-900/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-black text-xs">F</span>
            </div>
            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">FeeDesk</span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            &copy; {new Date().getFullYear()} FeeDesk. Crafted with precision for education.
          </p>
        </div>
      </footer>
    </main>
  )
}
