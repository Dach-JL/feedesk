"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { DollarSign, AlertCircle, Loader2, Download, Receipt, BookOpen, CheckCircle2, FileText, Wallet, X } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

type PortalData = {
  profile: { name: string; email: string; classId: string; class: { name: string } }
  assignments: {
    id: string;
    status: string;
    feePlan: { id: string; name: string; amount: number; dueDate: string };
    payments: { id: string; amount: number; paymentDate: string; status: string }[];
    proofs: { id: string; status: string; note: string | null; rejectionReason: string | null; createdAt: string }[];
  }[]
  metrics: { totalOwed: number; totalPaid: number; outstandingDues: number }
}

type FlattenedPayment = PortalData["assignments"][0]["payments"][0] & { feePlan: { name: string } };

export default function StudentPortal() {
  const [data, setData] = useState<PortalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [uploadingAssignmentId, setUploadingAssignmentId] = useState<string | null>(null)
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [note, setNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadError, setUploadError] = useState("")

  const refreshData = () => {
    setLoading(true)
    fetch("/api/student/profile")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch student data")
        return res.json()
      })
      .then((json) => setData(json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    refreshData()
  }, [])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadingAssignmentId || !screenshot) {
      setUploadError("Please select a screenshot.")
      return
    }

    setIsSubmitting(true)
    setUploadError("")

    try {
      // Extract base64 and mimeType from the data URL
      const mimeType = screenshot.split(";")[0].split(":")[1]
      const base64 = screenshot.split(",")[1]

      const res = await fetch("/api/student/upload-proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentFeeAssignmentId: uploadingAssignmentId,
          screenshotBase64: base64,
          mimeType,
          note
        })
      })

      const result = await res.json()

      if (!res.ok) {
        setUploadError(result.error || "Failed to upload proof")
      } else {
          // Success
          setIsUploadModalOpen(false)
          setScreenshot(null)
          setNote("")
          setUploadingAssignmentId(null)
          refreshData()
        }
        setIsSubmitting(false)
      } catch (err) {
        console.error(err)
        setUploadError("An unexpected error occurred.")
        setIsSubmitting(false)
      }
  }

  const handleDownloadReceipt = (payment: FlattenedPayment) => {
    if (!data) return

    const doc = new jsPDF()
    doc.setFontSize(22)
    doc.setTextColor(30, 58, 138)
    doc.text("Official FeeDesk Receipt", 14, 22)
    
    doc.setFontSize(10)
    doc.setTextColor(100, 116, 139)
    doc.text(`Receipt ID: ${payment.id.toUpperCase()}`, 14, 30)
    doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, 14, 35)
    
    doc.setDrawColor(226, 232, 240)
    doc.line(14, 40, 196, 40)

    autoTable(doc, {
      startY: 45,
      body: [
        ["Student Name:", data.profile.name],
        ["Class Enrolled:", data.profile.class.name],
        ["Transaction Date:", new Date(payment.paymentDate).toLocaleString()],
        ["Fee Plan Covered:", payment.feePlan.name],
        ["Status:", payment.status],
      ],
      theme: 'plain',
      styles: { fontSize: 12, cellPadding: 4 },
      columnStyles: { 0: { fontStyle: 'bold', textColor: [71, 85, 105], cellWidth: 50 } }
    })

    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 100
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.5)
    doc.line(14, finalY + 10, 196, finalY + 10)
    
    doc.setFontSize(14)
    doc.setTextColor(15, 23, 42)
    doc.text("Amount Paid:", 130, finalY + 22)
    
    doc.setFontSize(20)
    doc.setTextColor(16, 185, 129) // Emerald
    doc.text(`$${payment.amount.toFixed(2)}`, 165, finalY + 23)
    
    doc.setFontSize(10)
    doc.setTextColor(148, 163, 184)
    doc.text("Thank you. Please keep this receipt for your records.", 14, 280)
    
    doc.save(`Receipt_${payment.feePlan.name.replace(/\s+/g, '_')}_${new Date(payment.paymentDate).toISOString().split('T')[0]}.pdf`)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-primary">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-sm font-medium animate-pulse">Loading securely...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-2xl text-center max-w-lg mx-auto mt-10">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
        <h3 className="text-lg font-bold text-destructive">Unable to load portal</h3>
        <p className="text-sm text-destructive mt-2">{error || "An unknown error occurred"}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-slide-up">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-card rounded-2xl border border-border p-8 shadow-sm">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <BookOpen className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight text-foreground mb-2">
            Welcome back, {data.profile.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-muted-foreground text-lg flex items-center gap-2">
            You are enrolled in <span className="font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md">{data.profile.class.name}</span>
          </p>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-card rounded-2xl border border-border p-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-muted-foreground/40 to-muted-foreground/60 opacity-60" />
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-4">
            <DollarSign className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="text-sm font-medium text-muted-foreground mb-1">Total Fee Amount</div>
          <div className="text-3xl font-black tracking-tight text-foreground tabular-nums">${data.metrics.totalOwed.toFixed(2)}</div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-600 opacity-60" />
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
            <Wallet className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-sm font-medium text-muted-foreground mb-1">Total Paid</div>
          <div className="text-3xl font-black tracking-tight text-emerald-600 tabular-nums">${data.metrics.totalPaid.toFixed(2)}</div>
        </div>

        <div className="bg-card rounded-2xl border border-destructive/20 shadow-sm shadow-destructive/5 p-6 relative overflow-hidden group hover:border-destructive transition-colors">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-destructive to-orange-500" />
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
            {data.metrics.outstandingDues > 0 ? (
              <AlertCircle className="w-5 h-5 text-destructive" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            )}
          </div>
          <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Outstanding Balance</div>
          <div className={`text-4xl font-black tracking-tight tabular-nums ${data.metrics.outstandingDues > 0 ? "text-destructive" : "text-emerald-600"}`}>
            ${data.metrics.outstandingDues.toFixed(2)}
          </div>
        </div>
      </div>

      {/* My Assigned Fees */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              My Assigned Fees
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Status of your current academic fees and requirements.</p>
          </div>
        </div>

        {/* Mobile View: Assigned Fees Cards */}
        <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
          {data.assignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground italic">No assigned fees found.</div>
          ) : (
            data.assignments.map((assignment) => {
              const latestProof = assignment.proofs[0]
              const isPaid = assignment.status === "PAID"
              const hasPendingProof = latestProof?.status === "PENDING"
              const isRejected = latestProof?.status === "REJECTED"

              return (
                <div key={assignment.id} className="bg-muted/30 rounded-2xl p-4 border border-border/40 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-foreground text-base">{assignment.feePlan.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Due {new Date(assignment.feePlan.dueDate).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-foreground tabular-nums">${assignment.feePlan.amount.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div>
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </span>
                      ) : hasPendingProof ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 text-[10px] font-bold uppercase">
                          <Loader2 className="w-3 h-3 animate-spin" /> Pending
                        </span>
                      ) : isRejected ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-destructive/10 text-destructive text-[10px] font-bold uppercase">
                          <AlertCircle className="w-3 h-3" /> Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-muted-foreground text-[10px] font-bold uppercase">
                          Payment Due
                        </span>
                      )}
                    </div>

                    {!isPaid && !hasPendingProof && (
                      <button
                        onClick={() => {
                          setUploadingAssignmentId(assignment.id)
                          setIsUploadModalOpen(true)
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/10"
                      >
                        <Download className="w-3 h-3 rotate-180" /> Upload Proof
                      </button>
                    )}
                  </div>
                  
                  {isRejected && latestProof.rejectionReason && (
                    <div className="mt-2 p-3 bg-destructive/5 rounded-xl border border-destructive/10">
                      <p className="text-[10px] text-destructive leading-tight">
                        <span className="font-bold uppercase tracking-tighter mr-1">Reason:</span>
                        {latestProof.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="h-11 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fee Plan</th>
                <th className="h-11 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="h-11 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Due Date</th>
                <th className="h-11 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="h-11 px-6 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.assignments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground italic">No assigned fees found.</td>
                </tr>
              ) : (
                data.assignments.map((assignment) => {
                  const latestProof = assignment.proofs[0]
                  const isPaid = assignment.status === "PAID"
                  const hasPendingProof = latestProof?.status === "PENDING"
                  const isRejected = latestProof?.status === "REJECTED"

                  return (
                    <tr key={assignment.id} className="border-b border-border/40 hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-foreground">{assignment.feePlan.name}</span>
                      </td>
                      <td className="px-6 py-4 font-bold tabular-nums">${assignment.feePlan.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-muted-foreground">{new Date(assignment.feePlan.dueDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 text-xs font-bold uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" /> Paid
                          </span>
                        ) : hasPendingProof ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-500/10 text-amber-600 text-xs font-bold uppercase tracking-wider">
                            <Loader2 className="w-3 h-3 animate-spin" /> Pending Verification
                          </span>
                        ) : isRejected ? (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-destructive/10 text-destructive text-xs font-bold uppercase tracking-wider w-fit">
                              <AlertCircle className="w-3 h-3" /> Rejected
                            </span>
                            {latestProof.rejectionReason && (
                              <p className="text-[10px] text-destructive italic max-w-[150px] leading-tight">{latestProof.rejectionReason}</p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted text-muted-foreground text-xs font-bold uppercase tracking-wider">
                            Pending Payment
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isPaid && !hasPendingProof && (
                          <button
                            onClick={() => {
                              setUploadingAssignmentId(assignment.id)
                              setIsUploadModalOpen(true)
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all"
                          >
                            <Download className="w-3.5 h-3.5 rotate-180" /> {isRejected ? "Re-upload Proof" : "Upload Proof"}
                          </button>
                        )}
                        {isPaid && (
                          <span className="text-emerald-500 font-bold text-xs">Requirement Met ✅</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-card rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-border animate-in zoom-in-95 duration-300 max-h-[85vh] flex flex-col">
            <div className="p-8 border-b border-border">
              <h2 className="text-2xl font-black text-foreground">Upload Payment Proof</h2>
              <p className="text-muted-foreground mt-2">Submit a screenshot of your Telebirr or CBE receipt for verification.</p>
            </div>
            
            <form onSubmit={handleUpload} className="p-6 lg:p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar min-h-0">
              {uploadError && (
                <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl text-destructive text-sm font-medium flex gap-2 items-center">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {uploadError}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Screenshot / Receipt Image</label>
                <div 
                  className={`mt-1 flex justify-center px-6 pt-10 pb-10 border-2 border-dashed rounded-2xl transition-all ${screenshot ? "border-emerald-500 bg-emerald-500/5" : "border-muted-foreground/30 hover:border-primary"}`}
                >
                  <div className="space-y-4 text-center">
                    {!screenshot ? (
                      <>
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto ring-4 ring-muted">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="flex flex-col items-center text-sm text-muted-foreground">
                          <label className="relative cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold hover:opacity-90 transition-all focus-within:outline-none">
                            <span>Browse Device</span>
                            <input 
                              type="file" 
                              className="sr-only" 
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file && file.size > 2 * 1024 * 1024) {
                                  setUploadError("Image too large. Max size is 2MB.")
                                  return
                                }
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => setScreenshot(reader.result as string);
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                          <p className="mt-3 text-xs opacity-60 italic">PNG, JPG, up to 2MB</p>
                        </div>
                      </>
                    ) : (
                      <div className="relative group mx-auto">
                        <Image 
                          src={screenshot} 
                          alt="Preview" 
                          width={240}
                          height={240}
                          unoptimized
                          className="max-h-56 rounded-xl shadow-xl object-contain border-4 border-card" 
                        />
                        <button 
                          onClick={() => setScreenshot(null)}
                          className="absolute -top-3 -right-3 bg-destructive text-destructive-foreground rounded-full p-2 shadow-xl hover:scale-110 active:scale-95 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Notes (Optional)</label>
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Reference number or transaction time..."
                  className="w-full bg-muted/50 border border-border rounded-2xl p-4 text-sm focus:ring-2 focus:ring-ring outline-none transition-all h-28 resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 pb-2">
                <button 
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="flex-1 px-6 py-4 rounded-2xl text-sm font-bold text-muted-foreground hover:bg-muted transition-colors order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting || !screenshot}
                  className="flex-[2] bg-primary text-primary-foreground rounded-2xl px-6 py-4 text-sm font-black hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/10 order-1 sm:order-2"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</>
                  ) : (
                    "Submit Verification"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            Payment History & Receipts
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Review your past transactions and download official receipts for your records.</p>
        </div>

        {/* Mobile View: History Cards */}
        <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
          {data.assignments.flatMap(a => a.payments).length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="w-10 h-10 text-muted/60 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No payment history found.</p>
            </div>
          ) : (
            data.assignments.flatMap(a => a.payments.map(p => ({ ...p, feePlan: a.feePlan }))).map((p) => (
              <div key={p.id} className="bg-muted/30 rounded-2xl p-4 border border-border/40 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      {p.feePlan.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{new Date(p.paymentDate).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-emerald-600 tabular-nums">${p.amount.toFixed(2)}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-600 uppercase tracking-tighter">
                    <CheckCircle2 className="w-3 h-3" />{p.status}
                  </span>
                  <button 
                    onClick={() => handleDownloadReceipt(p)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-primary bg-primary/10"
                  >
                    <Download className="h-3 w-3" /> Receipt
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
                <th className="h-11 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="h-11 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fee Plan</th>
                <th className="h-11 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="h-11 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="h-11 px-6 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.assignments.flatMap(a => a.payments).length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <Receipt className="w-10 h-10 text-muted/60 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No payment history found.</p>
                  </td>
                </tr>
              ) : (
                data.assignments.flatMap(a => a.payments.map(p => ({ ...p, feePlan: a.feePlan }))).map((p) => (
                  <tr key={p.id} className="border-b border-border/40 hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(p.paymentDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 font-medium text-foreground">
                        <FileText className="w-3.5 h-3.5 text-primary" />
                        {p.feePlan.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold tabular-nums text-emerald-600">${p.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600">
                        <CheckCircle2 className="w-3 h-3" />{p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDownloadReceipt(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" /> Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
