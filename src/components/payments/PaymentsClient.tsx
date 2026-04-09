"use client";

import React, { useEffect, useState } from "react";
import { DollarSign, Calculator, Loader2, ArrowRight, CheckCircle2, Wallet } from "lucide-react";

type FeePlanData = { id: string; name: string; amount: number; classId: string | null; };
type PaymentData = { id: string; amount: number; paymentDate: string; feePlanId: string; studentId: string; };
type StudentData = { 
  id: string; 
  name: string; 
  classId: string; 
  class?: { name: string }; 
  assignments: {
    id: string;
    status: string;
    feePlan: FeePlanData;
    payments: PaymentData[];
  }[];
};

export default function PaymentsClient() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [feePlans, setFeePlans] = useState<FeePlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [stuRes, planRes] = await Promise.all([
        fetch("/api/students"), 
        fetch("/api/fee-plans")
      ]);
      setStudents(await stuRes.json());
      setFeePlans(await planRes.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const studentPayments = selectedStudent ? selectedStudent.assignments.flatMap(a => a.payments) : [];
  const totalOwed = selectedStudent ? selectedStudent.assignments.reduce((sum, a) => sum + a.feePlan.amount, 0) : 0;
  const totalPaid = studentPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const outstandingDues = totalOwed - totalPaid;

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedAssignmentId || !paymentAmount) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentFeeAssignmentId: selectedAssignmentId, amount: parseFloat(paymentAmount) }),
      });
      if (res.ok) { setPaymentAmount(""); fetchData(); } else alert("Transaction failed.");
    } catch (err) { console.error(err); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Cashier Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Step 1 */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 p-6">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <div className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-xs font-black text-amber-600 dark:text-amber-400">1</div>
              Locate Student
            </h3>
            {loading ? <div className="h-12 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-xl" /> : (
              <select value={selectedStudentId} onChange={(e) => { setSelectedStudentId(e.target.value); setSelectedAssignmentId(""); }}
                className="flex h-12 w-full rounded-xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all">
                <option value="">-- Select Student --</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} {s.class ? `(${s.class.name})` : ""}</option>)}
              </select>
            )}
          </div>

          {/* Step 2 */}
          <div className={`bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 p-6 transition-all duration-300 ${!selectedStudentId ? 'opacity-40 pointer-events-none' : ''}`}>
            <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <div className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-xs font-black text-amber-600 dark:text-amber-400">2</div>
              Transaction Details
            </h3>
            <form onSubmit={handleTransaction} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Fee Plan</label>
                <select required value={selectedAssignmentId} onChange={(e) => {
                  setSelectedAssignmentId(e.target.value);
                  const assignment = selectedStudent?.assignments.find(a => a.id === e.target.value);
                  if (assignment) setPaymentAmount(assignment.feePlan.amount.toString());
                }} className="flex h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                  <option value="" disabled>Select assigned fee</option>
                  {selectedStudent?.assignments.map(assignment => {
                    const paid = assignment.payments.reduce((s, p) => s + p.amount, 0);
                    return <option key={assignment.id} value={assignment.id}>{assignment.feePlan.name} - ${assignment.feePlan.amount.toFixed(2)} (Paid: ${paid.toFixed(2)})</option>;
                  })}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Payment Amount ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                  <input type="number" step="0.01" min="0.01" required value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="0.00"
                    className="flex h-12 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 pl-11 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                </div>
              </div>
              <button type="submit" disabled={isSubmitting || !selectedStudentId || !selectedAssignmentId || !paymentAmount}
                className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl text-base font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] transition-all">
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CheckCircle2 className="h-5 w-5" /> Process Payment <ArrowRight className="h-5 w-5" /></>}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Financial Breakdown */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 p-6 sticky top-6">
            <h3 className="text-base font-bold mb-6 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center"><Calculator className="w-4 h-4 text-amber-600 dark:text-amber-400" /></div>
              Financial Summary
            </h3>

            {!selectedStudentId ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-zinc-400">
                <Wallet className="h-10 w-10 mb-3 opacity-20" />
                <p className="text-sm">Select a student to view their financial breakdown.</p>
              </div>
            ) : (
              <div className="space-y-5 animate-slide-up">
                <div className="flex justify-between items-center pb-4 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="text-sm text-zinc-500">Total Owed</span>
                  <span className="text-lg font-bold text-zinc-900 dark:text-white tabular-nums">${totalOwed.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="text-sm text-zinc-500">Total Paid</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">-${totalPaid.toFixed(2)}</span>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60">
                  <span className="block text-xs font-semibold text-zinc-500 mb-1 uppercase tracking-wider">Outstanding Balance</span>
                  <span className={`text-3xl font-black tracking-tight tabular-nums ${outstandingDues > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    ${Math.max(0, outstandingDues).toFixed(2)}
                  </span>
                  {outstandingDues <= 0 && totalOwed > 0 && (
                    <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-lg">
                      <CheckCircle2 className="w-3 h-3" /> Fully Cleared
                    </span>
                  )}
                </div>

                {studentPayments.length > 0 && (
                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Recent</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {studentPayments.slice(0, 5).map(p => (
                        <div key={p.id} className="flex justify-between text-sm bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-lg">
                          <span className="text-zinc-500 text-xs">{new Date(p.paymentDate).toLocaleDateString()}</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs">+${p.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
