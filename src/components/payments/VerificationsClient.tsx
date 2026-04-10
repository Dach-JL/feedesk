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
    if (!selectedProof || !rejectionReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }

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
    } catch {
      alert("An error occurred");
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
      {proofs.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 p-16 text-center">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">All caught up!</h3>
          <p className="text-zinc-500 mt-2">There are no pending payment proofs to verify right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proofs.map((proof) => (
            <div key={proof.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 p-6 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                <CreditCard className="w-24 h-24" />
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-white leading-tight">{proof.studentFeeAssignment.student.name}</h4>
                  <p className="text-xs text-zinc-500 font-medium lowercase">{proof.studentFeeAssignment.student.class.name}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-zinc-400" />
                  <span className="text-zinc-600 dark:text-zinc-300 font-semibold">{proof.studentFeeAssignment.feePlan.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="w-4 h-4 text-zinc-400" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-black tabular-nums">${proof.studentFeeAssignment.feePlan.amount.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <span className="text-zinc-500 italic">{new Date(proof.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {proof.note && (
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 mb-6 border border-zinc-100 dark:border-zinc-800/40">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 italic">&quot;{proof.note}&quot;</p>
                </div>
              )}

              <button 
                onClick={() => handleViewProof(proof.id)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-bold text-sm hover:opacity-90 transition-all border border-transparent shadow-lg shadow-zinc-950/10 dark:shadow-none"
              >
                Review Proof <Eye className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Review Modal */}
      {selectedProof && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-10 bg-zinc-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl w-full max-w-6xl h-auto max-h-[85vh] overflow-hidden flex flex-col lg:flex-row animate-in zoom-in-95 duration-300 border border-white/10">
            
            {/* Image Preview Area */}
            <div className="flex-1 bg-black/20 dark:bg-black/40 p-4 lg:p-8 flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-30" />
              <Image 
                src={selectedProof.screenshotUrl} 
                width={1200}
                height={800}
                unoptimized
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl relative z-10 hover:scale-[1.02] transition-transform duration-500" 
                alt="Payment Screenshot" 
              />
              <button 
                onClick={() => setSelectedProof(null)}
                className="absolute top-6 left-6 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all hover:scale-110 lg:hidden"
              >
                <X className="w-6 h-6" />
              </button>
              <a 
                href={selectedProof.screenshotUrl} 
                download={`Proof_${selectedProof.studentFeeAssignment.student.name}_${selectedProof.id}.png`}
                className="absolute bottom-10 right-10 z-20 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open Full Image
              </a>
            </div>

            {/* Review Sidebar */}
            <div className="w-full lg:w-[420px] bg-white dark:bg-zinc-900 p-8 flex flex-col border-l border-zinc-100 dark:border-zinc-800 h-full overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Review Details</h3>
                <button 
                  onClick={() => setSelectedProof(null)}
                  className="hidden lg:flex w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 items-center justify-center text-zinc-500 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                <div className="bg-zinc-50 dark:bg-zinc-800/40 p-5 rounded-2xl space-y-4 border border-zinc-100 dark:border-zinc-800">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black">
                        {selectedProof.studentFeeAssignment.student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-zinc-900 dark:text-white leading-tight">{selectedProof.studentFeeAssignment.student.name}</p>
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{selectedProof.studentFeeAssignment.student.class?.name || "Unassigned Class"}</p>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60">
                      <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase">Fee Type</p>
                        <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{selectedProof.studentFeeAssignment.feePlan.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase">Amount Düe</p>
                        <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">${selectedProof.studentFeeAssignment.feePlan.amount.toFixed(2)}</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest pl-1">Decision Note</label>
                  <textarea 
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide a reason if rejecting (e.g., 'Wrong screenshot' or 'Amount mismatch')..."
                    className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-32 resize-none leading-relaxed"
                  />
                </div>
              </div>

              <div className="pt-8 grid grid-cols-2 gap-4">
                <button 
                  onClick={handleReject}
                  disabled={isSubmitting || !rejectionReason.trim()}
                  className="flex items-center justify-center gap-2 h-14 rounded-2xl border-2 border-rose-500/20 text-rose-500 font-black text-sm hover:bg-rose-500/10 transition-all disabled:opacity-40"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-5 h-5" />}
                  Reject
                </button>
                <button 
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 h-14 rounded-2xl bg-emerald-500 text-white font-black text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-40"
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
