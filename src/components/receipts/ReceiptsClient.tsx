"use client";

import React, { useEffect, useState } from "react";
import { Search, Download, FileText, CheckCircle2, Receipt } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type PaymentData = {
  id: string; amount: number; paymentDate: string; status: string;
  feePlan: { name: string }; student: { name: string; classId: string };
};

export default function ReceiptsClient() {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/payments").then(res => res.json()).then(data => { if (Array.isArray(data)) setPayments(data); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleDownloadReceipt = (payment: PaymentData) => {
    const doc = new jsPDF();
    doc.setFontSize(22); doc.setTextColor(30, 58, 138);
    doc.text("Official FeeDesk Receipt", 14, 22);
    doc.setFontSize(10); doc.setTextColor(100, 116, 139);
    doc.text(`Receipt ID: ${payment.id.toUpperCase()}`, 14, 30);
    doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, 14, 35);
    doc.setDrawColor(226, 232, 240); doc.line(14, 40, 196, 40);

    autoTable(doc, {
      startY: 45,
      body: [
        ["Student Name:", payment.student.name],
        ["Transaction Date:", new Date(payment.paymentDate).toLocaleString()],
        ["Fee Plan:", payment.feePlan.name],
        ["Payment Status:", payment.status],
      ],
      theme: 'plain',
      styles: { fontSize: 12, cellPadding: 4 },
      columnStyles: { 0: { fontStyle: 'bold', textColor: [71, 85, 105], cellWidth: 50 } }
    });

    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 100;
    doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.5); doc.line(14, finalY + 10, 196, finalY + 10);
    doc.setFontSize(14); doc.setTextColor(15, 23, 42); doc.text("Total Paid:", 130, finalY + 22);
    doc.setFontSize(20); doc.setTextColor(16, 185, 129); doc.text(`$${payment.amount.toFixed(2)}`, 165, finalY + 23);
    doc.setFontSize(10); doc.setTextColor(148, 163, 184);
    doc.text("Thank you for your payment. This is an automatically generated receipt.", 14, 280);
    doc.save(`Receipt_${payment.student.name.replace(/\s+/g, '_')}_${new Date(payment.paymentDate).toISOString().split('T')[0]}.pdf`);
  };

  const filteredPayments = payments.filter((p) =>
    p.student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.feePlan.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden">
        <div className="p-4 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input type="text" placeholder="Search by student, ID, or fee plan..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-1 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-colors" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200/60 dark:border-zinc-800/60">
                <th className="h-11 px-6 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date</th>
                <th className="h-11 px-6 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Student</th>
                <th className="h-11 px-6 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Fee Plan</th>
                <th className="h-11 px-6 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Amount</th>
                <th className="h-11 px-6 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="h-11 px-6 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800/40 animate-pulse">
                    {[32, 24, 28, 16, 20, 20].map((w, j) => (
                      <td key={j} className="p-4 px-6"><div className={`h-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-${w}`} /></td>
                    ))}
                  </tr>
                ))
              ) : filteredPayments.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center">
                  <Receipt className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
                  <p className="text-sm text-zinc-500">No transactions found.</p>
                </td></tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="border-b border-zinc-100 dark:border-zinc-800/40 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4 text-zinc-500">
                      {new Date(p.paymentDate).toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-fuchsia-50 dark:bg-fuchsia-500/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-fuchsia-600 dark:text-fuchsia-400 uppercase">{p.student.name.charAt(0)}</span>
                        </div>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">{p.student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-500">
                      <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 opacity-50" />{p.feePlan.name}</span>
                    </td>
                    <td className="px-6 py-4 font-bold tabular-nums text-emerald-600 dark:text-emerald-400">${p.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3" />{p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDownloadReceipt(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-500/10 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-500/20 transition-colors">
                        <Download className="h-3.5 w-3.5" /> PDF
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
  );
}
