"use client";

import React, { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2, X, Loader2, Mail, UserCircle } from "lucide-react";

type ClassData = { id: string; name: string; };
type StudentData = {
  id: string; name: string; email: string | null; classId: string; createdAt: string;
  class?: ClassData;
};

export default function StudentsClient() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", classId: "", password: "student123" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stuRes, classRes] = await Promise.all([fetch("/api/students"), fetch("/api/classes")]);
      const stuData = await stuRes.json();
      const classData = await classRes.json();
      if (Array.isArray(stuData)) setStudents(stuData);
      if (Array.isArray(classData)) setClasses(classData);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenModal = (s?: StudentData) => {
    if (s) { setEditingId(s.id); setFormData({ name: s.name, email: s.email || "", classId: s.classId, password: "" }); } 
    else { setEditingId(null); setFormData({ name: "", email: "", classId: classes.length > 0 ? classes[0].id : "", password: "student123" }); }
    setIsModalOpen(true);
  };
  const handleCloseModal = () => { setIsModalOpen(false); setEditingId(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.classId) return;
    setIsSubmitting(true);
    try {
      const method = editingId ? "PATCH" : "POST";
      const url = editingId ? `/api/students/${editingId}` : "/api/students";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (res.ok) { fetchData(); handleCloseModal(); }
    } catch (error) { console.error(error); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (res.ok) fetchData(); else alert("Cannot delete. Payment records may be attached.");
    } catch (error) { console.error(error); }
  };

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.class?.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div />
        <button onClick={() => handleOpenModal()} className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 h-10 px-5 hover:scale-[1.02] active:scale-[0.98] transition-all">
          <Plus className="h-4 w-4" /> Add Student
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden">
        <div className="p-4 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input type="text" placeholder="Search by name, email, or class..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-1 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" />
          </div>
        </div>

        {/* Mobile View: Cards */}
        <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-4 animate-pulse border border-zinc-100 dark:border-zinc-800/40">
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2 mb-3" />
                <div className="h-3 bg-zinc-100 dark:bg-zinc-900 rounded w-3/4" />
              </div>
            ))
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <UserCircle className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">No students found.</p>
            </div>
          ) : (
            filteredStudents.map((s) => (
              <div key={s.id} className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800/40 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase">{s.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">{s.name}</div>
                      <div className="text-xs text-zinc-500">{s.class?.name || "Unassigned"}</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleOpenModal(s)} className="p-2 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-2 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-200/40 dark:border-zinc-800/40">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {s.email || "No email"}</span>
                  <span>Joined {new Date(s.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200/60 dark:border-zinc-800/60">
                <th className="h-11 px-6 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Student</th>
                <th className="h-11 px-6 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Email</th>
                <th className="h-11 px-6 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Class</th>
                <th className="h-11 px-6 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Enrolled</th>
                <th className="h-11 px-6 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800/40 animate-pulse">
                    <td className="p-4 px-6"><div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-32" /></td>
                    <td className="p-4 px-6"><div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-28" /></td>
                    <td className="p-4 px-6"><div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-20" /></td>
                    <td className="p-4 px-6"><div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-24" /></td>
                    <td className="p-4 px-6"><div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <UserCircle className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
                    <p className="text-sm text-zinc-500">No students found.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="border-b border-zinc-100 dark:border-zinc-800/40 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">{s.name.charAt(0)}</span>
                        </div>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-500">
                      {s.email ? (
                        <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 opacity-50" />{s.email}</span>
                      ) : <span className="text-zinc-400 italic text-xs">Not provided</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300">
                        {s.class?.name || "Unassigned"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(s)} className="p-2 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(s.id)} className="p-2 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"><Trash2 className="h-4 w-4" /></button>
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
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{editingId ? "Edit Student" : "Enroll New Student"}</h3>
                <p className="text-xs text-zinc-500 mt-0.5">{editingId ? "Update student details" : "Add a student to your institution"}</p>
              </div>
              <button onClick={handleCloseModal} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Full Name <span className="text-rose-500">*</span></label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Jane Doe"
                  className="flex h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Email <span className="text-zinc-400 font-normal">(Optional)</span></label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="student@example.com"
                  className="flex h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Assign Class <span className="text-rose-500">*</span></label>
                <select required value={formData.classId} onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  className="flex h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="" disabled>Select class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Password {editingId && <span className="text-zinc-400 font-normal">(Leave blank to keep unchanged)</span>} {!editingId && <span className="text-rose-500">*</span>}</label>
                <input type="text" required={!editingId} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="student123"
                  className="flex h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting || !formData.name || !formData.classId}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-500/20">
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingId ? "Update Student" : "Enroll Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
