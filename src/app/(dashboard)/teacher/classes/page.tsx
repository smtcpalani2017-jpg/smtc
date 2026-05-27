'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Sidebar from '@/components/dashboard/Sidebar'
import { 
  ArrowLeft, CheckCircle2, XCircle, Loader2, 
  GraduationCap, Check, Banknote, User, Clock,
  Trophy, BookOpen, ChevronRight, BarChart3, Search, Save, Trash, X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function MyClasses() {
  const supabase = createClient()
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [students, setStudents] = useState<any[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, string>>({})
  const [paidMonths, setPaidMonths] = useState<Record<string, boolean>>({})
  const [yearlyPaidMap, setYearlyPaidMap] = useState<Record<string, number>>({})
  const [showPayModal, setShowPayModal] = useState<any | null>(null)
  const [payAmount, setPayAmount] = useState<string>('')
  const [testResults, setTestResults] = useState<any[]>([])
  const [selectedTest, setSelectedTest] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState<'mgmt' | 'results'>('mgmt')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [savingAttendance, setSavingAttendance] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [absentStudentsForAlert, setAbsentStudentsForAlert] = useState<any[]>([])
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [alertStatuses, setAlertStatuses] = useState<Record<string, 'pending' | 'sending' | 'sent' | 'failed'>>({})
  const [sequenceIndex, setSequenceIndex] = useState<number>(-1)
  const [hasOpenedCurrent, setHasOpenedCurrent] = useState<boolean>(false)

  const currentMonthStr = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  const loadClasses = async () => {
    setLoading(true)
    
    // Fetch ALL admin classes for all staff
    const { data: allAdminClasses } = await supabase
      .from('classes')
      .select('*')
      .not('class_name', 'is', null)

    // Get active academic year
    const { data: activeYear } = await supabase
      .from('academic_years')
      .select('id')
      .eq('status', 'Active')
      .limit(1)
      .maybeSingle()

    const classStats = await Promise.all((allAdminClasses || []).map(async (cls) => {
      let count = 0
      if (activeYear) {
        const { count: recordCount } = await supabase
          .from('student_academic_records')
          .select('*', { count: 'exact', head: true })
          .eq('academic_year_id', activeYear.id)
          .eq('class_name', cls.class_name)
          .eq('student_status', 'Active')
        count = recordCount || 0
      } else {
        const { count: fallbackCount } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('class', cls.class_name)
        count = fallbackCount || 0
      }
      
      return { 
        name: cls.class_name, 
        total: count
      }
    }))

    setClasses(classStats)
    setLoading(false)
  }

  const loadStudents = async (className: string) => {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    
    // Get active academic year
    const { data: activeYear } = await supabase
      .from('academic_years')
      .select('id')
      .eq('status', 'Active')
      .limit(1)
      .maybeSingle()

    let studentsData: any[] = []
    
    if (activeYear) {
      const { data: records } = await supabase
        .from('student_academic_records')
        .select('*, students(*)')
        .eq('academic_year_id', activeYear.id)
        .eq('class_name', className)
        .eq('student_status', 'Active')
        .order('created_at', { ascending: false })
      
      if (records) {
        studentsData = records.map((r: any) => ({
          ...r.students,
          class: r.class_name,
          payment_plan: r.payment_plan,
          monthly_fee: r.monthly_fee,
          total_year_fee: r.full_year_fee,
          join_date: r.join_date,
          student_status: r.student_status
        })).filter(s => s && s.id)
      }
    } else {
      const { data } = await supabase
        .from('students')
        .select('*')
        .eq('class', className)
        .order('name')
      studentsData = data || []
    }

    const studentIds = studentsData.map(s => s.id)

    // Fetch attendance, transactions, marks for these student IDs to ensure we only get their records
    const [attendanceRes, transactionsRes, marksRes] = await Promise.all([
      supabase.from('attendance').select('student_id, status').eq('class', className).eq('date', today).in('student_id', studentIds.length > 0 ? studentIds : ['']),
      supabase.from('fee_transactions').select('student_id, amount_paid, payment_for_month').in('student_id', studentIds.length > 0 ? studentIds : ['']),
      supabase.from('marks').select('*, students(name, register_number, class)').in('student_id', studentIds.length > 0 ? studentIds : ['']).order('created_at', { ascending: false })
    ])

    const attMap: Record<string, string> = {}
    
    // Default all students to present
    studentsData.forEach(s => {
      attMap[s.id] = 'present'
    })
    
    // Override with saved records if any exist for today
    attendanceRes.data?.forEach(record => { attMap[record.student_id] = record.status })

    // Compute monthly paid map and yearly total paid map
    const paidMap: Record<string, boolean> = {}
    const yearlyMap: Record<string, number> = {}
    transactionsRes.data?.forEach(t => {
      if (t.payment_for_month === currentMonthStr) {
        paidMap[t.student_id] = true
      }
      yearlyMap[t.student_id] = (yearlyMap[t.student_id] || 0) + (t.amount_paid || 0)
    })

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

    setStudents(studentsData)
    setAttendanceRecords(attMap)
    setPaidMonths(paidMap)
    setYearlyPaidMap(yearlyMap)
    setTestResults(Object.values(groupedMarks))
    setLoading(false)
  }

  useEffect(() => { loadClasses() }, [])

  const toggleAttendance = (studentId: string) => {
    const currentStatus = attendanceRecords[studentId]
    const nextStatus = currentStatus === 'present' ? 'absent' : 'present'
    setAttendanceRecords(prev => ({ ...prev, [studentId]: nextStatus }))
  }

  const getWhatsAppUrl = (student: any) => {
    const phone = student.whatsapp_number || student.parent_phone || ''
    let cleanPhone = phone.replace(/[^0-9]/g, '')
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone
    }
    const todayStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    const text = `அன்பார்ந்த பெற்றோருக்கு,\nஉங்கள் குழந்தை *${student.name}* இன்று (${todayStr}) SMTC பயிற்சி வகுப்பிற்கு வரவில்லை. தயவுசெய்து தினசரி வகுப்பிற்கு வருவதை உறுதிப்படுத்தவும்.\n\n- SMTC பயிற்சி மையம்`
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`
  }

  const triggerAutomaticAlerts = async (absents: any[]) => {
    // Reset sequencer states when starting a new batch
    setSequenceIndex(-1)
    setHasOpenedCurrent(false)
    
    const statuses: Record<string, 'pending' | 'sending' | 'sent' | 'failed'> = {}
    absents.forEach(s => { statuses[s.id] = 'sending' })
    setAlertStatuses(statuses)

    for (const s of absents) {
      try {
        const res = await fetch('/api/send-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentName: s.name,
            parentName: s.parent_name,
            phone: s.whatsapp_number || s.parent_phone || ''
          })
        })
        const data = await res.json()
        if (data.success) {
          setAlertStatuses(prev => ({ ...prev, [s.id]: 'sent' }))
        } else {
          setAlertStatuses(prev => ({ ...prev, [s.id]: 'failed' }))
        }
      } catch (err) {
        setAlertStatuses(prev => ({ ...prev, [s.id]: 'failed' }))
      }
    }
  }

  const startSequence = () => {
    setSequenceIndex(0)
    setHasOpenedCurrent(false)
  }

  const handleOpenCurrent = () => {
    const student = absentStudentsForAlert[sequenceIndex]
    if (!student) return
    const url = getWhatsAppUrl(student)
    window.open(url, '_blank')
    setHasOpenedCurrent(true)
    setAlertStatuses(prev => ({ ...prev, [student.id]: 'sent' }))
  }

  const handleNextInSequence = () => {
    if (sequenceIndex < absentStudentsForAlert.length - 1) {
      setSequenceIndex(prev => prev + 1)
      setHasOpenedCurrent(false)
    } else {
      setSequenceIndex(-1)
      setShowAlertModal(false)
      setSuccessMsg('All WhatsApp alerts processed!')
      setTimeout(() => setSuccessMsg(''), 3000)
    }
  }

  const handleSaveAttendance = async () => {
    if (!selectedClass) return
    setSavingAttendance(true)
    const today = new Date().toISOString().split('T')[0]
    
    // Get active academic year
    const { data: activeYear } = await supabase
      .from('academic_years')
      .select('id')
      .eq('status', 'Active')
      .limit(1)
      .maybeSingle()

    const payload = Object.entries(attendanceRecords).map(([studentId, status]) => ({
      student_id: studentId,
      class: selectedClass,
      date: today,
      status: status,
      marked_by: 'Teacher',
      ...(activeYear ? { academic_year_id: activeYear.id } : {})
    }))

    const { error } = await supabase.from('attendance').upsert(payload, { onConflict: 'student_id,date' })

    if (!error) {
      setSuccessMsg('Attendance saved successfully!')
      const absents = students.filter(s => attendanceRecords[s.id] === 'absent')
      if (absents.length > 0) {
        setAbsentStudentsForAlert(absents)
        setShowAlertModal(true)
        triggerAutomaticAlerts(absents)
      }
      setTimeout(() => setSuccessMsg(''), 3000)
    } else {
      alert('Error saving attendance: ' + error.message)
    }
    setSavingAttendance(false)
  }

  const openPayModal = (student: any) => {
    const isYearly = student.payment_plan === 'Yearly'
    const totalFee = isYearly ? (student.total_year_fee || 0) : (student.monthly_fee || 0)
    const alreadyPaid = isYearly ? (yearlyPaidMap[student.id] || 0) : 0
    const remaining = isYearly ? Math.max(totalFee - alreadyPaid, 0) : totalFee
    setPayAmount(String(remaining))
    setShowPayModal(student)
  }

  const recordPayment = async (student: any, amount: number) => {
    setActionLoading(student.id + '_fee')
    
    // Get active academic year
    const { data: activeYear } = await supabase
      .from('academic_years')
      .select('id')
      .eq('status', 'Active')
      .limit(1)
      .maybeSingle()

    const { error } = await supabase.from('fee_transactions').insert({
      student_id: student.id, 
      amount_paid: amount,
      payment_for_month: currentMonthStr, 
      collected_by: 'Staff',
      ...(activeYear ? { academic_year_id: activeYear.id } : {})
    })
    if (!error) {
      setPaidMonths(prev => ({ ...prev, [student.id]: true }))
      setYearlyPaidMap(prev => ({ ...prev, [student.id]: (prev[student.id] || 0) + amount }))
      setShowPayModal(null)
      setSuccessMsg(`₹${amount} payment recorded for ${student.name}!`)
      setTimeout(() => setSuccessMsg(''), 3000)
    }
    setActionLoading(null)
  }

  const handleDeleteTest = async (testName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!selectedClass) return
    if (!confirm(`Are you sure you want to delete "${testName}"? This will delete all student scores for this test permanently across the entire portal.`)) return
    
    setActionLoading(testName + '_delete')
    try {
      const studentIds = students.map(s => s.id)
      if (studentIds.length === 0) {
        alert("Cannot delete test: no students found in this class.")
        setActionLoading(null)
        return
      }

      const { error } = await supabase
        .from('marks')
        .delete()
        .eq('test_name', testName)
        .in('student_id', studentIds)

      if (error) {
        alert("Error deleting test: " + error.message)
        return false
      } else {
        setSuccessMsg(`Test "${testName}" deleted successfully!`)
        // Reload students and grouped test results
        await loadStudents(selectedClass)
        setTimeout(() => setSuccessMsg(''), 3000)
        return true
      }
    } catch (err: any) {
      alert("Error: " + err.message)
    }
    setActionLoading(null)
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar role="teacher" />
      <main className="flex-1 ml-0 md:ml-64 min-h-screen transition-all duration-300">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 min-h-20 py-3 flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-10 pl-16 sm:pl-10 gap-3 sticky top-0 z-30">
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
              <div className="flex flex-wrap items-center gap-3">
                  {activeTab === 'mgmt' && (
                      <button onClick={handleSaveAttendance} disabled={savingAttendance} className="bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center gap-2">
                         {savingAttendance ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                         {savingAttendance ? 'Saving...' : 'Save Attendance'}
                      </button>
                  )}
                  <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 shadow-inner border border-slate-200/50 w-fit">
                      <button onClick={() => setActiveTab('mgmt')} className={`px-4 sm:px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'mgmt' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Management</button>
                      <button onClick={() => setActiveTab('results')} className={`px-4 sm:px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'results' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Test Results</button>
                  </div>
              </div>
          )}
        </header>

        <div className="p-4 sm:p-10">
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
                      const isYearly = s.payment_plan === 'Yearly'
                      const totalFee = isYearly ? (s.total_year_fee || 0) : (s.monthly_fee || 0)
                      const yearlyPaid = yearlyPaidMap[s.id] || 0
                      const yearlyBalance = Math.max(totalFee - yearlyPaid, 0)
                      const isMonthPaid = paidMonths[s.id] || s.fee_status === 'Paid'
                      const isFullyPaid = isYearly ? yearlyBalance === 0 && yearlyPaid > 0 : isMonthPaid
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
                             {isYearly ? (
                               // YEARLY fee logic
                               isFullyPaid ? (
                                 <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                    <Check size={14} strokeWidth={4} /> Fully Paid
                                 </div>
                               ) : (
                                 <div className="flex flex-col items-end gap-1.5">
                                   {yearlyPaid > 0 && (
                                     <div className="text-[9px] font-bold text-slate-500">
                                       <span className="text-emerald-600">₹{yearlyPaid}</span> / ₹{totalFee}
                                       <span className="text-rose-500 ml-1">(Bal: ₹{yearlyBalance})</span>
                                     </div>
                                   )}
                                   <button onClick={() => openPayModal(s)} disabled={actionLoading === s.id + '_fee'} className="bg-amber-50 text-amber-700 px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all border border-amber-200 flex items-center gap-2">
                                      <Banknote size={14} /> {actionLoading === s.id + '_fee' ? 'Wait' : (yearlyPaid > 0 ? 'Pay More' : 'Collect Fee')}
                                   </button>
                                 </div>
                               )
                             ) : (
                               // MONTHLY fee logic
                               isMonthPaid ? (
                                 <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                    <Check size={14} strokeWidth={4} /> Paid
                                 </div>
                               ) : (
                                 <button onClick={() => openPayModal(s)} disabled={actionLoading === s.id + '_fee'} className="bg-rose-50 text-rose-600 px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all border border-rose-100 flex items-center gap-2 ml-auto">
                                    <Clock size={14} /> {actionLoading === s.id + '_fee' ? 'Wait' : 'Mark Paid'}
                                 </button>
                               )
                             )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </motion.div>
             ) : !selectedTest ? (
                 <motion.div key="test-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {testResults.length === 0 ? (
                         <div className="col-span-full py-32 text-center bg-white rounded-[40px] border border-slate-100 shadow-sm">
                             <BookOpen size={48} className="mx-auto text-slate-100 mb-6" />
                             <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No tests recorded.</p>
                         </div>
                     ) : testResults.map((test: any, i: number) => (
                         <div key={i} onClick={() => setSelectedTest(test)} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-900 transition-all text-left group cursor-pointer relative">
                             <div className="flex justify-between items-start mb-6">
                                 <div className="bg-slate-50 text-slate-900 p-3 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-colors"><Trophy size={20} /></div>
                                 <div className="flex items-center gap-3">
                                     <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{test.date}</div>
                                     <button 
                                         onClick={(e) => handleDeleteTest(test.name, e)} 
                                         disabled={actionLoading === test.name + '_delete'}
                                         className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-colors shrink-0"
                                     >
                                         {actionLoading === test.name + '_delete' ? <Loader2 size={14} className="animate-spin" /> : <Trash size={14} />}
                                     </button>
                                 </div>
                             </div>
                             <h3 className="text-lg font-black text-slate-900 mb-1">{test.name}</h3>
                             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{test.subject}</div>
                             <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-50">
                                 <span className="text-[10px] font-black text-slate-900 uppercase">Out of {test.outOf}</span>
                                 <ChevronRight size={16} className="text-slate-200 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                             </div>
                         </div>
                     ))}
                 </motion.div>
             ) : (
                 <motion.div key="results-detail" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[32px] sm:rounded-[48px] border border-slate-100 shadow-xl overflow-hidden min-w-0">
                     <div className="p-6 sm:p-10 border-b border-slate-50 bg-slate-50/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                         <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                             <div className="bg-slate-900 text-white p-3.5 sm:p-4 rounded-2xl shadow-lg shadow-slate-900/20 shrink-0"><BarChart3 size={24} /></div>
                             <div className="min-w-0"><h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight truncate">{selectedTest.name}</h3><p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{selectedTest.subject} • {selectedTest.date}</p></div>
                         </div>
                         <div className="flex flex-wrap items-center gap-3 shrink-0">
                             <div className="bg-slate-100 border border-slate-200/50 text-slate-900 px-4 py-2 rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Out of {selectedTest.outOf}</div>
                             <button 
                                 onClick={async (e) => {
                                     const deleted = await handleDeleteTest(selectedTest.name, e);
                                     if (deleted) setSelectedTest(null);
                                 }} 
                                 disabled={actionLoading === selectedTest.name + '_delete'}
                                 className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-rose-500/20 transition-all"
                             >
                                 {actionLoading === selectedTest.name + '_delete' ? <Loader2 size={12} className="animate-spin" /> : <Trash size={12} />} Delete Test
                             </button>
                         </div>
                     </div>
                     <div className="overflow-x-auto">
                         <table className="w-full text-left min-w-[500px]">
                             <thead>
                                 <tr className="bg-slate-50/50">
                                     <th className="px-6 sm:px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Rank & Student</th>
                                     <th className="px-6 sm:px-10 py-5 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Mark Progress</th>
                                     <th className="px-6 sm:px-10 py-5 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Final Mark</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-50">
                                 {selectedTest.scores.sort((a:any, b:any) => b.mark - a.mark).map((score: any, idx: number) => {
                                     const pct = (score.mark / selectedTest.outOf) * 100
                                     return (
                                         <tr key={idx} className="hover:bg-slate-50/30 transition-all">
                                             <td className="px-6 sm:px-10 py-4 flex items-center gap-4">
                                                 <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${idx < 3 ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>{idx + 1}</div>
                                                 <div><div className="text-sm font-bold text-slate-900">{score.student}</div><div className="text-[9px] font-bold text-slate-400 uppercase">{score.regNo}</div></div>
                                             </td>
                                             <td className="px-6 sm:px-10 py-4">
                                                 <div className="h-1.5 w-full max-w-[200px] mx-auto bg-slate-100 rounded-full overflow-hidden">
                                                     <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className={`h-full rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                                 </div>
                                             </td>
                                             <td className="px-6 sm:px-10 py-4 text-right">
                                                 <span className={`text-base font-black ${pct >= 80 ? 'text-emerald-600' : pct >= 40 ? 'text-slate-900' : 'text-rose-600'}`}>{score.mark} <span className="text-[10px] font-normal text-slate-300">/ {selectedTest.outOf}</span></span>
                                             </td>
                                         </tr>
                                     )
                                 })}
                             </tbody>
                         </table>
                     </div>
                 </motion.div>
             )}
          </AnimatePresence>
        </div>

        {/* WhatsApp Absent Alerts Modal */}
        <AnimatePresence>
          {showAlertModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAlertModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl relative z-[210] flex flex-col max-h-[85vh]">
                <div className="bg-slate-900 p-8 text-white relative">
                  <button onClick={() => setShowAlertModal(false)} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-all text-white/70 hover:text-white"><X size={18} /></button>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center shadow-lg"><XCircle size={24} /></div>
                    <div>
                      <h2 className="text-xl font-black">Absent Notification System</h2>
                      <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-0.5">Send Instant WhatsApp Alerts to Parents</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-8 overflow-y-auto space-y-6">
                  {sequenceIndex !== -1 ? (
                    <div className="bg-slate-50 border border-slate-100 rounded-[24px] p-6 text-center space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sequencer Active</span>
                        <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase">
                          {sequenceIndex + 1} / {absentStudentsForAlert.length}
                        </span>
                      </div>
                      
                      <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl font-black mx-auto shadow-xl">
                        {absentStudentsForAlert[sequenceIndex]?.name?.[0]}
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-black text-slate-900">{absentStudentsForAlert[sequenceIndex]?.name}</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase mt-1">Parent: {absentStudentsForAlert[sequenceIndex]?.parent_name} • {absentStudentsForAlert[sequenceIndex]?.whatsapp_number || absentStudentsForAlert[sequenceIndex]?.parent_phone}</p>
                      </div>

                      <div className="bg-white rounded-2xl p-4 border border-slate-100/80 text-left text-xs text-slate-500 font-medium whitespace-pre-line leading-relaxed">
                        {`அன்பார்ந்த பெற்றோருக்கு,\nஉங்கள் குழந்தை *${absentStudentsForAlert[sequenceIndex]?.name}* இன்று SMTC பயிற்சி வகுப்பிற்கு வரவில்லை. தயவுசெய்து தினசரி வகுப்பிற்கு வருவதை உறுதிப்படுத்தவும்.\n\n- SMTC பயிற்சி மையம்`}
                      </div>
                      
                      <div className="pt-2 flex gap-3">
                        {!hasOpenedCurrent ? (
                          <button 
                            onClick={handleOpenCurrent}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                          >
                            Open WhatsApp & Send
                          </button>
                        ) : (
                          <button 
                            onClick={handleNextInSequence}
                            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2"
                          >
                            {sequenceIndex < absentStudentsForAlert.length - 1 ? 'Sent! Next Parent ➡️' : 'Finish & Close 🎉'}
                          </button>
                        )}
                        <button 
                          onClick={() => setSequenceIndex(-1)} 
                          className="px-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button 
                        onClick={startSequence}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 mb-4"
                      >
                        ⚡ Start Quick-Send Sequence ({absentStudentsForAlert.length} Parents)
                      </button>

                      <p className="text-slate-500 text-xs font-medium border-t border-slate-100 pt-4">
                        Or click below to send individually:
                      </p>
                      
                      <div className="space-y-3">
                        {absentStudentsForAlert.map((s) => {
                          const waUrl = getWhatsAppUrl(s)
                          const phoneToShow = s.whatsapp_number || s.parent_phone || 'No phone'
                          const status = alertStatuses[s.id] || 'pending'
                          
                          return (
                            <div key={s.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-lg transition-all">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm">{s.name[0]}</div>
                                <div>
                                  <div className="text-sm font-bold text-slate-900">{s.name}</div>
                                  <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Parent: {s.parent_name} • {phoneToShow}</div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {status === 'sending' && (
                                  <span className="bg-amber-50 text-amber-600 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                    <Loader2 size={10} className="animate-spin" /> Sending...
                                  </span>
                                )}
                                {status === 'pending' && (
                                  <span className="bg-slate-100 text-slate-400 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                    Ready
                                  </span>
                                )}
                                {status === 'sent' && (
                                  <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                    <Check size={10} strokeWidth={4} /> Sent
                                  </span>
                                )}
                                {status === 'failed' && (
                                  <a 
                                    href={waUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                                  >
                                    Manual Send
                                  </a>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
                
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
                  <button onClick={() => setShowAlertModal(false)} className="w-full py-4 bg-white text-slate-900 border border-slate-200 hover:bg-slate-900 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                    Done
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Payment Amount Modal */}
        <AnimatePresence>
          {showPayModal && (() => {
            const isYearly = showPayModal.payment_plan === 'Yearly'
            const totalFee = isYearly ? (showPayModal.total_year_fee || 0) : (showPayModal.monthly_fee || 0)
            const alreadyPaid = isYearly ? (yearlyPaidMap[showPayModal.id] || 0) : 0
            const remaining = isYearly ? Math.max(totalFee - alreadyPaid, 0) : totalFee

            return (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPayModal(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
                <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl relative z-[210]">
                  
                  {/* Header */}
                  <div className="bg-slate-900 p-6 text-white">
                    <button onClick={() => setShowPayModal(null)} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-all text-white/70 hover:text-white"><X size={16} /></button>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white text-slate-900 flex items-center justify-center text-xl font-black shadow-xl">{showPayModal.name[0]}</div>
                      <div>
                        <h3 className="text-lg font-black">{showPayModal.name}</h3>
                        <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-0.5">
                          {isYearly ? 'Yearly Plan' : 'Monthly Plan'} • {showPayModal.register_number}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fee Summary */}
                  <div className="p-6 space-y-5">
                    {isYearly && (
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Year Fee</span>
                          <span className="text-sm font-black text-slate-900">₹{totalFee}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Already Paid</span>
                          <span className="text-sm font-black text-emerald-600">₹{alreadyPaid}</span>
                        </div>
                        <div className="h-px bg-slate-200" />
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Balance Due</span>
                          <span className="text-sm font-black text-rose-600">₹{remaining}</span>
                        </div>
                        {/* Visual progress */}
                        {totalFee > 0 && (
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full transition-all duration-500 rounded-full" style={{ width: `${(alreadyPaid / totalFee) * 100}%` }} />
                          </div>
                        )}
                      </div>
                    )}

                    {!isYearly && (
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Monthly Fee</span>
                          <span className="text-sm font-black text-slate-900">₹{totalFee}</span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Amount (₹)</label>
                      <input
                        type="number"
                        value={payAmount}
                        onChange={e => setPayAmount(e.target.value)}
                        min="1"
                        max={remaining || totalFee}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-xl font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-center"
                        placeholder="Enter amount"
                        autoFocus
                      />
                    </div>

                    <button
                      onClick={() => {
                        const amt = parseInt(payAmount)
                        if (!amt || amt <= 0) { alert('Please enter a valid amount'); return }
                        recordPayment(showPayModal, amt)
                      }}
                      disabled={actionLoading === showPayModal.id + '_fee'}
                      className="w-full bg-emerald-500 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {actionLoading === showPayModal.id + '_fee' ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <><Banknote size={16} /> Record ₹{payAmount || '0'} Payment</>
                      )}
                    </button>
                  </div>
                </motion.div>
              </div>
            )
          })()}
        </AnimatePresence>
      </main>
    </div>
  )
}
