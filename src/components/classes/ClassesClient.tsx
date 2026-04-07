"use client";

import React, { useEffect, useState } from "react";
import { Plus, Search, BookOpen, MoreVertical, Edit, Trash2 } from "lucide-react";

type ClassData = {
  id: string;
  name: string;
  createdAt: string;
  _count: {
    students: number;
  };
};

export default function ClassesClient() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setClasses(data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredClasses = classes.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-500" />
            Classes & Courses
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your organization's classes and see enrolled students.
          </p>
        </div>
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 bg-indigo-600 text-white shadow hover:bg-indigo-700 h-10 px-4 py-2 hover:scale-[1.02] active:scale-95">
          <Plus className="mr-2 h-4 w-4" />
          Add Class
        </button>
      </div>

      {/* Table Section */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-9 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-1 pl-9 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-indigo-500"
            />
          </div>
        </div>

        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b border-zinc-200 dark:border-zinc-800">
              <tr className="border-b transition-colors hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 data-[state=selected]:bg-zinc-100">
                <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500 [&:has([role=checkbox])]:pr-0">
                  Class Name
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500 [&:has([role=checkbox])]:pr-0">
                  Enrolled Students
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500 [&:has([role=checkbox])]:pr-0">
                  Created Date
                </th>
                <th className="h-12 px-4 align-middle font-medium text-zinc-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-zinc-200 dark:border-zinc-800 animate-pulse">
                    <td className="p-4 align-middle"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-24"></div></td>
                    <td className="p-4 align-middle"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-12"></div></td>
                    <td className="p-4 align-middle"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-20"></div></td>
                    <td className="p-4 align-middle text-right"><div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 rounded-full ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-zinc-500">
                    No classes found. {searchTerm && "Try adjusting your search."}
                  </td>
                </tr>
              ) : (
                filteredClasses.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-zinc-200 dark:border-zinc-800 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 group"
                  >
                    <td className="p-4 align-middle font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
                      {c.name}
                    </td>
                    <td className="p-4 align-middle">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 border-transparent bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-200">
                        {c._count.students} Students
                      </span>
                    </td>
                    <td className="p-4 align-middle text-zinc-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-zinc-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-zinc-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/30">
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
    </div>
  );
}
