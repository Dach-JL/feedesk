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
      <div className="flex flex-col items-center justify-center py-20 text-primary">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-sm font-medium animate-pulse">Loading verifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-2xl text-center max-w-lg mx-auto">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
        <h3 className="text-lg font-bold text-destructive">Error loading proofs</h3>
        <p className="text-sm text-destructive mt-2">{error}</p>
        <button onClick={fetchProofs} className="mt-4 text-sm font-bold text-destructive underline">Try again</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Pending Verifications
            </h2>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                {proofs.length} Waiting
            </span>
        </div>

        {/* Mobile View: Cards */}
        <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
          {proofs.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 text-muted/60 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground font-medium">All caught up! No pending verifications.</p>
            </div>
          ) : (
            proofs.map((proof) => (
              <div key={proof.id} className="bg-muted/30 rounded-2xl p-4 border border-border/40 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-foreground leading-tight truncate">{proof.studentFeeAssignment.student.name}</div>
                      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">{proof.studentFeeAssignment.student.class.name}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-primary tabular-nums">${proof.studentFeeAssignment.feePlan.amount.toFixed(2)}</div>
                    <div className="text-[10px] text-muted-foreground font-bold mt-0.5">{new Date(proof.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 truncate">
                        <CreditCard className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{proof.studentFeeAssignment.feePlan.name}</span>
                    </div>
                    <button 
                      onClick={() => handleViewProof(proof.id)}
                      className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-black bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-md"
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
              <tr className="border-b border-border bg-muted/30">
                <th className="h-12 px-6 text-left text-[11px] font-black text-muted-foreground uppercase tracking-widest">Submitted Date</th>
                <th className="h-12 px-6 text-left text-[11px] font-black text-muted-foreground uppercase tracking-widest">Student</th>
                <th className="h-12 px-6 text-left text-[11px] font-black text-muted-foreground uppercase tracking-widest">Fee Plan</th>
                <th className="h-12 px-6 text-left text-[11px] font-black text-muted-foreground uppercase tracking-widest">Amount</th>
                <th className="h-12 px-6 text-right text-[11px] font-black text-muted-foreground uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {proofs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center">
                    <CheckCircle2 className="w-12 h-12 text-muted/60 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground font-medium">No pending verifications at the moment.</p>
                  </td>
                </tr>
              ) : (
                proofs.map((proof) => (
                  <tr key={proof.id} className="border-b border-border/40 hover:bg-muted/50 transition-colors group">
                    <td className="px-6 py-5 text-muted-foreground font-medium text-xs">
                        {new Date(proof.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 flex-shrink-0">
                          <span className="text-xs font-black text-primary uppercase">{proof.studentFeeAssignment.student.name.charAt(0)}</span>
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-foreground leading-tight truncate">{proof.studentFeeAssignment.student.name}</p>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">{proof.studentFeeAssignment.student.class.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-1.5 font-bold text-foreground/80">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground" />
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
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-lg shadow-primary/10 hover:scale-[1.02] active:scale-[0.98]"
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
        <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center p-0 lg:p-6 bg-background/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-card shadow-2xl w-full h-[92vh] lg:h-auto lg:max-h-[85vh] lg:max-w-5xl rounded-t-[2rem] lg:rounded-3xl overflow-hidden flex flex-col lg:flex-row animate-in slide-in-from-bottom-5 lg:slide-in-from-bottom-0 lg:zoom-in-95 duration-300 border-t border-border lg:border relative">
            
            {/* Image Preview Area */}
            <div className="h-[45vh] lg:h-auto lg:flex-1 bg-black/20 p-4 lg:p-8 flex items-center justify-center relative shadow-inner">
              <div className="absolute inset-0 bg-primary/10 opacity-30" />
              <Image 
                src={selectedProof.screenshotUrl} 
                width={1200}
                height={800}
                unoptimized
                className="max-w-full max-h-full object-contain rounded-xl lg:rounded-2xl shadow-2xl relative z-10" 
                alt="Payment Screenshot" 
              />
              {/* Mobile Close Button */}
              <button 
                onClick={() => setSelectedProof(null)}
                className="absolute top-4 right-4 z-20 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-white transition-all lg:hidden shadow-xl"
              >
                <X className="w-6 h-6" />
              </button>
              <a 
                href={selectedProof.screenshotUrl} 
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-4 right-4 lg:bottom-10 lg:right-10 z-20 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-[10px] lg:text-xs font-bold flex items-center gap-2 transition-all border border-white/10"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Full View
              </a>
            </div>

            {/* Review Sidebar */}
            <div className="flex-1 lg:w-[400px] bg-card p-6 lg:p-8 flex flex-col h-auto lg:h-full overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg lg:text-xl font-black text-foreground uppercase tracking-tight">Review Details</h3>
                <button 
                  onClick={() => setSelectedProof(null)}
                  className="hidden lg:flex w-10 h-10 rounded-full bg-muted hover:bg-destructive/10 hover:text-destructive items-center justify-center text-muted-foreground transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5 lg:space-y-6 flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0">
                <div className="bg-muted/50 p-4 rounded-2xl space-y-4 border border-border">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-xs lg:text-base uppercase">
                        {selectedProof.studentFeeAssignment.student.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-foreground leading-tight truncate">{selectedProof.studentFeeAssignment.student.name}</p>
                        <p className="text-[10px] lg:text-xs text-muted-foreground font-bold uppercase tracking-wider truncate">{selectedProof.studentFeeAssignment.student.class?.name || "Unassigned"}</p>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Fee Type</p>
                        <p className="text-[11px] lg:text-xs font-bold text-foreground truncate">{selectedProof.studentFeeAssignment.feePlan.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Amount Due</p>
                        <p className="text-base lg:text-sm font-black text-emerald-600 tabular-nums">${selectedProof.studentFeeAssignment.feePlan.amount.toFixed(2)}</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] lg:text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">Decision Note</label>
                  <textarea 
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide a reason if rejecting..."
                    className="w-full bg-muted/80 border border-border rounded-2xl p-4 text-sm focus:ring-2 focus:ring-ring outline-none transition-all h-24 lg:h-32 resize-none leading-relaxed"
                  />
                </div>
              </div>

              <div className="pt-6 grid grid-cols-2 gap-3 mt-auto shrink-0">
                <button 
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 h-12 lg:h-14 rounded-2xl border border-destructive/20 text-destructive font-bold text-xs lg:text-sm hover:bg-destructive/10 transition-all disabled:opacity-40"
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
