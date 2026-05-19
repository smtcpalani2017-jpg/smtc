'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Sidebar from '@/components/dashboard/Sidebar'
import { Archive, Plus, ChevronRight, Users, Calendar, Loader2, X, CheckCircle2, ArrowRight, GraduationCap, Trash2, AlertTriangle, Edit2, Upload, FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'
import { motion, AnimatePresence } from 'framer-motion'

interface AcademicYear { id: string; year_name: string; status: string; start_date: string; end_date: string; created_at: string }
interface StudentRecord { id: string; student_id: string; class_name: string; student_status: string; students: any; academic_years: any }

export default function ArchivesPage() {
  const supabase = createClient()
  const [years, setYears] = useState<AcademicYear[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewYear, setShowNewYear] = useState(false)
  const [showPromotion, setShowPromotion] = useState(false)
  const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null)
  const [yearStudents, setYearStudents] = useState<StudentRecord[]>([])
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('All')
  const [classes, setClasses] = useState<string[]>([])
  const [msg, setMsg] = useState('')
  const [showEditYear, setShowEditYear] = useState(false)
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingYear, setDeletingYear] = useState<AcademicYear | null>(null)
  const [yearForm, setYearForm] = useState({ year_name: '', start_date: '', end_date: '' })
  const [promoForm, setPromoForm] = useState({ sourceYearId: '', sourceClass: '', targetYearId: '', targetClass: '' })
  const [promoStudents, setPromoStudents] = useState<any[]>([])
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [yearStats, setYearStats] = useState<Record<string, { total: number; active: number; archived: number }>>({})

  const [showOldBatch, setShowOldBatch] = useState(false)
  const [oldBatchFile, setOldBatchFile] = useState<File | null>(null)
  const [oldBatchYearId, setOldBatchYearId] = useState('')
  const [uploadingBatch, setUploadingBatch] = useState(false)

  const loadYears = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('academic_years').select('*').order('created_at', { ascending: false })
    if (error) { setYears([]); setLoading(false); return }
    setYears(data || [])

    const stats: Record<string, { total: number; active: number; archived: number }> = {}
    for (const y of (data || [])) {
      const { data: recs } = await supabase.from('student_academic_records').select('student_status').eq('academic_year_id', y.id)
      const all = recs || []
      stats[y.id] = { total: all.length, active: all.filter(r => r.student_status === 'Active').length, archived: all.filter(r => r.student_status === 'Archived').length }
    }
    setYearStats(stats)

    const { data: cls } = await supabase.from('classes').select('class_name')
    setClasses((cls || []).map(c => c.class_name))
    setLoading(false)
  }

  const loadYearStudents = async (year: AcademicYear) => {
    setSelectedYear(year)
    setSelectedClassFilter('All')
    setLoading(true)
    const { data } = await supabase
      .from('student_academic_records')
      .select('*, students(name, register_number, gender, parent_name, parent_phone), academic_years(year_name)')
      .eq('academic_year_id', year.id)
      .order('class_name')
    setYearStudents(data || [])
    setLoading(false)
  }

  useEffect(() => { loadYears() }, [])

  const handleCreateYear = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!confirm('This will auto-archive all current students, promote them to the next class, and clear the active dashboard for the new year. Are you sure?')) return
    setSaving(true)
    
    // 1. Get current active year
    const { data: currentActiveYear } = await supabase.from('academic_years').select('id, year_name').eq('status', 'Active').limit(1).maybeSingle()
    
    // 2. Create the new year
    const { data: newYear, error: newYearError } = await supabase.from('academic_years').insert([{ ...yearForm, status: 'Active' }]).select().single()
    if (newYearError || !newYear) { alert(newYearError?.message || 'Error creating year'); setSaving(false); return }

    if (currentActiveYear) {
       // 3. Mark old year as archived
       await supabase.from('academic_years').update({ status: 'Archived', end_date: new Date().toISOString() }).eq('id', currentActiveYear.id)
       
       // 4. Fetch all active students from old year
       const { data: oldRecords } = await supabase.from('student_academic_records').select('*').eq('academic_year_id', currentActiveYear.id).eq('student_status', 'Active')
       
       if (oldRecords && oldRecords.length > 0) {
          // Archive them in the old year
          await supabase.from('student_academic_records').update({ student_status: 'Archived' }).eq('academic_year_id', currentActiveYear.id).eq('student_status', 'Active')

          // Calculate promotion
          const nextClassMap: Record<string, string> = {
            '6th': '7th', '7th': '8th', '8th': '9th', '9th': '10th', '10th': '11th', '11th': '12th', '12th': 'Alumni'
          }

          const newRecords = oldRecords.map(r => {
             let targetClass = nextClassMap[r.class_name] || r.class_name
             let status = targetClass === 'Alumni' ? 'Completed' : 'Active'
             return {
                student_id: r.student_id,
                academic_year_id: newYear.id,
                class_name: targetClass,
                student_status: status,
                join_date: new Date().toISOString().split('T')[0],
                payment_plan: r.payment_plan || 'Monthly',
                monthly_fee: r.monthly_fee || 0,
                full_year_fee: r.full_year_fee || 0
             }
          })
          
          await supabase.from('student_academic_records').insert(newRecords)

          // Update base students table class names for active ones
          const activeNewRecords = newRecords.filter(r => r.student_status === 'Active')
          for (const r of activeNewRecords) {
             await supabase.from('students').update({ class: r.class_name }).eq('id', r.student_id)
          }
       }
    }
    
    setMsg('✅ New Academic Year Created & Students Promoted!')
    setShowNewYear(false)
    setYearForm({ year_name: '', start_date: '', end_date: '' })
    loadYears()
    setTimeout(() => setMsg(''), 5000)
    setSaving(false)
  }

  const handleUploadOldBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!oldBatchFile || !oldBatchYearId) return alert('Select year and file')
    setUploadingBatch(true)

    const reader = new FileReader()
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json(ws) as any[]

        if (data.length === 0) { alert('File is empty'); setUploadingBatch(false); return }

        let count = 0
        for (const row of data) {
           const name = row['Name'] || row['name']
           const regNo = row['Reg No'] || row['regNo'] || row['register_number']
           const cls = row['Class'] || row['class']
           if (!name || !cls) continue

           let studentId = ''
           if (regNo) {
             const { data: existing } = await supabase.from('students').select('id').eq('register_number', regNo).maybeSingle()
             if (existing) studentId = existing.id
           }
           
           if (!studentId) {
             const { data: newS } = await supabase.from('students').insert([{
                name: name,
                register_number: regNo || `OLD-${Date.now()}-${Math.floor(Math.random()*100)}`,
                class: cls,
                gender: row['Gender'] || row['gender'] || 'Male',
                parent_name: row['Parent'] || '',
                parent_phone: row['Phone'] || '',
                join_date: new Date().toISOString()
             }]).select().single()
             if (newS) studentId = newS.id
           }

           if (studentId) {
             const status = row['Status'] || row['status'] || 'Archived'
             await supabase.from('student_academic_records').upsert([{
                student_id: studentId,
                academic_year_id: oldBatchYearId,
                class_name: cls,
                student_status: status,
                join_date: new Date().toISOString()
             }], { onConflict: 'student_id,academic_year_id' })
             count++
           }
        }
        
        setMsg(`✅ ${count} students imported successfully to selected batch!`)
        setShowOldBatch(false)
        setOldBatchFile(null)
        setOldBatchYearId('')
        loadYears()
        setTimeout(() => setMsg(''), 4000)
      } catch (err) {
        alert('Error parsing Excel: ' + err)
      }
      setUploadingBatch(false)
    }
    reader.readAsBinaryString(oldBatchFile)
  }

  const handleEditYear = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingYear) return
    setSaving(true)
    const { error } = await supabase
      .from('academic_years')
      .update({
        year_name: yearForm.year_name,
        start_date: yearForm.start_date,
        end_date: yearForm.end_date
      })
      .eq('id', editingYear.id)
    
    if (error) alert(error.message)
    else {
      setMsg('Academic year updated!')
      setShowEditYear(false)
      setEditingYear(null)
      setYearForm({ year_name: '', start_date: '', end_date: '' })
      loadYears()
      setTimeout(() => setMsg(''), 3000)
    }
    setSaving(false)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingYear) return
    setSaving(true)
    const { error } = await supabase
      .from('academic_years')
      .delete()
      .eq('id', deletingYear.id)
    
    if (error) alert(error.message)
    else {
      setMsg('Academic year deleted successfully!')
      setShowDeleteConfirm(false)
      setDeletingYear(null)
      loadYears()
      setTimeout(() => setMsg(''), 3000)
    }
    setSaving(false)
  }

  const handleArchiveYear = async (year: AcademicYear) => {
    if (!confirm(`Archive "${year.year_name}"? All students in this year will be marked as Archived.`)) return
    setSaving(true)
    await supabase.from('academic_years').update({ status: 'Archived' }).eq('id', year.id)
    await supabase.from('student_academic_records').update({ student_status: 'Archived' }).eq('academic_year_id', year.id).eq('student_status', 'Active')
    setMsg(`${year.year_name} archived!`); loadYears(); setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  const handleActivateYear = async (year: AcademicYear) => {
    setSaving(true)
    await supabase.from('academic_years').update({ status: 'Active' }).eq('id', year.id)
    setMsg(`${year.year_name} activated!`); loadYears(); setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  const loadPromoStudents = async () => {
    if (!promoForm.sourceYearId || !promoForm.sourceClass) return
    const { data } = await supabase
      .from('student_academic_records')
      .select('*, students(id, name, register_number, gender)')
      .eq('academic_year_id', promoForm.sourceYearId)
      .eq('class_name', promoForm.sourceClass)
      .eq('student_status', 'Active')
    setPromoStudents(data || [])
    setSelectedStudentIds((data || []).map((r: any) => r.students?.id).filter(Boolean))
  }

  useEffect(() => { if (promoForm.sourceYearId && promoForm.sourceClass) loadPromoStudents() }, [promoForm.sourceYearId, promoForm.sourceClass])

  const handlePromote = async () => {
    if (!promoForm.targetYearId || !promoForm.targetClass || selectedStudentIds.length === 0) return alert('Fill all fields and select students')
    setSaving(true)
    const records = selectedStudentIds.map(sid => ({
      student_id: sid, academic_year_id: promoForm.targetYearId, class_name: promoForm.targetClass,
      join_date: new Date().toISOString().split('T')[0], payment_plan: 'Monthly', monthly_fee: 0, full_year_fee: 0, student_status: 'Active'
    }))
    const { error } = await supabase.from('student_academic_records').upsert(records, { onConflict: 'student_id,academic_year_id' })
    if (error) alert(error.message)
    else {
      for (const sid of selectedStudentIds) { await supabase.from('students').update({ class: promoForm.targetClass }).eq('id', sid) }
      setMsg(`${selectedStudentIds.length} students promoted!`); setShowPromotion(false); loadYears()
      setTimeout(() => setMsg(''), 3000)
    }
    setSaving(false)
  }

  const exportYearStudents = (yearName: string) => {
    const studentsToExport = selectedClassFilter === 'All' ? yearStudents : yearStudents.filter(s => s.class_name === selectedClassFilter)
    if (studentsToExport.length === 0) return alert('No students to export')
    const exportData = studentsToExport.map((r, i) => ({
       '#': i + 1,
       'Register Number': r.students?.register_number || '',
       'Name': r.students?.name || '',
       'Class': r.class_name,
       'Gender': r.students?.gender || '',
       'Parent': r.students?.parent_name || '',
       'Status': r.student_status
    }))
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Students")
    XLSX.writeFile(wb, `SMTC_Students_${yearName}.xlsx`)
  }

  const inp = "w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all outline-none"
  const lbl = "block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 pl-1"

  const filteredStudents = selectedClassFilter === 'All' ? yearStudents : yearStudents.filter(s => s.class_name === selectedClassFilter)

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar role="admin" />
      <main className="flex-1 ml-0 md:ml-64 min-h-screen p-4 sm:p-10 transition-all duration-300">
        {msg && <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-emerald-50 border border-emerald-100 text-emerald-600 p-4 rounded-2xl text-xs font-bold flex items-center gap-3"><CheckCircle2 size={18} />{msg}</motion.div>}

        <AnimatePresence mode="wait">
          {!selectedYear ? (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-12 sm:pl-0">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Academic Archives</h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Year Management & Student Promotion</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowOldBatch(true)} className="bg-white text-slate-900 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-slate-200 shadow-sm hover:shadow-lg transition-all"><Upload size={16} />Add Old Batch</button>
                  <button onClick={() => setShowPromotion(true)} className="bg-white text-slate-900 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-slate-200 shadow-sm hover:shadow-lg transition-all"><ArrowRight size={16} />Promote Students</button>
                  <button onClick={() => setShowNewYear(true)} className="bg-slate-900 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-slate-800 transition-all"><Plus size={16} />New Year</button>
                </div>
              </header>

              {loading ? (
                <div className="py-32 text-center"><Loader2 className="animate-spin mx-auto text-slate-200" size={48} /></div>
              ) : years.length === 0 ? (
                <div className="py-32 text-center bg-white rounded-[40px] border border-slate-100 shadow-sm">
                  <Archive size={48} className="mx-auto text-slate-100 mb-6" />
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No academic years configured yet.</p>
                  <p className="text-[10px] text-slate-300 mt-2">Run the migration SQL in your Supabase Dashboard, then click &quot;New Year&quot; above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {years.map(y => {
                    const st = yearStats[y.id] || { total: 0, active: 0, archived: 0 }
                    const isActive = y.status === 'Active'
                    return (
                      <motion.div key={y.id} whileHover={{ scale: 1.01 }} className={`rounded-[32px] overflow-hidden border shadow-sm hover:shadow-xl transition-all cursor-pointer ${isActive ? 'border-emerald-200' : 'border-slate-100'}`}>
                        <div className={`p-8 text-white relative ${isActive ? 'bg-slate-900' : 'bg-slate-600'}`} onClick={() => loadYearStudents(y)}>
                          <div className="flex justify-between items-start mb-6">
                            <div className={`p-3 rounded-2xl ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/60'}`}><Archive size={20} /></div>
                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${isActive ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/60'}`}>{y.status}</span>
                          </div>
                          <h3 className="text-2xl font-black">{y.year_name}</h3>
                          <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">
                            {y.start_date ? new Date(y.start_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'} → {y.end_date ? new Date(y.end_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}
                          </div>
                        </div>
                        <div className="bg-white p-6">
                          <div className="grid grid-cols-3 gap-4 text-center mb-4">
                            <div><div className="text-lg font-black text-slate-900">{st.total}</div><div className="text-[8px] font-black text-slate-400 uppercase">Total</div></div>
                            <div className="border-x border-slate-50"><div className="text-lg font-black text-emerald-600">{st.active}</div><div className="text-[8px] font-black text-slate-400 uppercase">Active</div></div>
                            <div><div className="text-lg font-black text-amber-500">{st.archived}</div><div className="text-[8px] font-black text-slate-400 uppercase">Archived</div></div>
                          </div>
                          <div className="flex gap-2 items-center" onClick={e => e.stopPropagation()}>
                            <button onClick={() => loadYearStudents(y)} className="flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-slate-50 text-slate-600 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2"><Users size={12} />View</button>
                            {isActive ? (
                              <button onClick={() => handleArchiveYear(y)} className="flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center gap-2"><Archive size={12} />Archive</button>
                            ) : (
                              <button onClick={() => handleActivateYear(y)} className="flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2"><CheckCircle2 size={12} />Activate</button>
                            )}
                            <button onClick={() => { setEditingYear(y); setYearForm({ year_name: y.year_name, start_date: y.start_date || '', end_date: y.end_date || '' }); setShowEditYear(true); }} className="p-2.5 bg-slate-50 hover:bg-slate-200 text-slate-600 rounded-xl transition-all flex items-center justify-center" title="Edit"><Edit2 size={12} /></button>
                            <button onClick={() => { setDeletingYear(y); setShowDeleteConfirm(true); }} className="p-2.5 bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-600 rounded-xl transition-all flex items-center justify-center" title="Delete"><Trash2 size={12} /></button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-12 sm:pl-0">
                <div className="flex items-center gap-4">
                  <button onClick={() => { setSelectedYear(null); setYearStudents([]) }} className="p-2 hover:bg-white rounded-2xl transition-all shadow-sm border border-slate-100"><ChevronRight size={20} className="text-slate-900 rotate-180" /></button>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{selectedYear.year_name}</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{filteredStudents.length} Student Records • {selectedYear.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select value={selectedClassFilter} onChange={e => setSelectedClassFilter(e.target.value)} className="bg-white text-slate-900 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 shadow-sm outline-none cursor-pointer">
                    <option value="All">All Classes</option>
                    {Array.from(new Set(yearStudents.map(s => s.class_name))).sort().map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <button onClick={() => exportYearStudents(selectedYear.year_name)} className="bg-emerald-50 text-emerald-600 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm hover:bg-emerald-500 hover:text-white transition-all"><FileSpreadsheet size={16} />Export to Excel</button>
                </div>
              </header>

              {loading ? (
                <div className="py-32 text-center"><Loader2 className="animate-spin mx-auto text-slate-200" size={48} /></div>
              ) : filteredStudents.length === 0 ? (
                <div className="py-24 text-center bg-white rounded-[40px] border border-slate-100"><Users size={48} className="mx-auto text-slate-100 mb-4" /><p className="text-slate-400 font-bold text-sm uppercase">No student records match this filter</p></div>
              ) : (
                <div className="bg-white rounded-[32px] sm:rounded-[48px] border border-slate-100 shadow-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                      <thead>
                        <tr className="bg-slate-50/50">
                          <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                          <th className="px-8 py-5 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Class</th>
                          <th className="px-8 py-5 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Gender</th>
                          <th className="px-8 py-5 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Parent</th>
                          <th className="px-8 py-5 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredStudents.map(r => (
                          <tr key={r.id} className="hover:bg-slate-50/50 transition-all">
                            <td className="px-8 py-4">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">{r.students?.name?.[0] || '?'}</div>
                                <div><div className="text-sm font-bold text-slate-900">{r.students?.name}</div><div className="text-[9px] text-slate-400 font-bold uppercase">{r.students?.register_number}</div></div>
                              </div>
                            </td>
                            <td className="px-8 py-4 text-center"><span className="bg-slate-100 text-slate-600 px-4 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest">{r.class_name}</span></td>
                            <td className="px-8 py-4 text-center text-xs font-bold text-slate-400">{r.students?.gender || '—'}</td>
                            <td className="px-8 py-4 text-center text-xs font-bold text-slate-400">{r.students?.parent_name || '—'}</td>
                            <td className="px-8 py-4 text-right">
                              <span className={`px-4 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${r.student_status === 'Active' ? 'bg-emerald-50 text-emerald-600' : r.student_status === 'Archived' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>{r.student_status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* New Year Modal */}
        <AnimatePresence>
          {showNewYear && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNewYear(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl relative z-[210]">
                <div className="flex items-center justify-between mb-8"><h2 className="text-xl font-black text-slate-900">Create Academic Year</h2><button onClick={() => setShowNewYear(false)} className="p-2 hover:bg-slate-50 rounded-xl"><X size={18} className="text-slate-400" /></button></div>
                <form onSubmit={handleCreateYear} className="space-y-6">
                  <div><label className={lbl}>Year Name (e.g. 2026-2027)</label><input required value={yearForm.year_name} onChange={e => setYearForm({ ...yearForm, year_name: e.target.value })} className={inp} placeholder="2026-2027" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={lbl}>Start Date</label><input type="date" required value={yearForm.start_date} onChange={e => setYearForm({ ...yearForm, start_date: e.target.value })} className={inp} /></div>
                    <div><label className={lbl}>End Date</label><input type="date" required value={yearForm.end_date} onChange={e => setYearForm({ ...yearForm, end_date: e.target.value })} className={inp} /></div>
                  </div>
                  <button disabled={saving} className="w-full bg-slate-900 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 disabled:opacity-60 transition-all">{saving ? 'Creating...' : 'Create Year'}</button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Promotion Modal */}
        <AnimatePresence>
          {showPromotion && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPromotion(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl relative z-[210] overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white z-20">
                  <div><h2 className="text-xl font-black text-slate-900">Promote Students</h2><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Move students to a new class & year</p></div>
                  <button onClick={() => setShowPromotion(false)} className="p-2 hover:bg-slate-50 rounded-xl"><X size={18} className="text-slate-400" /></button>
                </div>
                <div className="p-8 overflow-y-auto space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={lbl}>Source Year</label><select value={promoForm.sourceYearId} onChange={e => setPromoForm({ ...promoForm, sourceYearId: e.target.value })} className={inp}><option value="">Select</option>{years.map(y => <option key={y.id} value={y.id}>{y.year_name}</option>)}</select></div>
                    <div><label className={lbl}>Source Class</label><select value={promoForm.sourceClass} onChange={e => setPromoForm({ ...promoForm, sourceClass: e.target.value })} className={inp}><option value="">Select</option>{classes.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  </div>
                  <div className="border-t border-slate-100 pt-4 flex items-center gap-3"><ArrowRight size={16} className="text-slate-300" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Promote To</span></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={lbl}>Target Year</label><select value={promoForm.targetYearId} onChange={e => setPromoForm({ ...promoForm, targetYearId: e.target.value })} className={inp}><option value="">Select</option>{years.map(y => <option key={y.id} value={y.id}>{y.year_name}</option>)}</select></div>
                    <div><label className={lbl}>Target Class</label><select value={promoForm.targetClass} onChange={e => setPromoForm({ ...promoForm, targetClass: e.target.value })} className={inp}><option value="">Select</option>{classes.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  </div>

                  {promoStudents.length > 0 && (
                    <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedStudentIds.length}/{promoStudents.length} Selected</span>
                        <button onClick={() => setSelectedStudentIds(selectedStudentIds.length === promoStudents.length ? [] : promoStudents.map((r: any) => r.students?.id).filter(Boolean))} className="text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-slate-900">{selectedStudentIds.length === promoStudents.length ? 'Deselect All' : 'Select All'}</button>
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {promoStudents.map((r: any) => {
                          const sid = r.students?.id
                          const checked = selectedStudentIds.includes(sid)
                          return (
                            <label key={r.id} className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${checked ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}>
                              <input type="checkbox" checked={checked} onChange={() => setSelectedStudentIds(prev => checked ? prev.filter(id => id !== sid) : [...prev, sid])} className="rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                              <span className="text-sm font-bold text-slate-900">{r.students?.name}</span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase ml-auto">{r.students?.register_number}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <button onClick={handlePromote} disabled={saving || selectedStudentIds.length === 0} className="w-full bg-slate-900 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 disabled:opacity-60 transition-all flex items-center justify-center gap-3">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <GraduationCap size={16} />}
                    {saving ? 'Promoting...' : `Promote ${selectedStudentIds.length} Students`}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Edit Year Modal */}
        <AnimatePresence>
          {showEditYear && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowEditYear(false); setEditingYear(null); }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl relative z-[210]">
                <div className="flex items-center justify-between mb-8"><h2 className="text-xl font-black text-slate-900">Edit Academic Year</h2><button onClick={() => { setShowEditYear(false); setEditingYear(null); }} className="p-2 hover:bg-slate-50 rounded-xl"><X size={18} className="text-slate-400" /></button></div>
                <form onSubmit={handleEditYear} className="space-y-6">
                  <div><label className={lbl}>Year Name (e.g. 2026-2027)</label><input required value={yearForm.year_name} onChange={e => setYearForm({ ...yearForm, year_name: e.target.value })} className={inp} placeholder="2026-2027" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={lbl}>Start Date</label><input type="date" required value={yearForm.start_date} onChange={e => setYearForm({ ...yearForm, start_date: e.target.value })} className={inp} /></div>
                    <div><label className={lbl}>End Date</label><input type="date" required value={yearForm.end_date} onChange={e => setYearForm({ ...yearForm, end_date: e.target.value })} className={inp} /></div>
                  </div>
                  <button disabled={saving} className="w-full bg-slate-900 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 disabled:opacity-60 transition-all">{saving ? 'Updating...' : 'Update Year'}</button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowDeleteConfirm(false); setDeletingYear(null); }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl relative z-[210] text-center">
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Trash2 size={28} />
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-2">Delete Academic Year?</h2>
                <p className="text-slate-500 text-sm mb-8 px-4">
                  Are you sure you want to delete <span className="font-bold text-slate-900">{deletingYear?.year_name}</span>? This will permanently delete the year and all associated student academic records.
                </p>
                <div className="flex gap-4">
                  <button type="button" onClick={() => { setShowDeleteConfirm(false); setDeletingYear(null); }} className="flex-1 bg-slate-100 text-slate-700 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                  <button type="button" onClick={handleDeleteConfirm} disabled={saving} className="flex-1 bg-rose-600 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {saving ? <Loader2 className="animate-spin" size={14} /> : 'Delete'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Old Batch Modal */}
        <AnimatePresence>
          {showOldBatch && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowOldBatch(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl relative z-[210]">
                <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-black text-slate-900">Import Historical Batch</h2><button onClick={() => setShowOldBatch(false)} className="p-2 hover:bg-slate-50 rounded-xl"><X size={18} className="text-slate-400" /></button></div>
                <form onSubmit={handleUploadOldBatch} className="space-y-6">
                  <div>
                    <label className={lbl}>Target Academic Year</label>
                    <select required value={oldBatchYearId} onChange={e => setOldBatchYearId(e.target.value)} className={inp}>
                      <option value="">Select Year</option>
                      {years.map(y => <option key={y.id} value={y.id}>{y.year_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Upload Excel File (.xlsx, .csv)</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors relative cursor-pointer">
                      <FileSpreadsheet size={32} className="mx-auto text-slate-300 mb-3" />
                      <input type="file" accept=".xlsx, .xls, .csv" required onChange={e => setOldBatchFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      <div className="text-xs font-bold text-slate-500">{oldBatchFile ? oldBatchFile.name : 'Click to select or drag file here'}</div>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase">Expected Columns: Name, Reg No, Class, Gender, Parent, Phone, Status</p>
                  </div>
                  <button disabled={uploadingBatch} className="w-full bg-slate-900 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                    {uploadingBatch ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                    {uploadingBatch ? 'Importing Students...' : 'Import Students'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
