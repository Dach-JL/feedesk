"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { 
  CheckCircle2, XCircle, Eye, Clock, User, 
  CreditCard, Loader2, AlertCircle, 
  FileText, ExternalLink, X
} from "lucide-react";

type ProofData = {
  id: string;
  status: string;
  note: string | null;
  createdAt: string;
  studentFeeAssignment: {
    id: string;
    student: {
      name: string;
      class: { name: string };
    };
    feePlan: {
      name: string;
      amount: number;
    };
  };
};

type FullProofData = ProofData & {
  screenshotUrl: string;
};

export default function VerificationsClient() {
  const [proofs, setProofs] = useState<ProofData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Lightbox & Review State
  const [selectedProof, setSelectedProof] = useState<FullProofData | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProofs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/payment-proofs");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch proofs");
      setProofs(data);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProofs();
  }, []);

  const handleViewProof = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/payment-proofs/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch details");
      setSelectedProof(data);
      setRejectionReason("");
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
      else alert("An unknown error occurred");
    }
  };

  const handleApprove = async () => {
    if (!selectedProof) return;
    if (!confirm("Are you sure you want to approve this payment? This will record a completion transaction.")) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/approve-proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proofId: selectedProof.id }),
      });
      if (res.ok) {
        setSelectedProof(null);
        fetchProofs();
      } else {
        const data = await res.json();
        alert(data.error || "Approval failed");
      }
    } catch {
      alert("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedProof) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/reject-proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          proofId: selectedProof.id, 
          reason: rejectionReason 
        }),
      });
      if (res.ok) {
        setSelectedProof(null);
        fetchProofs();
      } else {
        const data = await res.json();
        alert(data.error || "Rejection failed");
      }
    } catch (err: unknown) {
      console.error("Rejection error:", err);
      alert(err instanceof Error ? err.message : "An error occurred during rejection");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-indigo-500">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-sm font-medium animate-pulse">Loading verifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-6 rounded-2xl text-center max-w-lg mx-auto">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-rose-700 dark:text-rose-400">Error loading proofs</h3>
        <p className="text-sm text-rose-600 dark:text-rose-500 mt-2">{error}</p>
        <button onClick={fetchProofs} className="mt-4 text-sm font-bold text-rose-700 underline">Try again</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" />
                Pending Verifications
            </h2>
            <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
                {proofs.length} Waiting
            </span>
        </div>

        {/* Mobile View: Cards */}
        <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
          {proofs.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
              <p className="text-sm text-zinc-500 font-medium">All caught up! No pending verifications.</p>
            </div>
          ) : (
            proofs.map((proof) => (
              <div key={proof.id} className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-5 border border-zinc-100 dark:border-zinc-800/40 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{proof.studentFeeAssignment.student.name}</div>
                      <div className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider mt-0.5">{proof.studentFeeAssignment.student.class.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-indigo-600 dark:text-indigo-400 tabular-nums">${proof.studentFeeAssignment.feePlan.amount.toFixed(2)}</div>
                    <div className="text-[10px] text-zinc-400 font-bold mt-0.5">{new Date(proof.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-200/40 dark:border-zinc-800/40 flex items-center justify-between">
                    <div className="text-[11px] font-bold text-zinc-500 uppercase flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5" />
                        {proof.studentFeeAssignment.feePlan.name}
                    </div>
                    <button 
                      onClick={() => handleViewProof(proof.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 transition-all shadow-lg shadow-zinc-500/10"
                    >
                      <Eye className="w-3.5 h-3.5" /> Review
                    </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50">
                <th className="h-12 px-6 text-left text-[11px] font-black text-zinc-500 uppercase tracking-widest">Submitted Date</th>
                <th className="h-12 px-6 text-left text-[11px] font-black text-zinc-500 uppercase tracking-widest">Student</th>
                <th className="h-12 px-6 text-left text-[11px] font-black text-zinc-500 uppercase tracking-widest">Fee Plan</th>
                <th className="h-12 px-6 text-left text-[11px] font-black text-zinc-500 uppercase tracking-widest">Amount</th>
                <th className="h-12 px-6 text-right text-[11px] font-black text-zinc-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {proofs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center">
                    <CheckCircle2 className="w-12 h-12 text-zinc-200 dark:text-zinc-800 mx-auto mb-4" />
                    <p className="text-sm text-zinc-500 font-medium">No pending verifications at the moment.</p>
                  </td>
                </tr>
              ) : (
                proofs.map((proof) => (
                  <tr key={proof.id} className="border-b border-zinc-50 dark:border-zinc-800/40 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors group">
                    <td className="px-6 py-5 text-zinc-500 font-medium text-xs">
                        {new Date(proof.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center border border-indigo-100/50 dark:border-indigo-500/10 flex-shrink-0">
                          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase">{proof.studentFeeAssignment.student.name.charAt(0)}</span>
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-zinc-900 dark:text-white leading-tight truncate">{proof.studentFeeAssignment.student.name}</p>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">{proof.studentFeeAssignment.student.class.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-1.5 font-bold text-zinc-700 dark:text-zinc-300">
                        <FileText className="w-3.5 h-3.5 text-zinc-400" />
                        {proof.studentFeeAssignment.feePlan.name}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                            ${proof.studentFeeAssignment.feePlan.amount.toFixed(2)}
                        </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => handleViewProof(proof.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 transition-all shadow-lg shadow-zinc-500/5 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Eye className="w-3.5 h-3.5" /> Review Proof
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Lightbox / Review Modal */}
      {selectedProof && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 lg:p-10 bg-zinc-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 shadow-2xl w-full h-full lg:h-auto lg:max-h-[85vh] lg:max-w-6xl lg:rounded-[2.5rem] overflow-hidden flex flex-col lg:flex-row animate-in zoom-in-95 duration-300 border-none lg:border lg:border-white/10 relative">
            
            {/* Image Preview Area */}
            <div className="h-[40vh] lg:h-auto lg:flex-1 bg-black/20 dark:bg-black/40 p-4 lg:p-8 flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-30" />
              <Image 
                src={selectedProof.screenshotUrl} 
                width={1200}
                height={800}
                unoptimized
                className="max-w-full max-h-full object-contain rounded-xl lg:rounded-2xl shadow-2xl relative z-10 hover:scale-[1.02] transition-transform duration-500" 
                alt="Payment Screenshot" 
              />
              <button 
                onClick={() => setSelectedProof(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md flex items-center justify-center text-white transition-all lg:hidden"
              >
                <X className="w-5 h-5" />
              </button>
              <a 
                href={selectedProof.screenshotUrl} 
                download={`Proof_${selectedProof.studentFeeAssignment.student.name}_${selectedProof.id}.png`}
                className="absolute bottom-4 right-4 lg:bottom-10 lg:right-10 z-20 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-[10px] lg:text-xs font-bold flex items-center gap-2 transition-all"
              >
                <ExternalLink className="w-3 h-3 lg:w-3.5 lg:h-3.5" /> Open Full Image
              </a>
            </div>

            {/* Review Sidebar */}
            <div className="flex-1 lg:w-[420px] bg-white dark:bg-zinc-900 p-6 lg:p-8 flex flex-col border-t lg:border-t-0 lg:border-l border-zinc-100 dark:border-zinc-800 h-auto lg:h-full overflow-hidden">
              <div className="flex items-center justify-between mb-6 lg:mb-8">
                <h3 className="text-lg lg:text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Review Details</h3>
                <button 
                  onClick={() => setSelectedProof(null)}
                  className="hidden lg:flex w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 items-center justify-center text-zinc-500 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5 lg:space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                <div className="bg-zinc-50 dark:bg-zinc-800/40 p-4 lg:p-5 rounded-2xl space-y-4 border border-zinc-100 dark:border-zinc-800">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs lg:text-base uppercase">
                        {selectedProof.studentFeeAssignment.student.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-zinc-900 dark:text-white leading-tight truncate">{selectedProof.studentFeeAssignment.student.name}</p>
                        <p className="text-[10px] lg:text-xs text-zinc-500 font-bold uppercase tracking-wider truncate">{selectedProof.studentFeeAssignment.student.class?.name || "Unassigned"}</p>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Fee Type</p>
                        <p className="text-[11px] lg:text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{selectedProof.studentFeeAssignment.feePlan.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Amount Düe</p>
                        <p className="text-base lg:text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums">${selectedProof.studentFeeAssignment.feePlan.amount.toFixed(2)}</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-2 lg:space-y-3">
                  <label className="text-[10px] lg:text-xs font-black text-zinc-500 uppercase tracking-widest pl-1">Decision Note</label>
                  <textarea 
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide a reason if rejecting..."
                    className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-24 lg:h-32 resize-none leading-relaxed"
                  />
                </div>
              </div>

              <div className="pt-6 lg:pt-8 grid grid-cols-2 gap-4 mt-auto">
                <button 
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 h-12 lg:h-14 rounded-2xl border-2 border-rose-500/20 text-rose-500 font-black text-xs lg:text-sm hover:bg-rose-500/10 transition-all disabled:opacity-40"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-5 h-5" />}
                  Reject
                </button>
                <button 
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 h-12 lg:h-14 rounded-2xl bg-emerald-500 text-white font-black text-xs lg:text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-40"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
