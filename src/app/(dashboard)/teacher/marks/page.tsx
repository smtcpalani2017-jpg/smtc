'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Sidebar from '@/components/dashboard/Sidebar'
import { Save, Loader2, CheckCircle2, Filter, Trophy } from 'lucide-react'

const SUBJECTS = ['Mathematics', 'Science', 'Social Science', 'Tamil', 'English']

export default function UploadMarksPage() {
  const supabase = createClient()
  const [assignedClasses, setAssignedClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [subject, setSubject] = useState('Mathematics')
  const [testName, setTestName] = useState('')
  const [outOf, setOutOf] = useState(100)
  const [students, setStudents] = useState<any[]>([])
  const [marksData, setMarksData] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  const loadInitialData = async () => {
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

  const loadStudents = async () => {
    if (!selectedClass) return
    setLoading(true)
    
    // Get active academic year
    const { data: activeYear } = await supabase
      .from('academic_years')
      .select('id')
      .eq('status', 'Active')
      .limit(1)
      .maybeSingle()

    let studentsData: any[] = []
    
    if (activeYear) {
      const { data: records, error } = await supabase
        .from('student_academic_records')
        .select('*, students(*)')
        .eq('academic_year_id', activeYear.id)
        .eq('class_name', selectedClass)
        .eq('student_status', 'Active')
        .order('created_at', { ascending: false })
      
      if (!error && records) {
        studentsData = records.map((r: any) => ({
          ...r.students,
          class: r.class_name,
          payment_plan: r.payment_plan,
          monthly_fee: r.monthly_fee,
          total_year_fee: r.full_year_fee,
          join_date: r.join_date,
          student_status: r.student_status
        })).filter((r: any) => r && r.id)
      }
    } else {
      const { data } = await supabase.from('students').select('*').eq('class', selectedClass).order('name')
      studentsData = data || []
    }

    setStudents(studentsData)
    const initialMarks: Record<string, number> = {}
    studentsData.forEach(s => { initialMarks[s.id] = 0 })
    setMarksData(initialMarks)
    setLoading(false)
  }

  useEffect(() => { loadInitialData() }, [])
  useEffect(() => { if (selectedClass) loadStudents() }, [selectedClass])

  const calculateGrade = (mark: number) => {
    const percentage = (mark / outOf) * 100
    if (percentage >= 90) return { label: 'A+', color: 'bg-emerald-500' }
    if (percentage >= 80) return { label: 'A', color: 'bg-green-500' }
    if (percentage >= 70) return { label: 'B', color: 'bg-blue-500' }
    if (percentage >= 60) return { label: 'C', color: 'bg-yellow-500' }
    if (percentage >= 40) return { label: 'D', color: 'bg-orange-500' }
    return { label: 'F', color: 'bg-rose-500' }
  }

  const handleSave = async () => {
    if (!testName) return alert('Please enter test name')
    setSaving(true)
    try {
      // Get active academic year during saving
      const { data: activeYear } = await supabase
        .from('academic_years')
        .select('id')
        .eq('status', 'Active')
        .limit(1)
        .maybeSingle()

      const payload = students.map(s => ({
        student_id: s.id,
        subject: subject,
        test_name: testName,
        marks: marksData[s.id] || 0,
        out_of: outOf,
        created_by: 'Staff',
        ...(activeYear ? { academic_year_id: activeYear.id } : {})
      }))
      const { error } = await supabase.from('marks').insert(payload)
      if (error) {
        console.error('Save error:', error)
        alert('Error saving marks: ' + error.message)
      } else {
        setSuccess('Marks uploaded successfully!')
        // Reset form for next test
        setTestName('')
        const resetMarks: Record<string, number> = {}
        students.forEach(s => { resetMarks[s.id] = 0 })
        setMarksData(resetMarks)
        
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
    setSaving(false)
  }

  const inp = "w-full border border-slate-100 bg-slate-50/50 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all no-spinner"

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar role="teacher" />
      <style>{`
        .no-spinner::-webkit-outer-spin-button, .no-spinner::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .no-spinner[type=number] { -moz-appearance: textfield; }
      `}</style>

      <main className="flex-1 ml-0 md:ml-64 min-h-screen p-4 sm:p-10 transition-all duration-300">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10 pl-12 sm:pl-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Upload Test Marks</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Institutional Performance Sync</p>
          </div>
          <button onClick={handleSave} disabled={saving || students.length === 0} className="bg-slate-900 text-white px-6 sm:px-8 py-3 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50 w-fit">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Uploading...' : 'Save Marks'}
          </button>
        </header>

        {success && (
          <div className="mb-8 bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold animate-pulse">
            <CheckCircle2 size={18} /> {success}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 bg-white p-6 sm:p-8 rounded-[40px] border border-slate-100 shadow-sm">
           <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest flex items-center gap-2"><Filter size={12}/> Class</label>
              <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className={inp}>
                {assignedClasses.length === 0 ? <option>No Class Assigned</option> : assignedClasses.map(c => <option key={c.class_name}>{c.class_name}</option>)}
              </select>
           </div>
           <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Subject</label>
              <select value={subject} onChange={e => setSubject(e.target.value)} className={inp}>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
           </div>
           <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Test Name</label>
              <input type="text" value={testName} onChange={e => setTestName(e.target.value)} className={inp} placeholder="e.g. Unit Test 1" />
           </div>
           <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest text-emerald-600">Marks Out Of</label>
              <input type="number" value={outOf} onChange={e => setOutOf(parseInt(e.target.value) || 0)} className={inp + " border-emerald-50 text-emerald-700 focus:ring-emerald-500"} />
           </div>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-slate-50/50">
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Profile</th>
                    <th className="px-10 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Marks ({outOf})</th>
                    <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Result</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {loading ? (
                   <tr><td colSpan={3} className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-slate-200" size={40} /></td></tr>
                 ) : assignedClasses.length === 0 ? (
                    <tr><td colSpan={3} className="py-24 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">No assigned classes found.</td></tr>
                 ) : students.length === 0 ? (
                    <tr><td colSpan={3} className="py-24 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">No students in this class.</td></tr>
                 ) : students.map((s, i) => {
                   const mark = marksData[s.id] || 0
                   const grade = calculateGrade(mark)
                   return (
                     <tr key={s.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-10 py-5">
                           <div className="flex items-center gap-5">
                              <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-lg">{s.name[0]}</div>
                              <div>
                                 <div className="text-base font-bold text-slate-900">{s.name}</div>
                                 <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.register_number}</div>
                              </div>
                           </div>
                        </td>
                        <td className="px-10 py-5 text-center">
                           <input type="number" max={outOf} min={0} value={marksData[s.id]} onChange={e => setMarksData(prev => ({ ...prev, [s.id]: parseInt(e.target.value) || 0 }))} className="w-24 text-center py-3 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 no-spinner" />
                        </td>
                        <td className="px-10 py-5 text-right">
                           <span className={`px-5 py-2 rounded-xl text-[10px] font-black text-white shadow-sm flex items-center gap-2 justify-end ml-auto w-fit ${grade.color}`}>
                              <Trophy size={14} /> GRADE: {grade.label}
                           </span>
                        </td>
                     </tr>
                   )
                 })}
              </tbody>
           </table>
        </div>
      </main>
    </div>
  )
}
