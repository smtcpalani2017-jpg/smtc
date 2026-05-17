'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Sidebar from '@/components/dashboard/Sidebar'
import { 
  ArrowLeft, CheckCircle2, XCircle, Loader2, 
  GraduationCap, Check, Banknote, User, Clock,
  Trophy, BookOpen, ChevronRight, BarChart3, Search, Save
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function MyClasses() {
  const supabase = createClient()
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [students, setStudents] = useState<any[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, string>>({})
  const [paidMonths, setPaidMonths] = useState<Record<string, boolean>>({})
  const [testResults, setTestResults] = useState<any[]>([])
  const [selectedTest, setSelectedTest] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState<'mgmt' | 'results'>('mgmt')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [savingAttendance, setSavingAttendance] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const currentMonthStr = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  const loadClasses = async () => {
    setLoading(true)
    
    // Fetch ALL admin classes for all staff
    const { data: allAdminClasses } = await supabase
      .from('classes')
      .select('*')
      .not('class_name', 'is', null)

    const classStats = await Promise.all((allAdminClasses || []).map(async (cls) => {
      const { count } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('class', cls.class_name)
      
      return { 
        name: cls.class_name, 
        total: count || 0 
      }
    }))

    setClasses(classStats)
    setLoading(false)
  }

  const loadStudents = async (className: string) => {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    
    const [studentsRes, attendanceRes, transactionsRes, marksRes] = await Promise.all([
      supabase.from('students').select('*').eq('class', className).order('name'),
      supabase.from('attendance').select('student_id, status').eq('class', className).eq('date', today),
      supabase.from('fee_transactions').select('student_id').eq('payment_for_month', currentMonthStr),
      supabase.from('marks').select('*, students(name, register_number, class)').eq('students.class', className).order('created_at', { ascending: false })
    ])

    const attMap: Record<string, string> = {}
    attendanceRes.data?.forEach(record => { attMap[record.student_id] = record.status })

    const paidMap: Record<string, boolean> = {}
    transactionsRes.data?.forEach(t => { paidMap[t.student_id] = true })

    const groupedMarks: any = {}
    marksRes.data?.forEach(m => {
        if (!m.students) return
        if (!groupedMarks[m.test_name]) groupedMarks[m.test_name] = { 
            name: m.test_name, subject: m.subject, 
            date: new Date(m.created_at).toLocaleDateString('en-IN'),
            outOf: m.out_of || 100, scores: [] 
        }
        groupedMarks[m.test_name].scores.push({ student: m.students.name, regNo: m.students.register_number, mark: m.marks })
    })

    setStudents(studentsRes.data || [])
    setAttendanceRecords(attMap)
    setPaidMonths(paidMap)
    setTestResults(Object.values(groupedMarks))
    setLoading(false)
  }

  useEffect(() => { loadClasses() }, [])

  const toggleAttendance = (studentId: string) => {
    const currentStatus = attendanceRecords[studentId]
    const nextStatus = currentStatus === 'present' ? 'absent' : 'present'
    setAttendanceRecords(prev => ({ ...prev, [studentId]: nextStatus }))
  }

  const handleSaveAttendance = async () => {
    if (!selectedClass) return
    setSavingAttendance(true)
    const today = new Date().toISOString().split('T')[0]
    
    const payload = Object.entries(attendanceRecords).map(([studentId, status]) => ({
      student_id: studentId,
      class: selectedClass,
      date: today,
      status: status,
      marked_by: 'Teacher'
    }))

    const { error } = await supabase.from('attendance').upsert(payload, { onConflict: 'student_id,date' })

    if (!error) {
      setSuccessMsg('Attendance saved successfully!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } else {
      alert('Error saving attendance: ' + error.message)
    }
    setSavingAttendance(false)
  }

  const recordPayment = async (student: any) => {
    setActionLoading(student.id + '_fee')
    const { error } = await supabase.from('fee_transactions').insert({
      student_id: student.id, amount_paid: student.monthly_fee || 0,
      payment_for_month: currentMonthStr, collected_by: 'Staff'
    })
    if (!error) setPaidMonths(prev => ({ ...prev, [student.id]: true }))
    setActionLoading(null)
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar role="teacher" />
      <main className="flex-1 ml-64 min-h-screen">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 h-20 flex items-center justify-between px-10 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {(selectedClass || selectedTest) && (
              <button onClick={() => { if (selectedTest) setSelectedTest(null); else setSelectedClass(null); }} className="p-2 hover:bg-slate-50 rounded-2xl transition-all">
                <ArrowLeft size={20} className="text-slate-400" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{selectedTest ? selectedTest.name : (selectedClass || 'My Classes')}</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{selectedTest ? `${selectedTest.subject} • ${selectedTest.date}` : currentMonthStr}</p>
            </div>
          </div>
          {selectedClass && !selectedTest && (
              <div className="flex items-center gap-4">
                  {activeTab === 'mgmt' && (
                      <button onClick={handleSaveAttendance} disabled={savingAttendance} className="bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center gap-2">
                         {savingAttendance ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                         {savingAttendance ? 'Saving...' : 'Save Attendance'}
                      </button>
                  )}
                  <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 shadow-inner border border-slate-200/50">
                      <button onClick={() => setActiveTab('mgmt')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'mgmt' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Management</button>
                      <button onClick={() => setActiveTab('results')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'results' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Test Results</button>
                  </div>
              </div>
          )}
        </header>

        <div className="p-10">
          {successMsg && (
             <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-emerald-50 border border-emerald-100 text-emerald-600 p-4 rounded-2xl text-xs font-bold flex items-center gap-3"><CheckCircle2 size={18} /> {successMsg}</motion.div>
          )}

          <AnimatePresence mode="wait">
            {!selectedClass ? (
              <motion.div key="classes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-32 text-center"><Loader2 className="animate-spin mx-auto text-slate-200" size={48} /></div>
                ) : classes.length === 0 ? (
                    <div className="col-span-full py-32 text-center bg-white rounded-[40px] border border-slate-100 shadow-sm">
                        <GraduationCap size={48} className="mx-auto text-slate-100 mb-6" />
                        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No classes found.</p>
                        <p className="text-[9px] text-slate-300 uppercase mt-2">Classes are managed by the Administrator.</p>
                    </div>
                ) : classes.map((cls) => (
                  <button key={cls.name} onClick={() => { setSelectedClass(cls.name); loadStudents(cls.name); }} className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm hover:shadow-2xl hover:border-slate-900 transition-all group text-left relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                    <div className="bg-slate-900 text-white p-4 rounded-2xl inline-block mb-6 relative z-10 shadow-lg"><GraduationCap size={24} /></div>
                    <h3 className="text-xl font-black text-slate-900 mb-2 relative z-10">{cls.name}</h3>
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest relative z-10">{cls.total} Active Students</div>
                  </button>
                ))}
              </motion.div>
            ) : activeTab === 'mgmt' ? (
              <motion.div key="students" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-[48px] border border-slate-100 shadow-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-50">
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Profile</th>
                      <th className="px-10 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendance</th>
                      <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Fee Collection</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr><td colSpan={3} className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" /></td></tr>
                    ) : students.length === 0 ? (
                      <tr><td colSpan={3} className="py-24 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No students found in {selectedClass}</td></tr>
                    ) : students.map((s) => {
                      const status = attendanceRecords[s.id]
                      const isPaid = paidMonths[s.id] || s.fee_status === 'Paid'
                      return (
                        <tr key={s.id} className={`transition-colors ${status === 'absent' ? 'bg-rose-50/20' : 'hover:bg-slate-50/30'}`}>
                          <td className="px-10 py-4">
                            <div className="flex items-center gap-5">
                              <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center font-bold text-lg border ${status === 'absent' ? 'bg-rose-100 border-rose-200 text-rose-600' : 'bg-slate-50 border-slate-100 text-slate-900'}`}>{s.name[0]}</div>
                              <div>
                                <div className={`text-base font-bold ${status === 'absent' ? 'text-rose-700' : 'text-slate-900'}`}>{s.name}</div>
                                <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{s.register_number}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-4">
                             <div className="flex justify-center">
                               <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/40 shadow-inner max-w-[180px]">
                                 <button 
                                   onClick={() => setAttendanceRecords(prev => ({ ...prev, [s.id]: 'present' }))}
                                   className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-200 ${status === 'present' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 font-black scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
                                 >
                                   Present
                                 </button>
                                 <button 
                                   onClick={() => setAttendanceRecords(prev => ({ ...prev, [s.id]: 'absent' }))}
                                   className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-200 ${status === 'absent' ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 font-black scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
                                 >
                                   Absent
                                 </button>
                               </div>
                             </div>
                          </td>
                          <td className="px-10 py-4 text-right">
                             {isPaid ? (
                               <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-6 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                  <Check size={14} strokeWidth={4} /> PAID
                               </div>
                             ) : (
                               <button onClick={() => recordPayment(s)} disabled={actionLoading === s.id + '_fee'} className="bg-rose-50 text-rose-600 px-6 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all border border-rose-100 flex items-center gap-2 ml-auto">
                                  <Clock size={14} /> {actionLoading === s.id + '_fee' ? 'Wait' : 'Mark Paid'}
                                </button>
                             )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </motion.div>
            ) : (
                <motion.div key="test-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testResults.length === 0 ? (
                        <div className="col-span-full py-32 text-center bg-white rounded-[40px] border border-slate-100 shadow-sm">
                            <BookOpen size={48} className="mx-auto text-slate-100 mb-6" />
                            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No tests recorded.</p>
                        </div>
                    ) : testResults.map((test: any, i: number) => (
                        <button key={i} onClick={() => setSelectedTest(test)} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-900 transition-all text-left group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="bg-slate-50 text-slate-900 p-3 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-colors"><Trophy size={20} /></div>
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{test.date}</div>
                            </div>
                            <h3 className="text-lg font-black text-slate-900 mb-1">{test.name}</h3>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{test.subject}</div>
                            <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-50">
                                <span className="text-[10px] font-black text-slate-900 uppercase">Out of {test.outOf}</span>
                                <ChevronRight size={16} className="text-slate-200 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                            </div>
                        </button>
                    ))}
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
