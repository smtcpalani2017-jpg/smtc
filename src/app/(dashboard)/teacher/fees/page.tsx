'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Sidebar from '@/components/dashboard/Sidebar'
import { 
  Search, Filter, Banknote, CheckCircle2, 
  Clock, Users, Loader2, ChevronRight,
  ShieldCheck, CreditCard, FilterX
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function TeacherFeesDashboard() {
  const supabase = createClient()
  const [assignedClasses, setAssignedClasses] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all')
  
  const currentMonthStr = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  const loadInitialData = async () => {
    setLoading(true)
    // 1. Get Logged in User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 2. Fetch ALL Classes created by Admin
    const { data: classesData } = await supabase
      .from('classes')
      .select('class_name')
      .not('class_name', 'is', null)

    if (classesData && classesData.length > 0) {
      setAssignedClasses(classesData)
      setSelectedClass(classesData[0].class_name)
    } else {
      setLoading(false)
    }
  }

  const loadFeeData = async () => {
    if (!selectedClass) return
    setLoading(true)
    
    // Fetch students of the selected class
    const [studentsRes, transRes] = await Promise.all([
      supabase.from('students').select('*').eq('class', selectedClass).order('name'),
      supabase.from('fee_transactions').select('*, students(name, class)').order('created_at', { ascending: false }).limit(10)
    ])

    // Check month payments
    const { data: currentMonthPaid } = await supabase
      .from('fee_transactions')
      .select('student_id')
      .eq('payment_for_month', currentMonthStr)

    const paidIds = new Set(currentMonthPaid?.map(p => p.student_id))

    const enrichedStudents = (studentsRes.data || []).map(s => ({
      ...s,
      isMonthPaid: paidIds.has(s.id)
    }))

    setStudents(enrichedStudents)
    setTransactions(transRes.data || [])
    setLoading(false)
  }

  useEffect(() => { loadInitialData() }, [])
  useEffect(() => { if (selectedClass) loadFeeData() }, [selectedClass])

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.register_number?.toLowerCase().includes(searchQuery.toLowerCase())
    
    let matchesStatus = true
    const isActuallyPaid = s.isMonthPaid || s.payment_plan === 'Full Year'
    if (statusFilter === 'paid') matchesStatus = isActuallyPaid
    if (statusFilter === 'pending') matchesStatus = !isActuallyPaid

    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar role="teacher" />
      <main className="flex-1 ml-0 md:ml-64 min-h-screen p-4 sm:p-10 transition-all duration-300">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-12 pl-12 sm:pl-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Fee Monitoring</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Institutional Finance Sync</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={16} />
                <input 
                  type="text" placeholder="Search students..." 
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all w-64 shadow-sm"
                />
             </div>
             <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm w-fit">
                <Filter size={14} className="text-slate-300" />
                <select 
                   value={selectedClass} 
                   onChange={e => setSelectedClass(e.target.value)}
                   className="bg-transparent text-slate-900 text-xs font-black uppercase tracking-widest border-none focus:ring-0 outline-none cursor-pointer"
                >
                   {assignedClasses.length === 0 ? <option>No Assignments</option> : assignedClasses.map(c => <option key={c.class_name} value={c.class_name}>{c.class_name}</option>)}
                </select>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2">
                <div className="flex gap-2">
                    <button onClick={() => setStatusFilter('all')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === 'all' ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-400 border border-slate-100'}`}>All</button>
                    <button onClick={() => setStatusFilter('paid')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${statusFilter === 'paid' ? 'bg-emerald-500 text-white shadow-xl' : 'bg-white text-slate-400 border border-slate-100'}`}><CheckCircle2 size={14} /> Paid</button>
                    <button onClick={() => setStatusFilter('pending')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${statusFilter === 'pending' ? 'bg-rose-500 text-white shadow-xl' : 'bg-white text-slate-400 border border-slate-100'}`}><Clock size={14} /> Pending</button>
                </div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{filteredStudents.length} Students listed for {selectedClass}</span>
             </div>

             <div className="grid grid-cols-1 gap-3">
                <AnimatePresence mode="popLayout">
                   {loading ? (
                     <div className="py-32 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="animate-spin text-slate-200" size={40} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Syncing Data...</span>
                     </div>
                   ) : filteredStudents.length === 0 ? (
                     <div className="py-32 text-center bg-white rounded-[40px] border border-slate-100 border-dashed">
                        <FilterX size={40} className="mx-auto text-slate-100 mb-4" />
                        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No matching records found.</p>
                     </div>
                   ) : filteredStudents.map((s, i) => {
                     const isPaid = s.isMonthPaid || s.payment_plan === 'Full Year'
                     return (
                        <motion.div key={s.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.01 }} className="group bg-white hover:bg-slate-900 rounded-[28px] p-4 pl-6 pr-6 border border-slate-100 shadow-sm transition-all duration-300 flex items-center justify-between">
                           <div className="flex items-center gap-5">
                              <div className="w-12 h-12 rounded-[20px] bg-slate-50 text-slate-900 flex items-center justify-center font-bold text-lg group-hover:bg-white/10 group-hover:text-white transition-all">{s.name[0]}</div>
                              <div>
                                 <div className="text-base font-bold text-slate-900 group-hover:text-white transition-colors">{s.name}</div>
                                 <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-500">{s.register_number} • {s.payment_plan}</div>
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                              <div className={`px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${isPaid ? 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white' : 'bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-500 group-hover:text-white'}`}>{isPaid ? 'PAID' : 'PENDING'}</div>
                              <ChevronRight size={16} className="text-slate-200 group-hover:text-white transition-colors" />
                           </div>
                        </motion.div>
                     )
                   })}
                </AnimatePresence>
             </div>
          </div>

          <div className="space-y-6">
             <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute -top-10 -right-10 text-slate-50/50"><Banknote size={150} /></div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 relative z-10">Collections</h3>
                <div className="space-y-6 relative z-10">
                   {transactions.map((t, i) => (
                     <div key={i} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-600"><CreditCard size={18} /></div>
                        <div className="flex-1">
                           <div className="text-xs font-bold text-slate-900">{t.students?.name}</div>
                           <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">₹{t.amount_paid} • {new Date(t.created_at).toLocaleDateString()}</div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
             <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Summary</h3>
                <div className="space-y-4">
                   <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400"><span>Class Size</span><span className="text-white">{students.length}</span></div>
                   <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400"><span>Total Paid</span><span className="text-emerald-400">{students.filter(s => s.isMonthPaid || s.payment_plan === 'Full Year').length}</span></div>
                   <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400"><span>Pending</span><span className="text-rose-400">{students.filter(s => !s.isMonthPaid && s.payment_plan !== 'Full Year').length}</span></div>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  )
}
