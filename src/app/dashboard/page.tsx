export default function DashboardPage() {
  return (
    <div className="space-y-8 fade-in">
      
      {/* High-level metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200/50 dark:border-zinc-800 p-8 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold mb-2 uppercase tracking-wider">Total Revenue</div>
          <div className="text-4xl font-extrabold text-zinc-900 dark:text-white">$24,500</div>
          <div className="text-sm text-emerald-500 font-medium mt-3 flex items-center bg-emerald-500/10 w-fit px-2.5 py-1 rounded-full">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>
            +12.5% Context
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200/50 dark:border-zinc-800 p-8 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold mb-2 uppercase tracking-wider">Active Students</div>
          <div className="text-4xl font-extrabold text-zinc-900 dark:text-white">1,204</div>
          <div className="text-sm text-zinc-400 font-medium mt-3">Across 12 classes</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200/50 dark:border-zinc-800 p-8 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold mb-2 uppercase tracking-wider">Pending Fees</div>
          <div className="text-4xl font-extrabold text-amber-600 dark:text-amber-500">$3,200</div>
          <div className="text-sm text-rose-500 font-medium mt-3 flex items-center bg-rose-500/10 w-fit px-2.5 py-1 rounded-full">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Requires action
          </div>
        </div>
      </div>

      {/* Main List Section */}
      <div className="mt-8 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200/50 dark:border-zinc-800 p-8">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Recent Payments</h3>
        <div className="text-center py-16 text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
          Payments loaded via API will appear here. No data available yet.
        </div>
      </div>
    </div>
  )
}
