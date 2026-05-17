'use client'

import React, { useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import Sidebar from '@/components/dashboard/Sidebar'
import { 
  Calendar as CalendarIcon, CheckCircle2, XCircle, 
  Users, Loader2, ChevronRight, Activity, Filter
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function TeacherAttendanceReport() {
  const supabase = createClient()
  const dateInputRef = useRef<HTMLInputElement>(null)
  
  // Dynamic State
  const [assignedClasses, setAssignedClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent'>('all')

  const loadClasses = async () => {
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

  const loadAttendance = async () => {
    if (!selectedClass) return
    setLoading(true)
    const { data: attendanceData } = await supabase
      .from('attendance')
      .select('*, students(name, register_number, gender)')
      .eq('class', selectedClass)
      .eq('date', selectedDate)

    const formatted = (attendanceData || []).map((r: any) => ({
      id: r.id,
      name: r.students?.name || 'Unknown',
      regNo: r.students?.register_number || '-',
      gender: r.students?.gender || 'Male',
      status: r.status
    }))

    setRecords(formatted)
    setLoading(false)
  }

  // Load classes once on mount
  useEffect(() => { loadClasses() }, [])

  // Load attendance when class or date changes
  useEffect(() => {
    if (selectedClass) loadAttendance()
  }, [selectedClass, selectedDate])

  const presentCount = records.filter(r => r.status === 'present').length
  const absentCount = records.filter(r => r.status === 'absent').length
  const filteredRecords = records.filter(r => statusFilter === 'all' ? true : r.status === statusFilter)

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar role="teacher" />
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          background: transparent;
          bottom: 0;
          color: transparent;
          cursor: pointer;
          height: auto;
          left: 0;
          position: absolute;
          right: 0;
          top: 0;
          width: auto;
          height: 100%;
        }
      `}</style>

      <main className="flex-1 ml-64 min-h-screen relative p-10">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Attendance Records</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Institutional Assignment Sync</p>
          </div>
          
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
             <div 
               onClick={() => dateInputRef.current?.showPicker()}
               className="px-4 py-2 flex items-center gap-3 border-r border-slate-100 hover:bg-slate-50 rounded-xl transition-all cursor-pointer relative"
             >
                <CalendarIcon size={16} className="text-slate-500" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                   {new Date(selectedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <input 
                   ref={dateInputRef}
                   type="date" 
                   value={selectedDate} 
                   onChange={e => setSelectedDate(e.target.value)} 
                   className="absolute inset-0 opacity-0 cursor-pointer"
                />
             </div>
             <div className="px-4 py-2 flex items-center gap-2">
                <Filter size={14} className="text-slate-300" />
                <select 
                    value={selectedClass} 
                    onChange={e => setSelectedClass(e.target.value)} 
                    className="bg-transparent text-xs font-black text-slate-900 uppercase tracking-wider border-none focus:ring-0 outline-none cursor-pointer"
                >
                    {assignedClasses.length === 0 ? (
                        <option value="">No Classes Assigned</option>
                    ) : (
                        assignedClasses.map(c => <option key={c.class_name} value={c.class_name}>{c.class_name}</option>)
                    )}
                </select>
             </div>
          </div>
        </header>

        <div className="space-y-10">
          <div className="flex gap-6">
             <StatBox icon={<Activity size={20} />} label="Total Students" value={records.length} isActive={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
             <StatBox icon={<CheckCircle2 size={20} />} label="Present Today" value={presentCount} isActive={statusFilter === 'present'} onClick={() => setStatusFilter('present')} activeColor="bg-emerald-500" />
             <StatBox icon={<XCircle size={20} />} label="Absent Today" value={absentCount} isActive={statusFilter === 'absent'} onClick={() => setStatusFilter('absent')} activeColor="bg-rose-500" />
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between px-2">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                   {statusFilter === 'all' ? 'Complete' : statusFilter} Student List • {selectedClass || 'No Class Selected'}
                </h2>
             </div>

             <div className="grid grid-cols-1 gap-2">
                <AnimatePresence mode="popLayout">
                   {loading ? (
                     <div className="py-24 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="animate-spin text-slate-300" size={32} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fetching Assignments...</span>
                     </div>
                   ) : assignedClasses.length === 0 ? (
                      <div className="py-24 text-center bg-white rounded-[40px] border border-slate-100 shadow-sm">
                         <Users size={48} className="mx-auto text-slate-100 mb-6" />
                         <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">You have no classes assigned yet.</p>
                         <p className="text-[10px] text-slate-300 uppercase mt-2">Assignments are managed by the Administrator.</p>
                      </div>
                   ) : filteredRecords.length === 0 ? (
                      <div className="py-24 text-center text-slate-400 text-sm font-medium">No records found for this selection.</div>
                   ) : filteredRecords.map((r, i) => (
                      <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} className="group bg-white hover:bg-slate-900 rounded-2xl p-4 pl-6 pr-6 border border-slate-100 shadow-sm transition-all duration-200 flex items-center justify-between">
                         <div className="flex items-center gap-5">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base transition-colors group-hover:bg-white/10 group-hover:text-white ${r.status === 'absent' ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-900'}`}>{r.name[0]}</div>
                            <div>
                               <div className="text-base font-bold text-slate-900 group-hover:text-white transition-colors">{r.name}</div>
                               <div className="flex items-center gap-3 mt-0.5">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-400">{r.regNo}</span>
                                  <div className="w-1 h-1 rounded-full bg-slate-200 group-hover:bg-slate-700" />
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-400">{r.gender}</span>
                               </div>
                            </div>
                         </div>
                         <div className="flex items-center gap-6">
                            <div className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${r.status === 'present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-transparent' : 'bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-500 group-hover:text-white group-hover:border-transparent'}`}>{r.status}</div>
                            <ChevronRight size={16} className="text-slate-200 group-hover:text-white transition-colors" />
                         </div>
                      </motion.div>
                   ))}
                </AnimatePresence>
             </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatBox({ icon, label, value, isActive, onClick, activeColor = "bg-slate-900" }: any) {
  return (
    <button onClick={onClick} className={`flex-1 min-w-[200px] p-6 rounded-[24px] border transition-all duration-200 text-left relative overflow-hidden ${isActive ? activeColor + ' text-white border-transparent shadow-xl scale-[1.02]' : 'bg-white text-slate-900 border-slate-100 hover:border-slate-300 shadow-sm'}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${isActive ? 'bg-white/20' : 'bg-slate-50'}`}>{icon}</div>
      <div className="text-3xl font-black mb-1 leading-none">{value}</div>
      <div className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-white/60' : 'text-slate-400'}`}>{label}</div>
    </button>
  )
}
