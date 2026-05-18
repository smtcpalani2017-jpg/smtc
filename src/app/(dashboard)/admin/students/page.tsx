'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Sidebar from '@/components/dashboard/Sidebar'
import { Search, Filter, Eye, Trash2, UserPlus, Download, ChevronDown, Calendar, CheckCircle2, XCircle, AlertCircle, Info, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Student {
  id: string; name: string; register_number: string; class: string
  gender: string; parent_name: string; parent_phone: string
  address: string; join_date: string; created_at: string; created_by?: string
}

export default function AdminStudentsPage() {
  const supabase = createClient()
  const [students, setStudents] = useState<Student[]>([])
  const [filtered, setFiltered] = useState<Student[]>([])
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('All')
  const [genderFilter, setGenderFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Student | null>(null)
  const [attendanceHistory, setAttendanceHistory] = useState<{ date: string; status: string }[]>([])
  const [loadingAttendance, setLoadingAttendance] = useState(false)
  const [classesList, setClassesList] = useState<string[]>(['All'])

  const loadStudents = async () => {
    setLoading(true)
    try {
      // Fetch dynamic classes created by admin
      const { data: classesData } = await supabase
        .from('classes')
        .select('class_name')
        .not('class_name', 'is', null)
      
      if (classesData) {
        const sortedClasses = classesData.map(c => c.class_name).filter(Boolean)
        const uniqueClasses = Array.from(new Set(sortedClasses)).sort()
        setClassesList(['All', ...uniqueClasses])
      } else {
        setClassesList(['All'])
      }
    } catch (e) {
      console.error('Failed to load classes:', e)
      setClassesList(['All'])
    }

    try {
      const { data: activeYear } = await supabase
        .from('academic_years')
        .select('id')
        .eq('status', 'Active')
        .limit(1)
        .maybeSingle()

      if (activeYear) {
        const { data: records, error } = await supabase
          .from('student_academic_records')
          .select('*, students(*)')
          .eq('academic_year_id', activeYear.id)
          .eq('student_status', 'Active')
          .order('created_at', { ascending: false })

        if (!error && records) {
          const mapped: Student[] = records.map((r: any) => ({
            ...r.students,
            class: r.class_name,
            payment_plan: r.payment_plan,
            monthly_fee: r.monthly_fee,
            total_year_fee: r.full_year_fee,
            join_date: r.join_date,
            student_status: r.student_status
          })).filter(r => r && r.id)

          setStudents(mapped)
          setFiltered(mapped)
          setLoading(false)
          return
        }
      }
    } catch (e) {
      console.log('Using direct students fallback:', e)
    }

    const { data } = await supabase.from('students').select('*').order('created_at', { ascending: false })
    setStudents(data || [])
    setFiltered(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadStudents()
    const channel = supabase.channel('students-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, loadStudents)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    if (selected) {
      const fetchAttendance = async () => {
        setLoadingAttendance(true)
        try {
          const { data, error } = await supabase
            .from('attendance')
            .select('date, status')
            .eq('student_id', selected.id)
            .order('date', { ascending: false })
          
          if (!error && data) {
            setAttendanceHistory(data)
          } else {
            setAttendanceHistory([])
          }
        } catch (e) {
          console.error('Failed to load student attendance:', e)
          setAttendanceHistory([])
        }
        setLoadingAttendance(false)
      }
      fetchAttendance()
    } else {
      setAttendanceHistory([])
    }
  }, [selected])

  useEffect(() => {
    let result = [...students]
    if (search) result = result.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.register_number?.toLowerCase().includes(search.toLowerCase()))
    if (classFilter !== 'All') result = result.filter(s => s.class === classFilter)
    if (genderFilter !== 'All') result = result.filter(s => s.gender === genderFilter)
    setFiltered(result)
  }, [search, classFilter, genderFilter, students])

  const deleteStudent = async (id: string) => {
    if (!confirm('Delete this student?')) return
    await supabase.from('students').delete().eq('id', id)
    loadStudents()
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      <Sidebar role="admin" userName="Admin" userEmail="smtcpalani2017@gmail.com" />
      <main className="flex-1 min-w-0 ml-0 md:ml-64 min-h-screen transition-all duration-300">
        <header className="bg-white border-b border-gray-200 min-h-16 py-3 flex items-center justify-between px-4 sm:px-8 pl-16 sm:pl-8 sticky top-0 z-30">
          <div>
            <h1 className="font-serif font-bold text-[#001F3F] text-lg sm:text-xl">Student Management</h1>
            <p className="text-xs text-gray-400">{filtered.length} students found</p>
          </div>
        </header>

        <div className="p-4 sm:p-8 space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-[#001F3F]"
                  placeholder="Search by name or register number..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <select
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-[#001F3F] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                value={classFilter}
                onChange={e => setClassFilter(e.target.value)}
              >
                {classesList.map(c => <option key={c}>{c}</option>)}
              </select>
              <select
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-[#001F3F] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                value={genderFilter}
                onChange={e => setGenderFilter(e.target.value)}
              >
                <option value="All">All Genders</option>
                <option value="Male">Boys</option>
                <option value="Female">Girls</option>
              </select>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: 'Total', val: filtered.length, color: 'bg-[#001F3F] text-white' },
              { label: 'Boys', val: filtered.filter(s => s.gender === 'Male').length, color: 'bg-blue-500 text-white' },
              { label: 'Girls', val: filtered.filter(s => s.gender === 'Female').length, color: 'bg-pink-500 text-white' },
              { label: 'Classes', val: new Set(filtered.map(s => s.class)).size, color: 'bg-[#D4AF37] text-[#001229]' },
            ].map(stat => (
              <div key={stat.label} className={`${stat.color} rounded-2xl p-4 text-center`}>
                <div className="text-xl sm:text-2xl font-black">{stat.val}</div>
                <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-80 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['#', 'Name', 'Reg No.', 'Class', 'Gender', 'Parent', 'Phone', 'Joined', 'Action'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="text-center py-12 text-gray-400">Loading students...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-12 text-gray-400">No students found</td></tr>
                ) : (
                  filtered.map((s, i) => (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${s.gender === 'Male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                            {s.name.charAt(0)}
                          </div>
                          <span className="text-sm font-semibold text-[#001F3F]">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-500">{s.register_number}</td>
                      <td className="px-4 py-3"><span className="text-xs bg-[#001F3F]/10 text-[#001F3F] px-2 py-1 rounded-full font-bold">{s.class}</span></td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-bold ${s.gender === 'Male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>{s.gender}</span></td>
                      <td className="px-4 py-3 text-xs text-gray-600">{s.parent_name}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{s.parent_phone}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{s.join_date ? new Date(s.join_date).toLocaleDateString('en-IN') : '–'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-1">
                          <button onClick={() => setSelected(s)} className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => deleteStudent(s.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
                            <Trash2 size={14} />
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
      </main>

      {/* Student Detail Modal */}
      <AnimatePresence>
        {selected && (() => {
          const totalClasses = attendanceHistory.length
          const absentDays = attendanceHistory.filter(r => r.status === 'absent').length
          const presentDays = attendanceHistory.filter(r => r.status === 'present').length
          const attendanceRate = totalClasses > 0 ? Math.round((presentDays / totalClasses) * 100) : 100

          const formatDate = (dateStr: string) => {
            const parts = dateStr.split('-')
            if (parts.length === 3) {
              const y = parseInt(parts[0], 10)
              const m = parseInt(parts[1], 10) - 1
              const d = parseInt(parts[2], 10)
              return new Date(y, m, d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            }
            return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
          }

          const getWeekday = (dateStr: string) => {
            const parts = dateStr.split('-')
            if (parts.length === 3) {
              const y = parseInt(parts[0], 10)
              const m = parseInt(parts[1], 10) - 1
              const d = parseInt(parts[2], 10)
              return new Date(y, m, d).toLocaleDateString('en-IN', { weekday: 'long' })
            }
            return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'long' })
          }

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
              {/* Overlay */}
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setSelected(null)} 
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" 
              />

              {/* Modal Box */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh]"
                onClick={e => e.stopPropagation()}
              >
                {/* Left Panel: Profile and Info */}
                <div className="bg-slate-50 md:w-5/12 p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 overflow-y-auto">
                  <div className="space-y-6">
                    {/* Modal Header for Mobile */}
                    <div className="flex md:hidden items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Profile</span>
                      <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-full bg-slate-200/50 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors flex items-center justify-center font-bold">✕</button>
                    </div>

                    {/* Avatar & Header Info */}
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black shadow-md border ${selected.gender === 'Male' ? 'bg-blue-100 border-blue-200 text-blue-700' : 'bg-pink-100 border-pink-200 text-pink-700'}`}>
                        {selected.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-serif font-black text-[#001F3F] text-lg sm:text-xl tracking-tight leading-tight">{selected.name}</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-[10px] bg-[#001F3F]/10 text-[#001F3F] px-2 py-0.5 rounded-full font-bold uppercase">{selected.class}</span>
                          <span className="text-[10px] bg-slate-200/60 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide font-mono">{selected.register_number}</span>
                        </div>
                      </div>
                    </div>

                    {/* General Details Listing */}
                    <div className="space-y-3.5 pt-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Personal Information</h4>
                      {[
                        { label: 'Gender', val: selected.gender, color: selected.gender === 'Male' ? 'text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-bold text-xs' : 'text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md font-bold text-xs' },
                        { label: 'Parent Name', val: selected.parent_name },
                        { label: 'Primary Contact', val: selected.parent_phone },
                        { label: 'WhatsApp', val: (selected as any).whatsapp_number || selected.parent_phone },
                        { label: 'Home Address', val: selected.address, className: 'text-xs text-right whitespace-pre-line leading-relaxed max-w-[200px]' },
                        { label: 'Joined Academy', val: selected.join_date ? new Date(selected.join_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '–' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start py-2.5 border-b border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase pt-0.5">{item.label}</span>
                          <span className={item.color || item.className || "text-sm text-[#001F3F] font-semibold text-right"}>{item.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Close Button for Desktop */}
                  <div className="hidden md:block pt-6">
                    <button 
                      onClick={() => setSelected(null)} 
                      className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl transition-all duration-200"
                    >
                      Close Profile
                    </button>
                  </div>
                </div>

                {/* Right Panel: Attendance Report */}
                <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-none">
                  <div className="space-y-6">
                    {/* Section Title */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={14} className="text-[#D4AF37]" /> Attendance & Presence Report
                      </h3>
                      {/* Close Cross for Desktop only */}
                      <button onClick={() => setSelected(null)} className="hidden md:flex w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors items-center justify-center font-bold">✕</button>
                    </div>

                    {loadingAttendance ? (
                      <div className="py-20 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="animate-spin text-slate-300" size={32} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fetching presence logs...</span>
                      </div>
                    ) : (
                      <>
                        {/* Attendance stats cards */}
                        <div className="grid grid-cols-3 gap-3">
                          {/* Presence Rate Card */}
                          <div className={`p-3.5 rounded-2xl border text-center flex flex-col justify-center items-center ${
                            totalClasses === 0 
                              ? 'bg-slate-50 border-slate-100 text-slate-400' 
                              : absentDays === 0
                              ? 'bg-amber-50 border-amber-100 text-[#D4AF37]'
                              : (presentDays / totalClasses) >= 0.8
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                              : 'bg-rose-50 border-rose-100 text-rose-600'
                          }`}>
                            <div className="text-xl sm:text-2xl font-black leading-none">
                              {totalClasses === 0 ? '—' : `${attendanceRate}%`}
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-wider mt-1 opacity-70">Presence</span>
                          </div>

                          {/* Total Classes Conducted */}
                          <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 text-slate-700 text-center flex flex-col justify-center items-center">
                            <div className="text-xl sm:text-2xl font-black leading-none">{totalClasses}</div>
                            <span className="text-[8px] font-black uppercase tracking-wider mt-1 opacity-70">Total Days</span>
                          </div>

                          {/* Days Absent Card */}
                          <div className={`p-3.5 rounded-2xl border text-center flex flex-col justify-center items-center ${
                            absentDays > 0
                              ? 'bg-rose-50 border-rose-100 text-rose-600'
                              : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                          }`}>
                            <div className="text-xl sm:text-2xl font-black leading-none">
                              {absentDays}
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-wider mt-1 opacity-70">Absences</span>
                          </div>
                        </div>

                        {/* Visual progress bar */}
                        {totalClasses > 0 && (
                          <div className="space-y-1 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                            <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              <span>Attendance Progress</span>
                              <span className="text-slate-700 font-bold">
                                {presentDays} of {totalClasses} Sessions
                              </span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                              <div 
                                className="bg-emerald-500 h-full transition-all duration-500" 
                                style={{ width: `${(presentDays / totalClasses) * 100}%` }} 
                              />
                              <div 
                                className="bg-rose-500 h-full transition-all duration-500" 
                                style={{ width: `${(absentDays / totalClasses) * 100}%` }} 
                              />
                            </div>
                          </div>
                        )}

                        {/* Absence List Section */}
                        <div className="space-y-3 pt-2">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Absence Dates Log</h4>
                          
                          {totalClasses === 0 ? (
                            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                              <Info size={24} className="mx-auto text-slate-300 mb-2" />
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">No Attendance Logs Available</p>
                              <p className="text-[9px] text-slate-350 uppercase mt-1">This student has not been marked in any attendance sheet yet.</p>
                            </div>
                          ) : absentDays === 0 ? (
                            <div className="p-8 text-center bg-amber-50/50 rounded-2xl border border-amber-100/70 flex flex-col items-center justify-center">
                              <span className="text-2xl mb-1.5">🌟</span>
                              <p className="text-xs font-black text-amber-700 uppercase tracking-wider">100% Perfect Attendance!</p>
                              <p className="text-[9px] text-amber-600/70 uppercase mt-0.5">This student has been present for all recorded class sessions.</p>
                            </div>
                          ) : (
                            <div className="max-h-[220px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                              {attendanceHistory
                                .filter(r => r.status === 'absent')
                                .map((record, index) => (
                                  <div key={index} className="flex items-center justify-between p-3 bg-rose-50/50 hover:bg-rose-50 border border-rose-100/40 rounded-xl transition-all">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                                        <XCircle size={16} />
                                      </div>
                                      <div>
                                        <div className="text-sm font-bold text-rose-950">
                                          {formatDate(record.date)}
                                        </div>
                                        <div className="text-[9px] text-rose-500 font-bold uppercase tracking-wider">
                                          {getWeekday(record.date)}
                                        </div>
                                      </div>
                                    </div>
                                    <span className="bg-rose-500 text-white px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-wider shadow-sm">
                                      Absent
                                    </span>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Close Button for Mobile only */}
                  <div className="block md:hidden pt-6">
                    <button 
                      onClick={() => setSelected(null)} 
                      className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl transition-all duration-200"
                    >
                      Close Profile
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )
        })()}
      </AnimatePresence>
    </div>
  )
}
