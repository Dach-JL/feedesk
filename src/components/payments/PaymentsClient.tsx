"use client";

import React, { useEffect, useState } from "react";
import { Landmark, Search, DollarSign, Calculator, Receipt, Loader2, ArrowRightCircle, CheckCircle2 } from "lucide-react";

type FeePlanData = {
  id: string;
  name: string;
  amount: number;
  classId: string | null;
};

type PaymentData = {
  id: string;
  amount: number;
  paymentDate: string;
  feePlanId: string;
  studentId: string;
};

type StudentData = {
  id: string;
  name: string;
  classId: string;
  class?: { name: string };
};

export default function PaymentsClient() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [feePlans, setFeePlans] = useState<FeePlanData[]>([]);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedFeePlanId, setSelectedFeePlanId] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [stuRes, planRes, payRes] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/fee-plans"),
        fetch("/api/payments")
      ]);
      setStudents(await stuRes.json());
      setFeePlans(await planRes.json());
      setPayments(await payRes.json());
    } catch (err) {
      console.error("Failed to load financial data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Logical Calculations (Phase 24)
  const selectedStudent = students.find(s => s.id === selectedStudentId);
  
  const applicableFeePlans = selectedStudent 
    ? feePlans.filter(fp => fp.classId === null || fp.classId === selectedStudent.classId)
    : [];

  const studentPayments = selectedStudent
    ? payments.filter(p => p.studentId === selectedStudent.id)
    : [];

  const totalOwed = applicableFeePlans.reduce((sum, plan) => sum + plan.amount, 0);
  const totalPaid = studentPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const outstandingDues = totalOwed - totalPaid;

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedFeePlanId || !paymentAmount) return;

    setIsSubmitting(true);
    try {
      const payload = {
        studentId: selectedStudentId,
        feePlanId: selectedFeePlanId,
        amount: parseFloat(paymentAmount)
      };

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setPaymentAmount(""); // Reset amount immediately
        fetchData(); // Refresh history
      } else {
        alert("Transaction failed to process securely.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Landmark className="h-6 w-6 text-amber-500" />
            Payment Processing
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Cashier system to dynamically calculate outstanding dues and execute transactions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Cashier Input */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <Search className="h-5 w-5 text-amber-500" />
              1. Locate Student
            </h3>
            {loading ? (
              <div className="h-10 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-md" />
            ) : (
              <select
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  setSelectedFeePlanId("");
                }}
                className="flex h-12 w-full rounded-md border-2 border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
              >
                <option value="">-- Scan or Select Student --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} {(s.class ? `(${s.class.name})` : "")}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className={`rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm p-6 transition-opacity duration-300 ${!selectedStudentId ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <Receipt className="h-5 w-5 text-amber-500" />
              2. Transaction Details
            </h3>
            
            <form onSubmit={handleTransaction} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Target Fee Plan</label>
                <select
                  required
                  value={selectedFeePlanId}
                  onChange={(e) => {
                    setSelectedFeePlanId(e.target.value);
                    // Smart auto-fill amount based on plan
                    const plan = applicableFeePlans.find(p => p.id === e.target.value);
                    if (plan) setPaymentAmount(plan.amount.toString());
                  }}
                  className="flex h-10 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="" disabled>Select applicable fee plan</option>
                  {applicableFeePlans.map(plan => {
                    const mappedPayments = studentPayments.filter(p => p.feePlanId === plan.id).reduce((s, p) => s + p.amount, 0);
                    return (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - ${plan.amount.toFixed(2)} (Paid: ${mappedPayments.toFixed(2)})
                      </option>
                    )
                  })}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Payment Amount ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex h-12 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 pl-10 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !selectedStudentId || !selectedFeePlanId || !paymentAmount}
                className="w-full h-12 inline-flex items-center justify-center rounded-md text-base font-bold transition-all bg-amber-500 text-amber-950 shadow hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Process Payment
                    <ArrowRightCircle className="ml-2 h-5 w-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Dynamic Dues Engine */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 shadow-inner p-6 sticky top-6 h-full min-h-[400px]">
             <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <Calculator className="h-5 w-5 text-amber-600" />
              Financial Breakdown
            </h3>

            {!selectedStudentId ? (
              <div className="flex flex-col items-center justify-center h-48 text-center text-zinc-500">
                <Search className="h-8 w-8 mb-3 opacity-20" />
                <p>Select a student to calculate outstanding dues.</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center pb-4 border-b border-zinc-300 dark:border-zinc-700">
                  <span className="text-zinc-600 dark:text-zinc-400 font-medium">Total Fees Owed:</span>
                  <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">${totalOwed.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center pb-4 border-b border-zinc-300 dark:border-zinc-700">
                  <span className="text-zinc-600 dark:text-zinc-400 font-medium">Total Received:</span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">-${totalPaid.toFixed(2)}</span>
                </div>

                <div className="bg-white dark:bg-zinc-950 p-4 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                  <span className="block text-sm font-medium text-zinc-500 mb-1">Current Outstanding Balance</span>
                  <span className={`text-4xl font-extrabold tracking-tight ${outstandingDues > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    ${Math.max(0, outstandingDues).toFixed(2)}
                  </span>
                  {outstandingDues <= 0 && totalOwed > 0 && (
                    <span className="inline-block mt-2 text-xs font-semibold px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                      Fully Cleared
                    </span>
                  )}
                </div>

                {studentPayments.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Recent Transactions</h4>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {studentPayments.slice(0, 5).map(p => (
                        <div key={p.id} className="flex justify-between text-sm bg-white dark:bg-zinc-950 p-2 rounded-md">
                          <span className="text-zinc-500">{new Date(p.paymentDate).toLocaleDateString()}</span>
                          <span className="font-medium text-emerald-600">+${p.amount.toFixed(2)}</span>
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
