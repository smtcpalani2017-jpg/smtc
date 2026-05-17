'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Sidebar from '@/components/dashboard/Sidebar'
import { 
  Plus, Search, Edit2, Trash2, Loader2, X, 
  User, Phone, MapPin, GraduationCap, Calendar, 
  School, CreditCard, ChevronRight, Save,
  UserCircle, Briefcase, IndianRupee
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function StudentManagement() {
  const supabase = createClient()
  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null)
  
  const [showModal, setShowModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '', register_number: '', class: '', gender: 'Male',
    parent_name: '', parent_phone: '', address: '', school_name: '',
    payment_plan: 'Monthly', monthly_fee: 0, total_year_fee: 0,
    join_date: new Date().toISOString().split('T')[0]
  })

  const loadData = async () => {
    setLoading(true)
    const [studentsRes, classesRes] = await Promise.all([
      supabase.from('students').select('*').order('name'),
      supabase.from('classes').select('class_name')
    ])
    setStudents(studentsRes.data || [])
    setClasses(classesRes.data || [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const generateRegNo = () => {
     const year = new Date().getFullYear()
     const random = Math.floor(1000 + Math.random() * 9000)
     return `SMTC-${year}-${random}`
  }

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.register_number?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    const finalData = { ...formData }
    if (!editingStudent) {
       finalData.register_number = generateRegNo()
    }

    if (editingStudent) {
      const { error } = await supabase.from('students').update(finalData).eq('id', editingStudent.id)
      if (!error) { setShowModal(false); loadData(); }
    } else {
      const { error } = await supabase.from('students').insert([finalData])
      if (!error) { setShowModal(false); loadData(); }
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return
    const { error } = await supabase.from('students').delete().eq('id', id)
    if (!error) loadData()
  }

  const openAddModal = () => {
    setEditingStudent(null)
    setFormData({
        name: '', register_number: '', class: classes[0]?.class_name || '', gender: 'Male',
        parent_name: '', parent_phone: '', address: '', school_name: '',
        payment_plan: 'Monthly', monthly_fee: 0, total_year_fee: 0,
        join_date: new Date().toISOString().split('T')[0]
    })
    setShowModal(true)
  }

  const openEditModal = (s: any) => {
    setEditingStudent(s)
    setFormData({
        name: s.name, register_number: s.register_number, class: s.class, gender: s.gender,
        parent_name: s.parent_name, parent_phone: s.parent_phone, address: s.address, school_name: s.school_name,
        payment_plan: s.payment_plan, monthly_fee: s.monthly_fee, total_year_fee: s.total_year_fee,
        join_date: s.join_date
    })
    setShowModal(true)
  }

  const inputClass = "w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all outline-none"
  const labelClass = "block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 pl-1"

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar role="teacher" />
      <main className="flex-1 ml-0 md:ml-64 min-h-screen p-4 sm:p-10 transition-all duration-300">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-12 pl-12 sm:pl-0">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Students</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Institutional Enrollment Registry</p>
          </div>
          <button onClick={openAddModal} className="bg-slate-900 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-slate-800 transition-all shadow-2xl active:scale-95 w-fit">
            <Plus size={16} strokeWidth={3} /> Add Student
          </button>
        </header>

        <div className="bg-white rounded-[32px] sm:rounded-[48px] border border-slate-100 shadow-xl overflow-hidden">
          <div className="p-4 sm:p-8 border-b border-slate-50 flex items-center gap-4">
             <div className="relative flex-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                   type="text" placeholder="Search by name, class or registration number..." 
                   value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                   className="w-full pl-16 pr-8 py-4 sm:py-5 bg-slate-50/50 border-none rounded-[24px] text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-slate-900 transition-all"
                />
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/30">
                  <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Identity</th>
                  <th className="px-10 py-7 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Registry ID</th>
                  <th className="px-10 py-7 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Classification</th>
                  <th className="px-10 py-7 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={4} className="py-32 text-center"><Loader2 className="animate-spin mx-auto text-slate-200" size={48} /></td></tr>
                ) : filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-all group cursor-pointer" onClick={() => setSelectedStudent(s)}>
                    <td className="px-10 py-6">
                       <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-xl shadow-slate-900/10 group-hover:scale-110 transition-transform">{s.name[0]}</div>
                          <span className="font-black text-slate-900 text-base">{s.name}</span>
                       </div>
                    </td>
                    <td className="px-10 py-6 text-center text-xs font-black text-slate-300 group-hover:text-slate-900 transition-colors tracking-widest">{s.register_number}</td>
                    <td className="px-10 py-6 text-center"><span className="bg-slate-100 text-slate-600 px-5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em]">{s.class}</span></td>
                    <td className="px-10 py-6 text-right">
                       <div className="flex justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => openEditModal(s)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-300 hover:bg-slate-900 hover:text-white rounded-xl transition-all shadow-sm"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(s.id)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-300 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm"><Trash2 size={16} /></button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- MODALS --- */}
        <AnimatePresence>
            {/* COMPACT View Profile Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedStudent(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
                   <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl relative z-[210]">
                      {/* Header */}
                      <div className="bg-slate-900 p-8 text-white relative">
                         <button onClick={() => setSelectedStudent(null)} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-all text-white/70 hover:text-white z-50"><X size={18} /></button>
                         <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-[24px] bg-white text-slate-900 flex items-center justify-center text-3xl font-black shadow-xl">{selectedStudent.name[0]}</div>
                            <div>
                               <h2 className="text-2xl font-black mb-1">{selectedStudent.name}</h2>
                               <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{selectedStudent.register_number}</span>
                                  <div className="w-1 h-1 rounded-full bg-white/20" />
                                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{selectedStudent.class}</span>
                               </div>
                            </div>
                         </div>
                      </div>
                      {/* Details */}
                      <div className="p-8 space-y-8 bg-white">
                         <div className="grid grid-cols-2 gap-8">
                            <div>
                               <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-2"><UserCircle size={12} /> Family</label>
                               <div className="text-sm font-black text-slate-900">{selectedStudent.parent_name}</div>
                               <div className="text-xs font-bold text-slate-400 mt-0.5">{selectedStudent.parent_phone}</div>
                            </div>
                            <div>
                               <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-2"><School size={12} /> School</label>
                               <div className="text-sm font-black text-slate-900 truncate">{selectedStudent.school_name || 'N/A'}</div>
                               <div className="text-[9px] font-bold text-slate-400 mt-0.5">JOINED: {new Date(selectedStudent.join_date).toLocaleDateString()}</div>
                            </div>
                         </div>
                         <div>
                            <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-2"><MapPin size={12} /> Address</label>
                            <div className="text-xs font-bold text-slate-600 leading-relaxed border-l-2 border-slate-100 pl-4">{selectedStudent.address || 'No address recorded.'}</div>
                         </div>
                         <div className="bg-slate-50 rounded-3xl p-6 flex justify-between items-center border border-slate-100">
                            <div>
                               <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{selectedStudent.payment_plan} Fee</div>
                               <div className="text-2xl font-black text-slate-900">₹{selectedStudent.payment_plan === 'Monthly' ? selectedStudent.monthly_fee : selectedStudent.total_year_fee}</div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center"><IndianRupee size={20} /></div>
                         </div>
                      </div>
                      <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-center"><button onClick={() => setSelectedStudent(null)} className="w-full py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-900 hover:text-white transition-all shadow-sm">Dismiss</button></div>
                   </motion.div>
                </div>
            )}

            {/* Form Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-3xl rounded-[32px] sm:rounded-[40px] shadow-2xl relative z-[210] overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 sm:px-10 py-6 sm:py-8 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-20">
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{editingStudent ? 'Edit Profile' : 'New Student'}</h2>
                            <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-xl transition-all text-slate-400"><X size={18} /></button>
                        </div>
                        <div className="p-6 sm:p-10 overflow-y-auto">
                            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                                    <div className="space-y-4 sm:space-y-6">
                                        <div><label className={labelClass}>Student Name</label><input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} /></div>
                                        <div><label className={labelClass}>Parent Name</label><input required type="text" value={formData.parent_name} onChange={e => setFormData({...formData, parent_name: e.target.value})} className={inputClass} /></div>
                                        <div><label className={labelClass}>Phone Number</label><input required type="text" value={formData.parent_phone} onChange={e => setFormData({...formData, parent_phone: e.target.value})} className={inputClass} /></div>
                                    </div>
                                    <div className="space-y-4 sm:space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className={labelClass}>Class</label><select required value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} className={inputClass}><option value="">Select</option>{classes.map(c => <option key={c.class_name} value={c.class_name}>{c.class_name}</option>)}</select></div>
                                            <div><label className={labelClass}>Gender</label><select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className={inputClass}><option value="Male">Male</option><option value="Female">Female</option></select></div>
                                        </div>
                                        <div><label className={labelClass}>School</label><input type="text" value={formData.school_name} onChange={e => setFormData({...formData, school_name: e.target.value})} className={inputClass} /></div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className={labelClass}>Plan</label><select value={formData.payment_plan} onChange={e => setFormData({...formData, payment_plan: e.target.value})} className={inputClass}><option value="Monthly">Monthly</option><option value="Yearly">Yearly</option></select></div>
                                            {formData.payment_plan === 'Monthly' ? (
                                                <div><label className={labelClass}>Monthly Fee</label><input type="number" value={formData.monthly_fee} onChange={e => setFormData({...formData, monthly_fee: parseInt(e.target.value) || 0})} className={inputClass} /></div>
                                            ) : (
                                                <div><label className={labelClass}>Yearly Fee</label><input type="number" value={formData.total_year_fee} onChange={e => setFormData({...formData, total_year_fee: parseInt(e.target.value) || 0})} className={inputClass} /></div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div><label className={labelClass}>Address</label><textarea rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className={inputClass + " resize-none h-24 py-4"} /></div>
                                <div className="pt-4"><button disabled={saving} className="w-full bg-slate-900 text-white py-4 sm:py-5 rounded-[24px] text-xs font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 disabled:opacity-60 transition-all flex items-center justify-center gap-3">{saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}{saving ? 'Processing...' : 'Save Student'}</button></div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
      </main>
    </div>
  )
}
