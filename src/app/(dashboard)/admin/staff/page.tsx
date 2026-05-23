'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Sidebar from '@/components/dashboard/Sidebar'
import { UserPlus, Trash2, Edit2, Key, Users, X, Loader2, Mail, Shield, Eye, EyeOff } from 'lucide-react'
import { addStaffAction, updateStaffAction, deleteStaffAction } from '@/app/actions/staff'
import { motion, AnimatePresence } from 'framer-motion'

interface Staff {
  id: string; name: string; email: string; role: string; created_at: string
}

export default function AdminStaffPage() {
  const supabase = createClient()
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  
  const [showForm, setShowForm] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirmStaff, setDeleteConfirmStaff] = useState<Staff | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadStaff = async () => {
    setLoading(true)
    const { data } = await supabase.from('users').select('*').eq('role', 'staff').order('created_at', { ascending: false })
    setStaffList(data || [])
    setLoading(false)
  }

  useEffect(() => { loadStaff() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      let result
      if (editingStaff) {
        result = await updateStaffAction(editingStaff.id, form)
      } else {
        if (!form.password) throw new Error('Password is required for new staff.')
        result = await addStaffAction(form)
      }
      if (!result.success) throw new Error(result.error || 'Failed to save staff member.')
      setForm({ name: '', email: '', password: '' })
      setShowForm(false)
      setEditingStaff(null)
      loadStaff()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteStaff = (staff: Staff) => {
    setError('')
    setDeleteConfirmStaff(staff)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmStaff) return
    setDeleting(true)
    setError('')
    try {
      const result = await deleteStaffAction(deleteConfirmStaff.id)
      if (!result.success) throw new Error(result.error || 'Failed to delete staff member.')
      setDeleteConfirmStaff(null)
      loadStaff()
    } catch (err: any) {
      setError(err.message || 'Error deleting staff.')
    } finally {
      setDeleting(false)
    }
  }

  const openEdit = (staff: Staff) => {
    setError('')
    setEditingStaff(staff)
    setForm({ name: staff.name, email: staff.email, password: '' })
    setShowPassword(false)
    setShowForm(true)
  }

  const openAdd = () => {
    setError('')
    setEditingStaff(null)
    setForm({ name: '', email: '', password: '' })
    setShowPassword(false)
    setShowForm(true)
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar role="admin" />
      <main className="flex-1 min-w-0 ml-0 md:ml-64 min-h-screen transition-all duration-300">

        {/* Header */}
        <header className="bg-white border-b border-slate-100 sticky top-0 z-30 px-4 sm:px-8 py-4 pl-16 sm:pl-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Staff Management</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Institutional Access Control</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-700 active:scale-95 transition-all shadow-lg w-fit"
          >
            <UserPlus size={16} />
            <span>Add Staff</span>
          </button>
        </header>

        <div className="p-4 sm:p-8">

          {/* ── MOBILE CARD LIST ── */}
          <div className="block sm:hidden space-y-3">
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-slate-300" size={36} />
              </div>
            ) : staffList.length === 0 ? (
              <div className="text-center py-20">
                <Users size={36} className="mx-auto text-slate-200 mb-3" />
                <p className="text-slate-300 font-bold uppercase text-[10px] tracking-widest">No staff members found</p>
              </div>
            ) : staffList.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center gap-4"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-base shadow-md shrink-0">
                  {s.name?.charAt(0)?.toUpperCase() || 'S'}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 text-sm truncate">{s.name}</p>
                  <p className="text-slate-400 text-xs truncate flex items-center gap-1 mt-0.5">
                    <Mail size={10} className="shrink-0" />{s.email}
                  </p>
                  <span className="mt-1.5 inline-block bg-emerald-50 text-emerald-600 px-3 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                    Active
                  </span>
                </div>
                {/* Action Buttons — always visible on mobile */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(s)}
                    className="p-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-900 hover:text-white transition-all"
                    aria-label="Edit staff"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => deleteStaff(s)}
                    className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all"
                    aria-label="Delete staff"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── DESKTOP TABLE ── */}
          <div className="hidden sm:block bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff Profile</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={5} className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-slate-200" size={40} /></td></tr>
                  ) : staffList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-24 text-center">
                        <Users size={40} className="mx-auto text-slate-100 mb-4" />
                        <p className="text-slate-300 font-bold uppercase text-[10px] tracking-widest">No staff members found</p>
                      </td>
                    </tr>
                  ) : staffList.map((s, i) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-8 py-5 text-[10px] font-black text-slate-300">{i + 1}</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-lg">
                            {s.name?.charAt(0)?.toUpperCase() || 'S'}
                          </div>
                          <span className="text-sm font-black text-slate-900">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-slate-400">{s.email}</td>
                      <td className="px-8 py-5 text-center">
                        <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest inline-block border border-emerald-100">Active</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(s)} className="p-2.5 bg-slate-100 text-slate-900 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm" aria-label="Edit">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => deleteStaff(s)} className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm" aria-label="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Staff count badge */}
          {!loading && staffList.length > 0 && (
            <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-6">
              {staffList.length} staff member{staffList.length !== 1 ? 's' : ''} registered
            </p>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-md" />
            <motion.div
              initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
              className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full sm:max-w-md p-6 sm:p-10 shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center">
                    <Shield size={18} className="text-white" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900">{editingStaff ? 'Update Staff' : 'Add Staff'}</h2>
                </div>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 active:scale-90">
                  <X size={20} />
                </button>
              </div>

              {error && <div className="mb-6 bg-rose-50 text-rose-600 text-xs font-bold p-4 rounded-2xl border border-rose-100">{error}</div>}
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Full Name</label>
                  <input
                    type="text" required value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Email Address</label>
                  <input
                    type="email" required value={form.email}
                    onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="staff@smtc.edu"
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                    {editingStaff ? 'New Password (Optional)' : 'Access Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"} required={!editingStaff} value={form.password}
                      onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder={editingStaff ? 'Leave blank to keep same' : '••••••••'}
                      className="w-full bg-slate-50 border-none rounded-2xl pl-5 pr-12 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit" disabled={saving}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-700 disabled:opacity-60 active:scale-95 transition-all flex items-center justify-center gap-3 mt-2"
                >
                  {saving ? <Loader2 className="animate-spin" size={16} /> : (editingStaff ? 'Save Changes' : 'Grant Access')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmStaff && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirmStaff(null)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-md" />
            <motion.div
              initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
              className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full sm:max-w-sm p-6 sm:p-8 shadow-2xl relative z-10 text-center"
            >
              <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Trash2 size={24} />
              </div>
              <h2 className="text-lg font-black text-slate-900 mb-2">Remove Staff Member?</h2>
              <p className="text-slate-500 text-sm mb-6">
                Are you sure you want to remove <span className="font-bold text-slate-900">{deleteConfirmStaff.name}</span>? This will permanently delete their account.
              </p>

              {error && <div className="mb-5 bg-rose-50 text-rose-600 text-xs font-bold p-3 rounded-2xl border border-rose-100">{error}</div>}

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmStaff(null)}
                  className="flex-1 bg-slate-100 text-slate-700 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="flex-1 bg-rose-600 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-700 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {deleting ? <Loader2 className="animate-spin" size={14} /> : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
