'use client'

import React, { useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import Sidebar from '@/components/dashboard/Sidebar'
import { 
  Calendar as CalendarIcon, CheckCircle2, XCircle, 
  TrendingUp, AlertCircle, Loader2, Filter, 
  Users, MousePointer2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminAttendanceDashboard() {
  const supabase = createClient()
  const dateInputRef = useRef<HTMLInputElement>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedClass, setSelectedClass] = useState('All')
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent'>('all')
  const [classes, setClasses] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ present: 0, absent: 0, rate: 0 })
  const [classWiseData, setClassWiseData] = useState<any[]>([])
  const [attendanceLog, setAttendanceLog] = useState<any[]>([])

  const loadAttendance = async () => {
    setLoading(true)
    const { data: classesData } = await supabase.from('classes').select('class_name')
    const classNames = classesData?.map(c => c.class_name) || []
    setClasses(classNames)

    const { data: attendanceData } = await supabase
      .from('attendance')
      .select('*, students(name, register_number)')
      .eq('date', selectedDate)

    const logs = (attendanceData || []).map((r: any) => ({
      id: r.id,
      name: r.students?.name || 'Unknown',
      regNo: r.students?.register_number || '-',
      class: r.class,
      status: r.status
    }))

    setAttendanceLog(logs)
    const present = logs.filter(r => r.status === 'present').length
    const absent = logs.filter(r => r.status === 'absent').length
    setStats({ present, absent, rate: logs.length > 0 ? Math.round((present / logs.length) * 100) : 0 })

    const classStats = classNames.map(name => {
       const classRecords = logs.filter(r => r.class === name)
       const p = classRecords.filter(r => r.status === 'present').length
       return { name, percentage: classRecords.length > 0 ? Math.round((p / classRecords.length) * 100) : 0, total: classRecords.length }
    })
    setClassWiseData(classStats)
    setLoading(false)
  }

  useEffect(() => { loadAttendance() }, [selectedDate])

  const filteredLog = attendanceLog.filter(l => {
    const matchesClass = selectedClass === 'All' || l.class === selectedClass
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter
    return matchesClass && matchesStatus
  })

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar role="admin" />
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          background: transparent; bottom: 0; color: transparent; cursor: pointer;
          height: auto; left: 0; position: absolute; right: 0; top: 0; width: auto;
        }
        input[type="date"]::-webkit-inner-spin-button,
        input[type="date"]::-webkit-clear-button { display: none; -webkit-appearance: none; }
      `}</style>

      <main className="flex-1 ml-0 md:ml-64 min-h-screen p-4 sm:p-10 space-y-6 sm:space-y-8 transition-all duration-300">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-12 sm:pl-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Attendance Center</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Institutional Presence Report</p>
          </div>
          
          <div 
            onClick={() => dateInputRef.current?.showPicker()}
            className="bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 cursor-pointer hover:border-slate-400 transition-all relative w-fit"
          >
             <CalendarIcon size={14} className="text-slate-500" />
             <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">
                {new Date(selectedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
             </span>
             <input ref={dateInputRef} type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
        </header>

        {/* Interaction Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
           <SummaryCard 
              label="Total Intake" value={stats.present + stats.absent} icon={<Users size={20} />} 
              isActive={statusFilter === 'all'} onClick={() => setStatusFilter('all')} color="slate"
           />
           <SummaryCard 
              label="Present Today" value={stats.present} icon={<CheckCircle2 size={20} />} 
              isActive={statusFilter === 'present'} onClick={() => setStatusFilter('present')} color="emerald"
           />
           <SummaryCard 
              label="Absent Today" value={stats.absent} icon={<XCircle size={20} />} 
              isActive={statusFilter === 'absent'} onClick={() => setStatusFilter('absent')} color="rose"
           />
        </div>

        {/* Compact Analytics & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
           <div className="lg:col-span-2 bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 border border-slate-100 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                 <TrendingUp size={14} className="text-emerald-500" /> Class-wise Analytics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4">
                 {classWiseData.map((cls, i) => (
                    <div key={i} className="space-y-1.5">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{cls.name}</span>
                          <span className="text-[10px] font-black text-slate-900">{cls.percentage}%</span>
                       </div>
                       <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${cls.percentage}%` }} className={`h-full rounded-full ${cls.percentage >= 80 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-rose-50 rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 border border-rose-100 flex flex-col justify-center items-center text-center">
              <AlertCircle size={24} className="text-rose-500 mb-3" />
              <h3 className="text-[10px] font-black text-rose-700 uppercase tracking-widest mb-1">Defaulter Alert</h3>
              <p className="text-[9px] font-bold text-rose-600/60 leading-tight mb-4">Classes below 80% attendance</p>
              <div className="text-3xl font-black text-rose-700 leading-none mb-1">{classWiseData.filter(c => c.percentage < 80 && c.total > 0).length}</div>
              <div className="text-[8px] font-black uppercase tracking-widest text-rose-400">Critical Units</div>
           </div>
        </div>

        {/* Detailed Activity Log */}
        <div className="bg-white rounded-[32px] sm:rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
           <div className="p-4 sm:p-8 border-b border-slate-50 bg-slate-50/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Attendance Activity Log</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{statusFilter.toUpperCase()} / {selectedClass.toUpperCase()}</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl">
                 <Filter size={12} className="text-slate-400" />
                 <select 
                    value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
                    className="bg-transparent text-[10px] font-black text-slate-700 uppercase tracking-wider focus:ring-0 outline-none border-none p-0 cursor-pointer"
                 >
                    <option value="All">All Classes</option>
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
              </div>
           </div>
           
           <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="px-10 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Student Profile</th>
                       <th className="px-10 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Class</th>
                       <th className="px-10 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    <AnimatePresence mode="popLayout">
                       {loading ? (
                         <tr><td colSpan={3} className="py-20 text-center text-slate-300">Loading...</td></tr>
                       ) : filteredLog.length === 0 ? (
                         <tr><td colSpan={3} className="py-24 text-center text-slate-300 italic text-xs">No records found.</td></tr>
                       ) : filteredLog.map((r, i) => (
                          <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-50/30 transition-colors">
                             <td className="px-10 py-3">
                                <div className="flex items-center gap-4">
                                   <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${r.status === 'absent' ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-900'}`}>{r.name[0]}</div>
                                   <div>
                                      <div className="text-sm font-bold text-slate-900">{r.name}</div>
                                      <div className="text-[9px] font-bold text-slate-400 uppercase">{r.regNo}</div>
                                   </div>
                                </div>
                             </td>
                             <td className="px-10 py-3 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">{r.class}</td>
                             <td className="px-10 py-3 text-right">
                                <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${r.status === 'present' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                   {r.status}
                                </span>
                             </td>
                          </motion.tr>
                       ))}
                    </AnimatePresence>
                 </tbody>
              </table>
           </div>
        </div>
      </main>
    </div>
  )
}

function SummaryCard({ label, value, icon, isActive, onClick, color }: any) {
  const themes: any = {
    slate: isActive ? 'bg-slate-900 text-white shadow-xl scale-[1.02]' : 'bg-white text-slate-900 border-slate-100 hover:border-slate-300',
    emerald: isActive ? 'bg-emerald-500 text-white shadow-xl scale-[1.02]' : 'bg-white text-emerald-600 border-slate-100 hover:border-emerald-500',
    rose: isActive ? 'bg-rose-500 text-white shadow-xl scale-[1.02]' : 'bg-white text-rose-600 border-slate-100 hover:border-rose-500'
  }

  return (
    <button onClick={onClick} className={`text-left rounded-[28px] p-6 transition-all duration-300 border shadow-sm relative overflow-hidden flex items-center gap-4 ${themes[color]}`}>
       <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isActive ? 'bg-white/10' : 'bg-slate-50'}`}>{icon}</div>
       <div>
          <div className="text-3xl font-black mb-0.5 leading-none">{value}</div>
          <div className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-white/40' : 'text-slate-400'}`}>{label}</div>
       </div>
    </button>
  )
}
