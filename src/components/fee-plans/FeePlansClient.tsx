"use client";

import React, { useEffect, useState } from "react";
import { Plus, Search, CreditCard, Edit, Trash2, X, Loader2, Calendar } from "lucide-react";

type ClassData = {
  id: string;
  name: string;
};

type FeePlanData = {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  classId: string | null;
  class?: ClassData;
};

export default function FeePlansClient() {
  const [feePlans, setFeePlans] = useState<FeePlanData[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    dueDate: "",
    classId: ""
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [feeRes, classRes] = await Promise.all([
        fetch("/api/fee-plans"),
        fetch("/api/classes")
      ]);
      const feeData = await feeRes.json();
      const classData = await classRes.json();
      
      if (Array.isArray(feeData)) setFeePlans(feeData);
      if (Array.isArray(classData)) setClasses(classData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (f?: FeePlanData) => {
    if (f) {
      setEditingId(f.id);
      setFormData({
        name: f.name,
        amount: f.amount.toString(),
        dueDate: new Date(f.dueDate).toISOString().split('T')[0],
        classId: f.classId || ""
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", amount: "", dueDate: "", classId: "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "", amount: "", dueDate: "", classId: "" });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.amount || !formData.dueDate) return;

    setIsSubmitting(true);
    try {
      const method = editingId ? "PATCH" : "POST";
      const url = editingId ? `/api/fee-plans/${editingId}` : "/api/fee-plans";

      const payload = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        dueDate: new Date(formData.dueDate).toISOString(),
        classId: formData.classId === "" ? null : formData.classId
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchData();
        handleCloseModal();
      } else {
        console.error("Failed to save fee plan");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this fee plan?")) return;

    try {
      const res = await fetch(`/api/fee-plans/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      } else {
        alert("Failed to delete. Payment records might be actively tied to this plan.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredPlans = feePlans.filter((f) =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (f.class?.name || "Global / All Classes").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-emerald-500" />
            Fee Management
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Construct termly or monthly fee structures and map them to classes.
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-emerald-600 text-white shadow hover:bg-emerald-700 h-10 px-4 py-2 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Fee Plan
        </button>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search plans or classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-9 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-1 pl-9 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
            />
          </div>
        </div>

        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b border-zinc-200 dark:border-zinc-800">
              <tr className="border-b transition-colors hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">Plan Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">Amount</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">Due Date</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">Assigned Class</th>
                <th className="h-12 px-4 align-middle font-medium text-zinc-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-zinc-200 dark:border-zinc-800 animate-pulse">
                    <td className="p-4 align-middle"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-24"></div></td>
                    <td className="p-4 align-middle"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-16"></div></td>
                    <td className="p-4 align-middle"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-28"></div></td>
                    <td className="p-4 align-middle"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-24 ml-auto"></div></td>
                    <td className="p-4 align-middle"><div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 rounded-full ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500">
                    No fee plans found.
                  </td>
                </tr>
              ) : (
                filteredPlans.map((f) => (
                  <tr key={f.id} className="border-b border-zinc-200 dark:border-zinc-800 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 group">
                    <td className="p-4 align-middle font-medium text-zinc-900 dark:text-zinc-100">{f.name}</td>
                    <td className="p-4 align-middle font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                      ${f.amount.toFixed(2)}
                    </td>
                    <td className="p-4 align-middle text-zinc-500 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 opacity-70" />
                      {new Date(f.dueDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 align-middle">
                      {f.classId ? (
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800">
                          {f.class?.name || "Unknown"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700">
                          Global / All Classes
                        </span>
                      )}
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(f)} className="p-2 text-zinc-400 hover:text-emerald-600 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/30">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(f.id)} className="p-2 text-zinc-400 hover:text-red-600 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pt-10 pb-10 px-4 bg-zinc-950/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {editingId ? "Edit Fee Plan" : "Create New Fee Plan"}
              </h3>
              <button onClick={handleCloseModal} className="text-zinc-400 hover:text-zinc-500 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Plan Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Fall Term Tuition"
                    className="flex h-10 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Amount ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="flex h-10 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Assign to Class (Optional)
                  </label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Global / Applies to all classes</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.name || !formData.amount || !formData.dueDate}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
