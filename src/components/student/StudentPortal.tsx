"use client"

import React, { useEffect, useState } from "react"
import { DollarSign, AlertCircle, Loader2, Download, Receipt, BookOpen, CheckCircle2, FileText, Wallet } from "lucide-react"
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
  const [screenshot, setScreenshot] = useState<File | null>(null)
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
      const reader = new FileReader()
      reader.readAsDataURL(screenshot)
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1]
        const mimeType = screenshot.type

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
      }
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
      <div className="flex flex-col items-center justify-center py-20 text-indigo-500">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-sm font-medium animate-pulse">Loading securely...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-6 rounded-2xl text-center max-w-lg mx-auto mt-10">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-rose-700 dark:text-rose-400">Unable to load portal</h3>
        <p className="text-sm text-rose-600 dark:text-rose-500 mt-2">{error || "An unknown error occurred"}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-slide-up">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 p-8 shadow-sm">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <BookOpen className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white mb-2">
            Welcome back, {data.profile.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg flex items-center gap-2">
            You are enrolled in <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-0.5 rounded-md">{data.profile.class.name}</span>
          </p>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 p-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-zinc-400 to-zinc-600 opacity-60" />
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
            <DollarSign className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Total Fee Amount</div>
          <div className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white tabular-nums">${data.metrics.totalOwed.toFixed(2)}</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 p-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-600 opacity-60" />
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-4">
            <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Total Paid</div>
          <div className="text-3xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">${data.metrics.totalPaid.toFixed(2)}</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-rose-200 dark:border-rose-500/20 shadow-sm shadow-rose-500/5 p-6 relative overflow-hidden group hover:border-rose-300 dark:hover:border-rose-500/40 transition-colors">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-rose-500 to-orange-500" />
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-4">
            {data.metrics.outstandingDues > 0 ? (
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>
          <div className="text-sm font-bold text-rose-600 dark:text-rose-400 mb-1 uppercase tracking-wider">Outstanding Balance</div>
          <div className={`text-4xl font-black tracking-tight tabular-nums ${data.metrics.outstandingDues > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
            ${data.metrics.outstandingDues.toFixed(2)}
          </div>
        </div>
      </div>

      {/* My Assigned Fees */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden">
        <div className="p-6 border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              My Assigned Fees
            </h3>
            <p className="text-sm text-zinc-500 mt-1">Status of your current academic fees and requirements.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50">
                <th className="h-11 px-6 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Fee Plan</th>
                <th className="h-11 px-6 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Amount</th>
                <th className="h-11 px-6 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Due Date</th>
                <th className="h-11 px-6 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="h-11 px-6 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.assignments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-zinc-500 italic">No assigned fees found.</td>
                </tr>
              ) : (
                data.assignments.map((assignment) => {
                  const latestProof = assignment.proofs[0]
                  const isPaid = assignment.status === "PAID"
                  const hasPendingProof = latestProof?.status === "PENDING"
                  const isRejected = latestProof?.status === "REJECTED"

                  return (
                    <tr key={assignment.id} className="border-b border-zinc-100 dark:border-zinc-800/40 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{assignment.feePlan.name}</span>
                      </td>
                      <td className="px-6 py-4 font-bold tabular-nums">${assignment.feePlan.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-zinc-500">{new Date(assignment.feePlan.dueDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" /> Paid
                          </span>
                        ) : hasPendingProof ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                            <Loader2 className="w-3 h-3 animate-spin" /> Pending Verification
                          </span>
                        ) : isRejected ? (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs font-bold uppercase tracking-wider w-fit">
                              <AlertCircle className="w-3 h-3" /> Rejected
                            </span>
                            {latestProof.rejectionReason && (
                              <p className="text-[10px] text-rose-500 italic max-w-[150px] leading-tight">{latestProof.rejectionReason}</p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
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
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-zinc-200/60 dark:border-zinc-800/60 animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-zinc-100 dark:border-zinc-800/60">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Upload Payment Proof</h2>
              <p className="text-zinc-500 mt-2">Submit a screenshot of your Telebirr or CBE receipt for verification.</p>
            </div>
            
            <form onSubmit={handleUpload} className="p-8 space-y-6">
              {uploadError && (
                <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-4 rounded-xl text-rose-600 dark:text-rose-400 text-sm font-medium flex gap-2 items-center">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {uploadError}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Screenshot / Receipt Image</label>
                <div 
                  className={`mt-1 flex justify-center px-6 pt-10 pb-10 border-2 border-dashed rounded-2xl transition-all ${screenshot ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-500/5" : "border-zinc-300 dark:border-zinc-800 hover:border-indigo-400"}`}
                >
                  <div className="space-y-2 text-center">
                    {!screenshot ? (
                      <>
                        <FileText className="mx-auto h-12 w-12 text-zinc-400" />
                        <div className="flex text-sm text-zinc-600 dark:text-zinc-400">
                          <label className="relative cursor-pointer bg-white dark:bg-zinc-800 rounded-md font-bold text-indigo-600 hover:text-indigo-500 focus-within:outline-none px-2 py-1">
                            <span>Browse files</span>
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
                                setScreenshot(file || null)
                                setUploadError("")
                              }}
                            />
                          </label>
                          <p className="pl-1 py-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-zinc-500 font-medium">PNG, JPG up to 2MB</p>
                      </>
                    ) : (
                      <div className="flex flex-col items-center">
                        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                        <p className="text-sm font-bold text-emerald-600 mt-2">{screenshot.name}</p>
                        <button 
                          type="button" 
                          onClick={() => setScreenshot(null)}
                          className="text-xs text-rose-500 font-bold mt-2 hover:underline"
                        >
                          Remove and change
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Note (Optional)</label>
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Reference number or transaction time..."
                  className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-24"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="flex-1 px-6 py-4 rounded-xl text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting || !screenshot}
                  className="flex-[2] bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl px-6 py-4 text-sm font-black hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
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
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden">
        <div className="p-6 border-b border-zinc-200/60 dark:border-zinc-800/60">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-500" />
            Payment History & Receipts
          </h3>
          <p className="text-sm text-zinc-500 mt-1">Review your past transactions and download official receipts for your records.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50">
                <th className="h-11 px-6 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date</th>
                <th className="h-11 px-6 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Fee Plan</th>
                <th className="h-11 px-6 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Amount</th>
                <th className="h-11 px-6 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="h-11 px-6 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.assignments.flatMap(a => a.payments).length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <Receipt className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
                    <p className="text-sm text-zinc-500">No payment history found.</p>
                  </td>
                </tr>
              ) : (
                data.assignments.flatMap(a => a.payments.map(p => ({ ...p, feePlan: a.feePlan }))).map((p) => (
                  <tr key={p.id} className="border-b border-zinc-100 dark:border-zinc-800/40 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4 text-zinc-500">
                      {new Date(p.paymentDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 font-medium text-zinc-900 dark:text-zinc-100">
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        {p.feePlan.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold tabular-nums text-emerald-600 dark:text-emerald-400">${p.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3" />{p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDownloadReceipt(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
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
