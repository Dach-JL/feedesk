"use client";

import React, { useEffect, useState } from "react";
import { Plus, Search, CreditCard, Edit, Trash2, X, Loader2, Calendar, Tag } from "lucide-react";

type ClassData = { id: string; name: string; };
type FeePlanData = { id: string; name: string; amount: number; dueDate: string; classId: string | null; class?: ClassData; };

export default function FeePlansClient() {
  const [feePlans, setFeePlans] = useState<FeePlanData[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", amount: "", dueDate: "", classId: "" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [feeRes, classRes] = await Promise.all([fetch("/api/fee-plans"), fetch("/api/classes")]);
      const feeData = await feeRes.json();
      const classData = await classRes.json();
      if (Array.isArray(feeData)) setFeePlans(feeData);
      if (Array.isArray(classData)) setClasses(classData);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenModal = (f?: FeePlanData) => {
    if (f) { setEditingId(f.id); setFormData({ name: f.name, amount: f.amount.toString(), dueDate: new Date(f.dueDate).toISOString().split('T')[0], classId: f.classId || "" }); }
    else { setEditingId(null); setFormData({ name: "", amount: "", dueDate: "", classId: "" }); }
    setIsModalOpen(true);
  };
  const handleCloseModal = () => { setIsModalOpen(false); setEditingId(null); setFormData({ name: "", amount: "", dueDate: "", classId: "" }); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.amount || !formData.dueDate) return;
    setIsSubmitting(true);
    try {
      const method = editingId ? "PATCH" : "POST";
      const url = editingId ? `/api/fee-plans/${editingId}` : "/api/fee-plans";
      const payload = { name: formData.name, amount: parseFloat(formData.amount), dueDate: new Date(formData.dueDate).toISOString(), classId: formData.classId === "" ? null : formData.classId };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) { fetchData(); handleCloseModal(); }
    } catch (error) { console.error(error); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this fee plan?")) return;
    try {
      const res = await fetch(`/api/fee-plans/${id}`, { method: "DELETE" });
      if (res.ok) fetchData(); else alert("Cannot delete. Payments may be linked.");
    } catch (error) { console.error(error); }
  };

  const filteredPlans = feePlans.filter((f) =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (f.class?.name || "Global").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div />
        <button onClick={() => handleOpenModal()} className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 h-10 px-5 hover:scale-[1.02] active:scale-[0.98] transition-all">
          <Plus className="h-4 w-4" /> Add Fee Plan
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden">
        <div className="p-4 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input type="text" placeholder="Search plans or classes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-1 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200/60 dark:border-zinc-800/60">
                <th className="h-11 px-6 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Plan Name</th>
                <th className="h-11 px-6 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Amount</th>
                <th className="h-11 px-6 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Due Date</th>
                <th className="h-11 px-6 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Class</th>
                <th className="h-11 px-6 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800/40 animate-pulse">
                    {[32, 20, 28, 24, 16].map((w, j) => (
                      <td key={j} className="p-4 px-6"><div className={`h-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-${w}`} /></td>
                    ))}
                  </tr>
                ))
              ) : filteredPlans.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center">
                  <CreditCard className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
                  <p className="text-sm text-zinc-500">No fee plans found.</p>
                </td></tr>
              ) : (
                filteredPlans.map((f) => (
                  <tr key={f.id} className="border-b border-zinc-100 dark:border-zinc-800/40 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                          <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">{f.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold tabular-nums text-emerald-600 dark:text-emerald-400">${f.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-zinc-500">
                      <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 opacity-50" />{new Date(f.dueDate).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${f.classId ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
                        {f.classId ? f.class?.name || "Unknown" : "Global"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(f)} className="p-2 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(f.id)} className="p-2 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md border border-zinc-200/60 dark:border-zinc-800/60 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{editingId ? "Edit Fee Plan" : "Create Fee Plan"}</h3>
                <p className="text-xs text-zinc-500 mt-0.5">{editingId ? "Update fee plan details" : "Define a new fee structure"}</p>
              </div>
              <button onClick={handleCloseModal} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Plan Name <span className="text-rose-500">*</span></label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Fall Term Tuition"
                  className="flex h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Amount ($) <span className="text-rose-500">*</span></label>
                <input type="number" step="0.01" min="0" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00"
                  className="flex h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Due Date <span className="text-rose-500">*</span></label>
                <input type="date" required value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="flex h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Assign to Class <span className="text-zinc-400 font-normal">(Optional)</span></label>
                <select value={formData.classId} onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  className="flex h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  <option value="">Global / All classes</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting || !formData.name || !formData.amount || !formData.dueDate}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingId ? "Update Plan" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
