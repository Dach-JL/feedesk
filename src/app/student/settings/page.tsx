"use client"

import React, { useState } from "react"
import { Shield, Key, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/student/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to update password")
      } else {
        setSuccess("Password updated successfully!")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-8 px-4 sm:px-6 md:px-8 max-w-2xl mx-auto animate-slide-up">
      <div className="mb-8">
        <Link 
          href="/student" 
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">Account Settings</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage your account security and preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Security Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Security</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Update your password to keep your account secure.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            {error && (
              <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-4 rounded-2xl text-rose-600 dark:text-rose-400 text-sm font-medium flex gap-3 items-center">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-4 rounded-2xl text-emerald-600 dark:text-emerald-400 text-sm font-medium flex gap-3 items-center">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                {success}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  <Key className="w-4 h-4 text-zinc-400" />
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Min. 8 characters"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Repeat new password"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl p-4 text-sm font-black hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-zinc-500/10 dark:shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="bg-indigo-50 dark:bg-indigo-500/5 rounded-3xl p-6 border border-indigo-100 dark:border-indigo-500/10">
          <h3 className="text-indigo-900 dark:text-indigo-400 font-bold flex items-center gap-2 mb-2 text-sm">
            <AlertCircle className="w-4 h-4" />
            Security Tip
          </h3>
          <p className="text-indigo-700/70 dark:text-indigo-400/60 text-xs leading-relaxed">
            Use a unique password for your account. Avoid using the same password you use for other online services.
            After changing your password, you will remain logged in on this device.
          </p>
        </div>
      </div>
    </div>
  )
}
