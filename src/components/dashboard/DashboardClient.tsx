"use client";

import React, { useEffect, useState } from "react";
import { DollarSign, Users, AlertCircle, ArrowUpRight, Loader2, CheckCircle2 } from "lucide-react";
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

  return (
    <div className="space-y-8 fade-in animate-in slide-in-from-bottom-4 duration-500">
      
      {/* High-level metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200/50 dark:border-zinc-800 p-8 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold mb-2 uppercase tracking-wider flex items-center"><DollarSign className="w-4 h-4 mr-1"/>Total Revenue</div>
          <div className="text-4xl font-extrabold text-zinc-900 dark:text-white">${metrics.revenue.total.toFixed(2)}</div>
          <div className="text-sm text-emerald-500 font-medium mt-3 flex items-center bg-emerald-500/10 w-fit px-2.5 py-1 rounded-full">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            +${metrics.revenue.today.toFixed(2)} Today ({metrics.revenue.recentTransactions} log(s))
          </div>
        </div>

        {/* Counter Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200/50 dark:border-zinc-800 p-8 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold mb-2 uppercase tracking-wider flex items-center"><Users className="w-4 h-4 mr-1"/>Active Directory</div>
          <div className="text-4xl font-extrabold text-zinc-900 dark:text-white">{metrics.counters.students}</div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-3">
            Enrolled across {metrics.counters.classes} official classes
          </div>
        </div>

        {/* Risk Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200/50 dark:border-zinc-800 p-8 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold mb-2 uppercase tracking-wider flex items-center"><AlertCircle className="w-4 h-4 mr-1"/>Unpaid Debt</div>
          <div className="text-4xl font-extrabold text-rose-600 dark:text-rose-500">${totalOutstanding.toFixed(2)}</div>
          <div className="text-sm text-rose-600 font-medium mt-3 flex items-center bg-rose-500/10 w-fit px-2.5 py-1 rounded-full">
            <AlertCircle className="w-4 h-4 mr-1" />
            {metrics.unpaidStudents.length} accounts missing payments
          </div>
        </div>
      </div>

      {/* Unpaid Action Report */}
      <div className="mt-8 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200/50 dark:border-zinc-800 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="text-rose-500 h-5 w-5" />
            Action Required: Unpaid Students Report
          </h3>
          <Link href="/dashboard/payments" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">
            Process Payments &rarr;
          </Link>
        </div>
        
        {metrics.unpaidStudents.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-3 opacity-50" />
            Great news! All students have cleared their active fee plans.
          </div>
        ) : (
          <div className="overflow-x-auto relative">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50/50 dark:bg-zinc-900/50 rounded-md">
                <tr>
                  <th className="px-6 py-3 font-semibold rounded-tl-lg">Student Name</th>
                  <th className="px-6 py-3 font-semibold">Class Group</th>
                  <th className="px-6 py-3 font-semibold text-right">Owed</th>
                  <th className="px-6 py-3 font-semibold text-right">Paid</th>
                  <th className="px-6 py-3 font-semibold text-right rounded-tr-lg">Debt</th>
                </tr>
              </thead>
              <tbody>
                {metrics.unpaidStudents.map(student => (
                  <tr key={student.id} className="border-b border-zinc-100 dark:border-zinc-800/60 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{student.name}</td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{student.className}</td>
                    <td className="px-6 py-4 text-right text-zinc-500">${student.totalOwed.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-zinc-500">${student.totalPaid.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-bold text-rose-600">${student.outstandingDues.toFixed(2)}</td>
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
