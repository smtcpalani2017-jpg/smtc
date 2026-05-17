'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Sidebar from '@/components/dashboard/Sidebar'
import { 
  TrendingUp, Wallet, Clock, Users, Banknote, 
  BarChart3, Filter, Download, ArrowUpRight, 
  UserCheck, AlertTriangle, Calendar, ArrowLeft,
  ChevronRight, CheckCircle2, XCircle, Search, Loader2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminFeesPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all')
  
  const [stats, setStats] = useState({
    totalCollected: 0,
    totalPending: 0,
    monthlyRevenue: 0,
    totalDefaulters: 0,
    fullYearPaid: 0
  })
  
  const [classRevenue, setClassRevenue] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [classStudents, setClassStudents] = useState<any[]>([])

  const loadDashboardData = async () => {
    setLoading(true)
    const [studentsRes, transRes, classesRes] = await Promise.all([
        supabase.from('students').select('*'),
        supabase.from('fee_transactions').select('*').order('created_at', { ascending: false }),
        supabase.from('classes').select('class_name')
    ])
    
    const trans = transRes.data || []
    const studs = studentsRes.data || []
    const allClassNames = classesRes.data?.map(c => c.class_name) || []

    let totalColl = trans.reduce((sum, t) => sum + t.amount_paid, 0)
    let fullYearCount = studs.filter(s => s.payment_plan === 'Full-Year' && s.fee_status === 'Paid').length
    const currentMonthStr = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    let monthlyRev = trans.filter(t => t.payment_for_month === currentMonthStr).reduce((sum, t) => sum + t.amount_paid, 0)

    let totalPend = 0
    let defaulters = 0
    studs.forEach(s => {
      const studentPaid = trans.filter(t => t.student_id === s.id).reduce((sum, t) => sum + t.amount_paid, 0)
      let expected = s.payment_plan === 'Full-Year' ? (s.total_year_fee || 0) : (s.monthly_fee || 0)
      if (studentPaid < expected) {
        totalPend += (expected - studentPaid)
        defaulters++
      }
    })

    setStats({ totalCollected: totalColl, totalPending: totalPend, monthlyRevenue: monthlyRev, totalDefaulters: defaulters, fullYearPaid: fullYearCount })

    // Create a map for all classes initialized to 0
    const classMap: Record<string, number> = {}
    allClassNames.forEach(name => { classMap[name] = 0 })

    // Fill in values for classes that have revenue
    studs.forEach(s => {
      const paid = trans.filter(t => t.student_id === s.id).reduce((sum, t) => sum + t.amount_paid, 0)
      if (classMap[s.class] !== undefined) {
          classMap[s.class] += paid
      } else {
          classMap[s.class] = paid
      }
    })
    
    setClassRevenue(Object.entries(classMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value))
    setTransactions(trans)
    setLoading(false)
  }

  const loadClassFees = async (className: string) => {
    setLoading(true)
    const { data: students } = await supabase.from('students').select('*').eq('class', className).order('name')
    const { data: trans } = await supabase.from('fee_transactions').select('*').order('created_at', { ascending: false })
    
    const currentMonthStr = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    
    const enriched = (students || []).map(s => {
       const sTrans = (trans || []).filter(t => t.student_id === s.id)
       const hasPaidCurrentMonth = sTrans.some(t => t.payment_for_month === currentMonthStr)
       const totalPaid = sTrans.reduce((sum, t) => sum + t.amount_paid, 0)
       return { ...s, hasPaidCurrentMonth, totalPaid }
    })
    
    setClassStudents(enriched)
    setLoading(false)
  }

  useEffect(() => { loadDashboardData() }, [])

  const filteredStudents = classStudents.filter(s => {
    if (statusFilter === 'paid') return s.hasPaidCurrentMonth
    if (statusFilter === 'unpaid') return !s.hasPaidCurrentMonth
    return true
  })

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar role="admin" />
      <main className="flex-1 ml-0 md:ml-64 min-h-screen p-4 sm:p-10 space-y-6 sm:space-y-10 transition-all duration-300">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-12 sm:pl-0">
          <div className="flex items-center gap-4">
            {selectedClass && (
              <button onClick={() => setSelectedClass(null)} className="p-2 hover:bg-white rounded-2xl transition-all shadow-sm border border-slate-100">
                <ArrowLeft size={20} className="text-slate-900" />
              </button>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {selectedClass ? `${selectedClass} Fee Status` : 'Fees Analytics'}
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Institutional Revenue Tracking</p>
            </div>
          </div>
          <button className="bg-slate-900 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-900/10 w-fit">
            <Download size={16} /> Export Financials
          </button>
        </header>

        <AnimatePresence mode="wait">
          {!selectedClass ? (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 sm:space-y-10">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <SummaryCard label="Total Collection" val={`₹${stats.totalCollected.toLocaleString()}`} icon={<Banknote size={20} />} color="slate" />
                <SummaryCard label="Pending Dues" val={`₹${stats.totalPending.toLocaleString()}`} icon={<Clock size={20} />} color="rose" />
                <SummaryCard label="This Month" val={`₹${stats.monthlyRevenue.toLocaleString()}`} icon={<TrendingUp size={20} />} color="emerald" />
                <SummaryCard label="Full Year Paid" val={stats.fullYearPaid} icon={<UserCheck size={20} />} color="amber" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
                <div className="col-span-1 lg:col-span-2 bg-white rounded-[40px] p-6 sm:p-10 border border-slate-100 shadow-sm">
                   <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-10 flex items-center gap-3">
                      <BarChart3 size={18} className="text-amber-500" /> Class-wise Collection
                   </h2>
                   <div className="space-y-8">
                      {classRevenue.map((c, i) => {
                        const max = Math.max(...classRevenue.map(r => r.value), 1)
                        return (
                          <button 
                            key={i} onClick={() => { setSelectedClass(c.name); loadClassFees(c.name); }}
                            className="w-full text-left group space-y-3"
                          >
                             <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                <span className="text-slate-400 group-hover:text-slate-900 transition-colors">{c.name}</span>
                                <span className="text-slate-900 flex items-center gap-2">₹{c.value.toLocaleString()} <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" /></span>
                             </div>
                             <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${(c.value/max)*100}%` }} className="h-full bg-slate-900 rounded-full" />
                             </div>
                          </button>
                        )
                      })}
                   </div>
                </div>

                <div className="bg-white rounded-[40px] p-6 sm:p-10 border border-slate-100 shadow-sm overflow-hidden">
                   <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-8">Recent Payments</h2>
                   <div className="space-y-6">
                      {transactions.slice(0, 8).map((t, i) => (
                        <div key={i} className="flex items-center justify-between group">
                           <div className="flex items-center gap-4">
                              <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-900 flex items-center justify-center font-black text-[10px]">{t.payment_mode[0]}</div>
                              <div>
                                 <div className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{t.payment_for_month}</div>
                                 <div className="text-[8px] text-slate-400 font-bold uppercase">{t.collected_by}</div>
                              </div>
                           </div>
                           <div className="text-xs font-black text-emerald-600">+₹{t.amount_paid}</div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
               <div className="flex flex-wrap gap-3">
                  <StatusBtn label="All Students" active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} count={classStudents.length} />
                  <StatusBtn label="Paid (Current Month)" active={statusFilter === 'paid'} onClick={() => setStatusFilter('paid')} color="emerald" icon={<CheckCircle2 size={14} />} />
                  <StatusBtn label="Unpaid" active={statusFilter === 'unpaid'} onClick={() => setStatusFilter('unpaid')} color="rose" icon={<XCircle size={14} />} />
               </div>

               <div className="bg-white rounded-[48px] border border-slate-100 shadow-2xl overflow-hidden">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-slate-50/50">
                           <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Profile</th>
                           <th className="px-10 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Plan</th>
                           <th className="px-10 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Paid</th>
                           <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {loading ? (
                           <tr><td colSpan={4} className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-slate-200" size={40} /></td></tr>
                        ) : filteredStudents.length === 0 ? (
                           <tr><td colSpan={4} className="py-24 text-center text-slate-300 font-bold uppercase tracking-widest text-xs italic">No records match this filter.</td></tr>
                        ) : filteredStudents.map((s) => (
                           <tr key={s.id} className="hover:bg-slate-50/50 transition-all">
                              <td className="px-10 py-4 flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-slate-400 border border-slate-100">{s.name[0]}</div>
                                 <div><div className="text-sm font-bold text-slate-900">{s.name}</div><div className="text-[9px] text-slate-400 font-bold uppercase">{s.register_number}</div></div>
                              </td>
                              <td className="px-10 py-4 text-center">
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.payment_plan}</span>
                              </td>
                              <td className="px-10 py-4 text-center font-black text-slate-900 text-sm">₹{s.totalPaid.toLocaleString()}</td>
                              <td className="px-10 py-4 text-right">
                                 <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${s.hasPaidCurrentMonth ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {s.hasPaidCurrentMonth ? 'Paid' : 'Pending'}
                                 </span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

function SummaryCard({ label, val, icon, color }: any) {
  const themes: any = {
    slate: 'bg-slate-900 text-white',
    rose: 'bg-white text-rose-600 border-slate-100',
    emerald: 'bg-white text-emerald-600 border-slate-100',
    amber: 'bg-white text-amber-600 border-slate-100'
  }
  return (
    <div className={`${themes[color]} rounded-[32px] p-8 border shadow-sm relative overflow-hidden group`}>
       <div className="flex items-center justify-between mb-6">
          <div className={`p-3 rounded-2xl ${color === 'slate' ? 'bg-white/10' : 'bg-slate-50'}`}>{icon}</div>
       </div>
       <div className="text-3xl font-black mb-1 leading-none">{val}</div>
       <div className={`text-[9px] font-black uppercase tracking-widest ${color === 'slate' ? 'opacity-40' : 'text-slate-400'}`}>{label}</div>
    </div>
  )
}

function StatusBtn({ label, active, onClick, color = 'slate', icon, count }: any) {
    const themes: any = {
        slate: active ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 hover:text-slate-900',
        emerald: active ? 'bg-emerald-500 text-white' : 'bg-white text-emerald-600 hover:bg-emerald-50',
        rose: active ? 'bg-rose-500 text-white' : 'bg-white text-rose-600 hover:bg-rose-50'
    }
    return (
        <button onClick={onClick} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all border border-slate-100 shadow-sm ${themes[color]}`}>
            {icon} {label} {count !== undefined && <span className="opacity-40">{count}</span>}
        </button>
    )
}
