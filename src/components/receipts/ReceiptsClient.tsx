"use client";

import React, { useEffect, useState } from "react";
import { History, Search, Download, FileText, CheckCircle2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type PaymentData = {
  id: string;
  amount: number;
  paymentDate: string;
  status: string;
  feePlan: { name: string };
  student: { name: string; classId: string };
};

export default function ReceiptsClient() {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/payments")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPayments(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadReceipt = (payment: PaymentData) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(30, 58, 138); // Blue 900
    doc.text("Official FeeDesk Receipt", 14, 22);
    
    // Sub Header
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text(`Receipt ID: ${payment.id.toUpperCase()}`, 14, 30);
    doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, 14, 35);
    
    // Draw line
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.line(14, 40, 196, 40);
    
    // Content Data
    const tableData = [
      ["Student Name:", payment.student.name],
      ["Transaction Date:", new Date(payment.paymentDate).toLocaleString()],
      ["Mapping (Fee Plan):", payment.feePlan.name],
      ["Payment Status:", payment.status],
    ];

    autoTable(doc, {
      startY: 45,
      body: tableData,
      theme: 'plain',
      styles: { fontSize: 12, cellPadding: 4 },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [71, 85, 105], cellWidth: 50 }
      }
    });

    // Total Block
    const finalY = (doc as any).lastAutoTable.finalY || 100;
    
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, finalY + 10, 196, finalY + 10);
    
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.text("Total Paid:", 130, finalY + 22);
    
    doc.setFontSize(20);
    doc.setTextColor(16, 185, 129); // Emerald 500
    doc.text(`$${payment.amount.toFixed(2)}`, 165, finalY + 23);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text("Thank you or your payment. This is an automatically generated receipt.", 14, 280);

    // Download
    doc.save(`Receipt_${payment.student.name.replace(/\s+/g, '_')}_${new Date(payment.paymentDate).toISOString().split('T')[0]}.pdf`);
  };

  const filteredPayments = payments.filter((p) =>
    p.student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.feePlan.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <History className="h-6 w-6 text-fuchsia-500" />
            Transaction History & Receipts
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            View all logged payments securely and instantly generate PDF receipts.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by student, ID, or fee plan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-9 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-1 pl-9 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-fuchsia-500"
            />
          </div>
        </div>

        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b border-zinc-200 dark:border-zinc-800">
              <tr className="border-b transition-colors hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">Transaction Date</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">Student</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">Fee Plan</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">Amount Paid</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">Status</th>
                <th className="h-12 px-4 align-middle font-medium text-zinc-500 text-right">Generate PDF</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-zinc-200 dark:border-zinc-800 animate-pulse">
                    <td className="p-4 align-middle"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-32"></div></td>
                    <td className="p-4 align-middle"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-24"></div></td>
                    <td className="p-4 align-middle"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-32"></div></td>
                    <td className="p-4 align-middle"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-16"></div></td>
                    <td className="p-4 align-middle"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-20"></div></td>
                    <td className="p-4 align-middle"><div className="h-8 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-md ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500">
                    No transactions map to your search criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="border-b border-zinc-200 dark:border-zinc-800 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 group">
                    <td className="p-4 align-middle text-zinc-500">
                      {new Date(p.paymentDate).toLocaleString(undefined, {
                        month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit"
                      })}
                    </td>
                    <td className="p-4 align-middle font-medium text-zinc-900 dark:text-zinc-100">{p.student.name}</td>
                    <td className="p-4 align-middle text-zinc-600 dark:text-zinc-400">
                      <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 opacity-60" /> {p.feePlan.name}</span>
                    </td>
                    <td className="p-4 align-middle font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                      ${p.amount.toFixed(2)}
                    </td>
                    <td className="p-4 align-middle">
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <button 
                        onClick={() => handleDownloadReceipt(p)}
                        className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 h-8 px-3 transition-colors"
                      >
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        Export PDF
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
