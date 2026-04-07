"use client";

import React, { useEffect, useState } from "react";
import { Plus, Search, Users, Edit, Trash2, X, Loader2, Mail } from "lucide-react";

type ClassData = {
  id: string;
  name: string;
};

type StudentData = {
  id: string;
  name: string;
  email: string | null;
  classId: string;
  createdAt: string;
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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    classId: ""
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stuRes, classRes] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/classes")
      ]);
      const stuData = await stuRes.json();
      const classData = await classRes.json();
      
      if (Array.isArray(stuData)) setStudents(stuData);
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

  const handleOpenModal = (s?: StudentData) => {
    if (s) {
      setEditingId(s.id);
      setFormData({
        name: s.name,
        email: s.email || "",
        classId: s.classId
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", email: "", classId: classes.length > 0 ? classes[0].id : "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.classId) return;

    setIsSubmitting(true);
    try {
      const method = editingId ? "PATCH" : "POST";
      const url = editingId ? `/api/students/${editingId}` : "/api/students";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchData();
        handleCloseModal();
      } else {
        console.error("Failed to save student");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student and their records?")) return;

    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      } else {
        alert("Action restricted. Please check tied payment historical records.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.class?.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-500" />
            Student Directory
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Intake new students and manage their official class assignments.
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white shadow hover:bg-blue-700 h-10 px-4 py-2 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Student
        </button>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by name, email, or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-9 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-1 pl-9 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
            />
          </div>
        </div>

        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b border-zinc-200 dark:border-zinc-800">
              <tr className="border-b transition-colors hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">Student Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">Email</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">Enrolled Class</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">Enrolled Date</th>
                <th className="h-12 px-4 align-middle font-medium text-zinc-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-zinc-200 dark:border-zinc-800 animate-pulse">
                    <td className="p-4 align-middle"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-32"></div></td>
                    <td className="p-4 align-middle"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-24"></div></td>
                    <td className="p-4 align-middle"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-20"></div></td>
                    <td className="p-4 align-middle"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-24"></div></td>
                    <td className="p-4 align-middle"><div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 rounded-full ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500">
                    No students currently enrolled matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="border-b border-zinc-200 dark:border-zinc-800 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 group">
                    <td className="p-4 align-middle font-medium text-zinc-900 dark:text-zinc-100">{s.name}</td>
                    <td className="p-4 align-middle text-zinc-600 dark:text-zinc-400">
                      {s.email ? (
                        <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 opacity-60" /> {s.email}</span>
                      ) : (
                        <span className="text-zinc-400 italic">No email provided</span>
                      )}
                    </td>
                    <td className="p-4 align-middle">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                        {s.class?.name || "Unassigned"}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-zinc-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(s)} className="p-2 text-zinc-400 hover:text-blue-600 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="p-2 text-zinc-400 hover:text-red-600 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
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
                {editingId ? "Edit Student Details" : "Enroll New Student"}
              </h3>
              <button onClick={handleCloseModal} className="text-zinc-400 hover:text-zinc-500 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Jane Doe"
                    className="flex h-10 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Email Address <span className="text-zinc-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@example.com"
                    className="flex h-10 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Assign Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>Select an active class</option>
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
                  disabled={isSubmitting || !formData.name || !formData.classId}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
