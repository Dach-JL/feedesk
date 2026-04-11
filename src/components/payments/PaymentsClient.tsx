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
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; class: { name: string } }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounced Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const handler = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/students/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data);
      } catch (err) { console.error(err); } finally { setIsSearching(false); }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchStudentDetails = async (id: string) => {
    setDetailsLoading(true);
    setSelectedStudentId(id);
    setSelectedStudent(null);
    setSelectedAssignmentId("");
    setPaymentAmount("");
    try {
      const res = await fetch(`/api/students/${id}`);
      const data = await res.json();
      if (!data.error) setSelectedStudent(data);
    } catch (err) { console.error(err); } finally { setDetailsLoading(false); }
  };

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
      if (res.ok) { 
        setPaymentAmount(""); 
        fetchStudentDetails(selectedStudentId); // Refresh details
      } else alert("Transaction failed.");
    } catch (err) { console.error(err); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Cashier Form */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Step 1 */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 p-4 sm:p-6 transition-all">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <div className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-xs font-black text-amber-600 dark:text-amber-400">1</div>
              Locate Student
            </h3>
            
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="Search by name or email..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
                {isSearching && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {searchResults.length > 0 && !selectedStudentId && (
                <div className="mt-2 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="max-h-60 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                    {searchResults.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          fetchStudentDetails(s.id);
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center gap-3 transition-colors"
                      >
                        <UserCircle className="w-5 h-5 text-zinc-400" />
                        <div>
                          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{s.name}</div>
                          <div className="text-[11px] text-zinc-500 uppercase font-medium">{s.class.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Student Display */}
              {selectedStudent && (
                <div className="bg-amber-50/50 dark:bg-amber-500/5 rounded-xl border border-amber-200/50 dark:border-amber-500/20 p-4 flex items-center justify-between animate-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-zinc-900 dark:text-white">{selectedStudent.name}</div>
                      <div className="text-xs text-amber-600/80 dark:text-amber-400/80 font-medium">
                        {selectedStudent.class?.name || "Unassigned"}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedStudent(null);
                      setSelectedStudentId("");
                      setSearchQuery("");
                    }}
                    className="text-xs text-zinc-400 hover:text-rose-500 font-medium underline px-2 py-1"
                  >
                    Change Student
                  </button>
                </div>
              )}

              {detailsLoading && (
                <div className="flex items-center justify-center py-4 gap-2 text-sm text-zinc-500">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                  Loading financial records...
                </div>
              )}
            </div>
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
