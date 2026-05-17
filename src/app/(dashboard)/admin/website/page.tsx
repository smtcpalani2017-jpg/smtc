'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Sidebar from '@/components/dashboard/Sidebar'
import { Globe, Users, Image as ImageIcon, CheckCircle2, Star, Plus, X, Loader2, Trash2, Upload, BookOpen, Calculator, TrendingUp, Beaker, Dna, Trophy, Edit2 } from 'lucide-react'
import { addStaffAction, deleteStaffAction } from '@/app/actions/staff'

const ICON_OPTIONS = {
  'BookOpen': <BookOpen size={20} />,
  'Calculator': <Calculator size={20} />,
  'TrendingUp': <TrendingUp size={20} />,
  'Beaker': <Beaker size={20} />,
  'Dna': <Dna size={20} />,
  'Trophy': <Trophy size={20} />
}

interface NewResultState {
  student_name: string
  exam_name: string
  score: string
  achievement: string
  is_featured: boolean
  image_url: string
}

export default function WebsiteManagement() {
  const supabase = createClient()
  const [faculty, setFaculty] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [success, setSuccess] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const [editingFaculty, setEditingFaculty] = useState<any>(null)
  const [uploading, setUploading] = useState<string | null>(null)
  
  const [newFaculty, setNewFaculty] = useState({ name: '', email: '', subject: '', experience: '', image_url: '', is_featured: true, password: 'staff123' })
  const [newCourse, setNewCourse] = useState({ title: '', description: '', icon_name: 'BookOpen' })
  const [newResult, setNewResult] = useState<NewResultState>({ student_name: '', exam_name: '', score: '', achievement: '', is_featured: true, image_url: '' })

  const loadData = async () => {
    setLoading(true)
    const [facRes, courRes, resRes] = await Promise.all([
      supabase.from('users').select('*').eq('role', 'staff').order('created_at', { ascending: false }),
      supabase.from('website_courses').select('*').order('created_at', { ascending: true }),
      supabase.from('website_results').select('*').order('created_at', { ascending: false })
    ])
    setFaculty(facRes.data || [])
    setCourses(courRes.data || [])
    setResults(resRes.data || [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleUpdate = async (table: string, id: string, updates: any) => {
    setSavingId(id)
    const { error } = await supabase.from(table).update(updates).eq('id', id)
    if (!error) {
      setSuccess('Updated successfully!')
      loadData()
      setTimeout(() => setSuccess(''), 3000)
    }
    setSavingId(null)
  }

  const handleDelete = async (table: string, id: string) => {
    if (!confirm('Are you sure you want to delete this?')) return
    
    if (table === 'users') {
      setSavingId(id)
      const res = await deleteStaffAction(id)
      setSavingId(null)
      if (!res.success) {
        alert(res.error)
        return
      }
    } else {
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) {
        alert(error.message)
        return
      }
    }
    
    setSuccess('Deleted successfully')
    setTimeout(() => setSuccess(''), 3000)
    loadData()
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, staffId: string | 'new') => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(staffId)
    const fileName = `${Math.random()}.${file.name.split('.').pop()}`
    const { error: uploadError } = await supabase.storage.from('faculty').upload(fileName, file)
    if (uploadError) { alert(uploadError.message); setUploading(null); return }
    const { data: { publicUrl } } = supabase.storage.from('faculty').getPublicUrl(fileName)
    if (staffId === 'new') setNewFaculty({ ...newFaculty, image_url: publicUrl })
    else if (staffId === 'newResult') setNewResult({ ...newResult, image_url: publicUrl })
    else if (staffId.startsWith('result_')) await handleUpdate('website_results', staffId.replace('result_', ''), { image_url: publicUrl })
    else await handleUpdate('users', staffId, { image_url: publicUrl })
    setUploading(null)
  }

  const handleAdd = async (table: string, data: any, closeModal: () => void) => {
    setSavingId('adding')
    
    if (table === 'users') {
      const result = await addStaffAction({ name: data.name, email: data.email, password: data.password })
      if (result.success) {
        const { data: newUser } = await supabase.from('users').select('id').eq('email', data.email).single()
        if (newUser) {
          await supabase.from('users').update({ subject: data.subject, experience: data.experience, image_url: data.image_url, is_featured: data.is_featured }).eq('id', newUser.id)
        }
        setSuccess('Staff account created successfully!')
        closeModal(); loadData()
      } else alert('Error: ' + result.error)
    } else {
      const { error } = await supabase.from(table).insert(data)
      if (!error) { setSuccess('Added successfully!'); closeModal(); loadData() }
      else alert(error.message)
    }
    setSavingId(null)
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      <Sidebar role="admin" userName="Admin" userEmail="smtcpalani2017@gmail.com" />
      <main className="flex-1 ml-0 md:ml-64 min-h-screen transition-all duration-300">
        <header className="bg-white border-b border-gray-200 min-h-16 py-3 flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-8 pl-16 sm:pl-8 gap-3 sticky top-0 z-30">
          <div>
            <h1 className="font-serif font-bold text-[#001F3F] text-lg sm:text-xl">Website Management</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Live Page Editor</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
             <button onClick={() => setShowResultModal(true)} className="flex items-center space-x-2 bg-[#001F3F] text-[#D4AF37] px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase shadow-lg hover:bg-navy-light transition-all"><Trophy size={16} /><span>Add Result</span></button>
             <button onClick={() => setShowCourseModal(true)} className="flex items-center space-x-2 bg-[#001F3F] text-[#D4AF37] px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase shadow-lg"><Plus size={16} /><span>Add Course</span></button>
             <button onClick={() => setShowAddModal(true)} className="flex items-center space-x-2 bg-[#D4AF37] text-[#001229] px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase shadow-lg"><Plus size={16} /><span>Add Faculty</span></button>
          </div>
        </header>

        <div className="p-4 sm:p-8 space-y-16 pb-24">
          {success && <div className="bg-green-50 border border-green-200 p-4 rounded-2xl flex items-center space-x-3 text-green-700 animate-in fade-in slide-in-from-top-4 mb-8"><CheckCircle2 size={20} /><span className="font-bold">{success}</span></div>}

          {/* ACADEMIC RESULTS SECTION */}
          <section className="space-y-8">
            <div className="border-l-4 border-gold pl-6">
               <h2 className="text-2xl font-serif font-bold text-navy">Academic Results</h2>
               <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Showcase Toppers on Home Page</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               {results.map(r => (
                 <div key={r.id} className="bg-white p-6 rounded-3xl border border-gray-100 space-y-4 hover:border-gold transition-all group relative overflow-hidden">
                    <div className="flex justify-between items-start relative z-10">
                       <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 border-2 border-gray-100 shrink-0">
                          {r.image_url ? <img src={r.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gold bg-gold/5"><Trophy size={24} /></div>}
                          <label className="absolute inset-0 bg-navy/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white">
                             <input type="file" className="hidden" onChange={e => handleImageUpload(e, `result_${r.id}`)} />
                             {uploading === `result_${r.id}` ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                          </label>
                       </div>
                       <button onClick={() => handleDelete('website_results', r.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all p-2 bg-red-50 rounded-xl"><Trash2 size={18} /></button>
                    </div>
                    <div className="relative z-10">
                       <input defaultValue={r.student_name} onBlur={e => handleUpdate('website_results', r.id, { student_name: e.target.value })} className="bg-transparent border-none p-0 text-sm font-bold text-navy focus:ring-0 w-full" />
                       <input defaultValue={r.exam_name} onBlur={e => handleUpdate('website_results', r.id, { exam_name: e.target.value })} className="bg-transparent border-none p-0 text-[10px] font-bold text-gray-400 uppercase tracking-widest focus:ring-0 w-full" />
                    </div>
                    <div className="grid grid-cols-1 gap-2 pt-2 border-t border-gray-50 relative z-10">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] text-gray-400 font-bold">Score:</span>
                          <input defaultValue={r.score} onBlur={e => handleUpdate('website_results', r.id, { score: e.target.value })} className="bg-transparent border-none p-0 text-[10px] font-black text-navy focus:ring-0 text-right" />
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] text-gray-400 font-bold">Badge:</span>
                          <input defaultValue={r.achievement} onBlur={e => handleUpdate('website_results', r.id, { achievement: e.target.value })} className="bg-transparent border-none p-0 text-[10px] font-black text-gold focus:ring-0 text-right" />
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </section>

          {/* FACULTY PROFILES SECTION */}
          <section className="space-y-8">
            <div className="border-l-4 border-gold pl-6">
               <h2 className="text-2xl font-serif font-bold text-navy">Faculty Profiles</h2>
               <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Manage Teachers on Homepage</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {faculty.map(f => (
                 <div key={f.id} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-6 group hover:border-gold transition-all">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 border-2 border-gray-100 shrink-0">
                       {f.image_url ? <img src={f.image_url} className="w-full h-full object-cover" /> : <ImageIcon size={20} className="m-auto mt-5 text-gray-200" />}
                       <label className="absolute inset-0 bg-navy/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white">
                          <input type="file" className="hidden" onChange={e => handleImageUpload(e, f.id)} />
                          {uploading === f.id ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                       </label>
                    </div>
                    <div className="flex-1 grid grid-cols-1 gap-1">
                       <input defaultValue={f.name} onBlur={e => handleUpdate('users', f.id, { name: e.target.value })} className="bg-transparent border-none p-0 text-sm font-bold text-navy focus:ring-0" />
                       <div className="flex gap-2">
                         <input defaultValue={f.subject} onBlur={e => handleUpdate('users', f.id, { subject: e.target.value })} className="bg-transparent border-none p-0 text-[10px] font-bold text-gray-400 uppercase tracking-widest focus:ring-0" />
                         <span className="text-gray-300">•</span>
                         <input defaultValue={f.experience} onBlur={e => handleUpdate('users', f.id, { experience: e.target.value })} className="bg-transparent border-none p-0 text-[10px] font-bold text-gold uppercase tracking-widest focus:ring-0" />
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => { setEditingFaculty(f); setShowEditModal(true) }} className="p-2 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"><Edit2 size={16} /></button>
                       <button onClick={() => handleUpdate('users', f.id, { is_featured: !f.is_featured })} className={`p-2 rounded-lg transition-colors ${f.is_featured ? 'bg-gold text-navy' : 'bg-gray-50 text-gray-300'}`}><Star size={16} fill={f.is_featured ? 'currentColor' : 'none'} /></button>
                       <button onClick={() => handleDelete('users', f.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={16} /></button>
                    </div>
                 </div>
               ))}
            </div>
          </section>

          {/* WEBSITE COURSES SECTION */}
          <section className="space-y-8">
            <div className="border-l-4 border-gold pl-6">
               <h2 className="text-2xl font-serif font-bold text-navy">Website Courses</h2>
               <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Add or Edit Academic Programs</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {courses.map(c => (
                 <div key={c.id} className="bg-white p-8 rounded-[40px] border border-gray-100 space-y-6 hover:border-gold transition-all group">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-navy text-gold rounded-2xl">{ICON_OPTIONS[c.icon_name as keyof typeof ICON_OPTIONS] || <BookOpen size={24} />}</div>
                          <input defaultValue={c.title} onBlur={e => handleUpdate('website_courses', c.id, { title: e.target.value })} className="bg-transparent border-none font-bold text-navy text-lg focus:ring-0" />
                       </div>
                       <button onClick={() => handleDelete('website_courses', c.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all p-2 bg-red-50 rounded-xl"><Trash2 size={20} /></button>
                    </div>
                    <textarea defaultValue={c.description} onBlur={e => handleUpdate('website_courses', c.id, { description: e.target.value })} rows={3} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm text-gray-500 resize-none focus:ring-gold" />
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                       <div className="flex gap-2">
                          {Object.keys(ICON_OPTIONS).map(icon => (
                            <button key={icon} onClick={() => handleUpdate('website_courses', c.id, { icon_name: icon })} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${c.icon_name === icon ? 'bg-gold text-navy shadow-lg' : 'bg-gray-100 text-gray-400'}`}>{icon[0]}</button>
                          ))}
                       </div>
                       <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Live</span>
                          <button onClick={() => handleUpdate('website_courses', c.id, { is_active: !c.is_active })} className={`w-12 h-6 rounded-full relative transition-colors ${c.is_active ? 'bg-green-500' : 'bg-gray-200'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${c.is_active ? 'right-1' : 'left-1'}`} /></button>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </section>
        </div>

        {/* MODALS */}
        {showAddModal && (
          <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="bg-navy p-6 text-white flex justify-between items-center"><h3 className="font-serif font-bold text-xl">Add Faculty</h3><button onClick={() => setShowAddModal(false)}><X /></button></div>
              <form onSubmit={e => { e.preventDefault(); handleAdd('users', {...newFaculty, role: 'staff'}, () => setShowAddModal(false)) }} className="p-8 space-y-4">
                 <input placeholder="Name" required className="w-full bg-slate-50 border border-gray-100 rounded-xl p-4 text-sm font-bold text-navy placeholder:text-gray-400" onChange={e => setNewFaculty({...newFaculty, name: e.target.value})} />
                 <input placeholder="Email" type="email" required className="w-full bg-slate-50 border border-gray-100 rounded-xl p-4 text-sm font-bold text-navy placeholder:text-gray-400" onChange={e => setNewFaculty({...newFaculty, email: e.target.value})} />
                 <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Subject" className="bg-slate-50 border border-gray-100 rounded-xl p-4 text-sm font-bold text-navy placeholder:text-gray-400" onChange={e => setNewFaculty({...newFaculty, subject: e.target.value})} />
                    <input placeholder="Experience" className="bg-slate-50 border border-gray-100 rounded-xl p-4 text-sm font-bold text-navy placeholder:text-gray-400" onChange={e => setNewFaculty({...newFaculty, experience: e.target.value})} />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Login Password</label>
                    <input 
                      type="text" 
                      placeholder="Password (e.g. staff123)" 
                      className="w-full bg-slate-50 border border-gray-100 rounded-xl p-4 text-sm font-bold text-navy placeholder:text-gray-400" 
                      value={newFaculty.password}
                      onChange={e => setNewFaculty({...newFaculty, password: e.target.value})} 
                    />
                 </div>
                 <button type="submit" className="w-full bg-navy text-gold py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-navy-light transition-all">Confirm Add</button>
              </form>
            </div>
          </div>
        )}

        {showEditModal && editingFaculty && (
          <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="bg-navy p-6 text-white flex justify-between items-center"><h3 className="font-serif font-bold text-xl">Edit Faculty Profile</h3><button onClick={() => setShowEditModal(false)}><X /></button></div>
              <form onSubmit={e => { e.preventDefault(); handleUpdate('users', editingFaculty.id, editingFaculty); setShowEditModal(false) }} className="p-8 space-y-4">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input value={editingFaculty.name} required className="w-full bg-slate-50 border border-gray-100 rounded-xl p-4 text-sm font-bold text-navy" onChange={e => setEditingFaculty({...editingFaculty, name: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                       <input value={editingFaculty.subject} className="w-full bg-slate-50 border border-gray-100 rounded-xl p-4 text-sm font-bold text-navy" onChange={e => setEditingFaculty({...editingFaculty, subject: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Experience</label>
                       <input value={editingFaculty.experience} className="w-full bg-slate-50 border border-gray-100 rounded-xl p-4 text-sm font-bold text-navy" onChange={e => setEditingFaculty({...editingFaculty, experience: e.target.value})} />
                    </div>
                 </div>
                 <button type="submit" className="w-full bg-navy text-gold py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-navy-light transition-all">Update Profile</button>
              </form>
            </div>
          </div>
        )}

        {showResultModal && (
          <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="bg-navy p-6 text-white flex justify-between items-center"><h3 className="font-serif font-bold text-xl">Add Student Result</h3><button onClick={() => setShowResultModal(false)}><X /></button></div>
              <form onSubmit={e => { e.preventDefault(); handleAdd('website_results', newResult, () => setShowResultModal(false)) }} className="p-8 space-y-4">
                 <div className="flex justify-center mb-4">
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-50 border-2 border-dashed border-gray-200 flex items-center justify-center group hover:border-gold transition-all">
                       {newResult.image_url ? <img src={newResult.image_url} className="w-full h-full object-cover" /> : <div className="text-center"><Upload className="mx-auto text-gray-300" size={24} /><span className="text-[10px] font-bold text-gray-400 uppercase mt-1 block">Photo</span></div>}
                       <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleImageUpload(e, 'newResult')} />
                       {uploading === 'newResult' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-navy" size={20} /></div>}
                    </div>
                 </div>
                 <input placeholder="Student Name" required className="w-full bg-slate-50 border border-gray-100 rounded-xl p-4 text-sm font-bold text-navy placeholder:text-gray-400" onChange={e => setNewResult({...newResult, student_name: e.target.value})} />
                 <input placeholder="Exam Name (e.g. NEET 2024)" required className="w-full bg-slate-50 border border-gray-100 rounded-xl p-4 text-sm font-bold text-navy placeholder:text-gray-400" onChange={e => setNewResult({...newResult, exam_name: e.target.value})} />
                 <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Score (e.g. 695/720)" className="bg-slate-50 border border-gray-100 rounded-xl p-4 text-sm font-bold text-navy placeholder:text-gray-400" onChange={e => setNewResult({...newResult, score: e.target.value})} />
                    <input placeholder="Achievement (e.g. District Topper)" className="bg-slate-50 border border-gray-100 rounded-xl p-4 text-sm font-bold text-navy placeholder:text-gray-400" onChange={e => setNewResult({...newResult, achievement: e.target.value})} />
                 </div>
                 <button type="submit" className="w-full bg-navy text-gold py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-navy-light transition-all">Add to Hall of Fame</button>
              </form>
            </div>
          </div>
        )}

        {showCourseModal && (
          <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="bg-navy p-6 text-white flex justify-between items-center"><h3 className="font-serif font-bold text-xl">Add New Course</h3><button onClick={() => setShowCourseModal(false)}><X /></button></div>
              <form onSubmit={e => { e.preventDefault(); handleAdd('website_courses', newCourse, () => setShowCourseModal(false)) }} className="p-8 space-y-4">
                 <input placeholder="Course Title" required className="w-full bg-slate-50 border border-gray-100 rounded-xl p-4 text-sm font-bold text-navy placeholder:text-gray-400" onChange={e => setNewCourse({...newCourse, title: e.target.value})} />
                 <textarea placeholder="Course Description" required rows={4} className="w-full bg-slate-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-navy placeholder:text-gray-400 resize-none" onChange={e => setNewCourse({...newCourse, description: e.target.value})} />
                 <div className="flex gap-2 justify-center">
                    {Object.keys(ICON_OPTIONS).map(icon => (
                      <button type="button" key={icon} onClick={() => setNewCourse({...newCourse, icon_name: icon})} className={`p-3 rounded-xl ${newCourse.icon_name === icon ? 'bg-gold text-navy' : 'bg-gray-100'}`}>{ICON_OPTIONS[icon as keyof typeof ICON_OPTIONS]}</button>
                    ))}
                 </div>
                 <button type="submit" className="w-full bg-navy text-gold py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-navy-light transition-all">Add to Website</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
