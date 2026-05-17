'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Sidebar from '@/components/dashboard/Sidebar'
import { Megaphone, Plus, Trash2, Send } from 'lucide-react'

interface Announcement {
  id: string; title: string; message: string; priority: string; created_at: string
}

export default function AdminAnnouncementsPage() {
  const supabase = createClient()
  const [items, setItems] = useState<Announcement[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', message: '', priority: 'normal' })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
    setItems(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    await supabase.from('announcements').insert(form)
    setForm({ title: '', message: '', priority: 'normal' }); setShowForm(false); load()
    setSaving(false)
  }

  const remove = async (id: string) => {
    if (!confirm('Delete?')) return
    await supabase.from('announcements').delete().eq('id', id); load()
  }

  const pc = (p: string) => p === 'urgent' ? 'bg-red-100 text-red-600 border-red-200' : p === 'important' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-blue-100 text-blue-600 border-blue-200'

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      <Sidebar role="admin" userName="Admin" userEmail="smtcpalani2017@gmail.com" />
      <main className="flex-1 ml-0 md:ml-64 min-h-screen transition-all duration-300">
        <header className="bg-white border-b border-gray-200 min-h-16 py-3 flex items-center justify-between px-4 sm:px-8 pl-16 sm:pl-8 sticky top-0 z-30">
          <h1 className="font-serif font-bold text-[#001F3F] text-lg sm:text-xl">Announcements</h1>
          <button onClick={() => setShowForm(true)} className="flex items-center space-x-2 bg-[#001F3F] text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold hover:bg-[#003366]">
            <Plus size={16} /><span>New Announcement</span>
          </button>
        </header>
        <div className="p-4 sm:p-8 space-y-6">
          {loading ? <p className="text-gray-400 text-center py-16">Loading...</p> : items.length === 0 ? (
            <div className="text-center py-20"><Megaphone size={48} className="mx-auto text-gray-200 mb-4" /><p className="text-gray-400">No announcements yet</p></div>
          ) : items.map(a => (
            <div key={a.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${pc(a.priority)}`}>{a.priority}</span>
                    <span className="text-xs text-gray-400">{new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <h3 className="font-serif font-bold text-[#001F3F] text-lg mb-2">{a.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{a.message}</p>
                </div>
                <button onClick={() => remove(a.id)} className="p-2 hover:bg-red-50 text-red-400 rounded-lg"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <h2 className="font-serif font-bold text-[#001F3F] text-lg mb-5">New Announcement</h2>
            <form onSubmit={create} className="space-y-4">
              <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Title *</label>
                <input type="text" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#001F3F] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" placeholder="Announcement title" /></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Message *</label>
                <textarea required value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={4} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#001F3F] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] resize-none" placeholder="Write your message..." /></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Priority</label>
                <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#001F3F] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]">
                  <option value="normal">Normal</option><option value="important">Important</option><option value="urgent">Urgent</option>
                </select></div>
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-[#001F3F] text-white rounded-xl py-2.5 text-sm font-bold hover:bg-[#003366] disabled:opacity-60 flex items-center justify-center space-x-2">
                  <Send size={14} /><span>{saving ? 'Posting...' : 'Post'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
