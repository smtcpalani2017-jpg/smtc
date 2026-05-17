'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Sidebar from '@/components/dashboard/Sidebar'
import { UserPlus, Trash2, Edit2, Key, Users, X, Loader2 } from 'lucide-react'
import { addStaffAction, updateStaffAction } from '@/app/actions/staff'
import { motion, AnimatePresence } from 'framer-motion'

interface Staff {
  id: string; name: string; email: string; role: string; created_at: string
}

export default function AdminStaffPage() {
  const supabase = createClient()
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form State
  const [showForm, setShowForm] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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
        // Update existing staff
        result = await updateStaffAction(editingStaff.id, form)
      } else {
        // Add new staff
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

  const deleteStaff = async (id: string) => {
    if (!confirm('Remove this staff member? This will delete their account access.')) return
    await supabase.from('users').delete().eq('id', id)
    loadStaff()
  }

  const openEdit = (staff: Staff) => {
    setEditingStaff(staff)
    setForm({ name: staff.name, email: staff.email, password: '' })
    setShowForm(true)
  }

  const openAdd = () => {
    setEditingStaff(null)
    setForm({ name: '', email: '', password: '' })
    setShowForm(true)
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar role="admin" />
      <main className="flex-1 ml-0 md:ml-64 min-h-screen p-4 sm:p-10 transition-all duration-300">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10 pl-12 sm:pl-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Staff Management</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Institutional Access Control</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-3 bg-slate-900 text-white px-6 sm:px-8 py-3 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 w-fit"
          >
            <UserPlus size={16} />
            <span>Add Staff</span>
          </button>
        </header>

        <div className="bg-white rounded-[32px] sm:rounded-[48px] border border-slate-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff Profile</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
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
                  <td className="px-10 py-6 text-[10px] font-black text-slate-300">{i + 1}</td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-slate-900/10">
                        {s.name?.charAt(0) || 'S'}
                      </div>
                      <span className="text-sm font-black text-slate-900">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-sm font-bold text-slate-400">{s.email}</td>
                  <td className="px-10 py-6 text-center">
                    <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest inline-block border border-emerald-100">Active</span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <button onClick={() => openEdit(s)} className="p-2.5 bg-slate-100 text-slate-900 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => deleteStaff(s.id)} className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm">
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
      </main>

      {/* Staff Modal (Add/Edit) */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] sm:rounded-[48px] w-full max-w-md p-6 sm:p-10 shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editingStaff ? 'Update Staff' : 'Add Staff'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-50 rounded-full transition-all text-slate-400"><X size={20} /></button>
              </div>

              {error && <div className="mb-6 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest p-4 rounded-2xl border border-rose-100">{error}</div>}
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Full Name</label>
                  <input
                    type="text" required value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Email Address</label>
                  <input
                    type="email" required value={form.email}
                    onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="staff@smtc.edu"
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                    {editingStaff ? 'New Password (Optional)' : 'Access Password'}
                  </label>
                  <div className="relative">
                    <input
                      type="password" required={!editingStaff} value={form.password}
                      onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder={editingStaff ? 'Leave blank to keep same' : '••••••••'}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 transition-all"
                    />
                    <Key className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-200" size={18} />
                  </div>
                </div>

                <button 
                  type="submit" disabled={saving} 
                  className="w-full bg-slate-900 text-white py-5 rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 hover:bg-slate-800 disabled:opacity-60 transition-all flex items-center justify-center gap-3"
                >
                  {saving ? <Loader2 className="animate-spin" size={16} /> : (editingStaff ? 'Save Changes' : 'Grant Access')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
