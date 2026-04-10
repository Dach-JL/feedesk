"use client";

import React, { useEffect, useState } from "react";
import { DollarSign, Users, AlertCircle, ArrowUpRight, Loader2, CheckCircle2, TrendingUp } from "lucide-react";
import Link from "next/link";

type UnpaidStudent = {
  id: string;
  name: string;
  className: string;
  totalOwed: number;
  totalPaid: number;
  outstandingDues: number;
};

type Metrics = {
  revenue: { total: number; today: number; recentTransactions: number };
  counters: { students: number; classes: number };
  unpaidStudents: UnpaidStudent[];
};

export default function DashboardClient() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/metrics")
      .then(res => res.json())
      .then(data => {
        if (!data.error) setMetrics(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !metrics) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const totalOutstanding = metrics.unpaidStudents.reduce((sum, s) => sum + s.outstandingDues, 0);

  const cards = [
    {
      label: "Total Revenue",
      value: `$${metrics.revenue.total.toFixed(2)}`,
      icon: DollarSign,
      badge: `+$${metrics.revenue.today.toFixed(2)} today`,
      badgeColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10",
      accentColor: "from-indigo-500 to-blue-600",
      iconBg: "bg-indigo-50 dark:bg-indigo-500/10",
      iconColor: "text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Enrolled Students",
      value: metrics.counters.students.toString(),
      icon: Users,
      badge: `${metrics.counters.classes} classes`,
      badgeColor: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10",
      accentColor: "from-purple-500 to-pink-600",
      iconBg: "bg-purple-50 dark:bg-purple-500/10",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      label: "Outstanding Debt",
      value: `$${totalOutstanding.toFixed(2)}`,
      icon: AlertCircle,
      badge: `${metrics.unpaidStudents.length} unpaid`,
      badgeColor: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10",
      accentColor: "from-rose-500 to-orange-600",
      iconBg: "bg-rose-50 dark:bg-rose-500/10",
      iconColor: "text-rose-600 dark:text-rose-400",
    },
  ];

  return (
    <div className="space-y-8 animate-slide-up">
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 p-6 relative overflow-hidden group hover:shadow-md hover:border-zinc-300/60 dark:hover:border-zinc-700/60 transition-all duration-300"
            >
              {/* Subtle accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${card.accentColor} opacity-60`} />
              
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${card.badgeColor}`}>
                  <TrendingUp className="w-3 h-3" />
                  {card.badge}
                </div>
              </div>
              
              <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">{card.label}</div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">{card.value}</div>
            </div>
          );
        })}
      </div>

      {/* Unpaid Action Report */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-zinc-200/60 dark:border-zinc-800/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
              <AlertCircle className="w-[18px] h-[18px] text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Unpaid Students Report</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Accounts requiring immediate attention</p>
            </div>
          </div>
          <Link 
            href="/dashboard/payments" 
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
          >
            Process Payments
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        
        {metrics.unpaidStudents.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500/40 mx-auto mb-3" />
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              All students have cleared their active fee plans.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Owed</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Paid</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Balance</th>
                </tr>
              </thead>
              <tbody>
                {metrics.unpaidStudents.map(student => (
                  <tr key={student.id} className="border-b border-zinc-100 dark:border-zinc-800/40 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{student.name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {student.className}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-zinc-500 tabular-nums">${student.totalOwed.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-emerald-600 dark:text-emerald-400 tabular-nums">${student.totalPaid.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-bold text-rose-600 dark:text-rose-400 tabular-nums">${student.outstandingDues.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
