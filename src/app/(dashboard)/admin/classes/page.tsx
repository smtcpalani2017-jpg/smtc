'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Sidebar from '@/components/dashboard/Sidebar'
import { 
  Plus, Edit2, Trash2, Loader2, X, ArrowLeft,
  GraduationCap, Users, User, CheckCircle2,
  BookOpen, BarChart3, ChevronRight, Award,
  Phone, MapPin, School as SchoolIcon, CreditCard, Mail
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminClassManagement() {
  const supabase = createClient()
  const [classes, setClasses] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Navigation State
  const [viewingClass, setViewingClass] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState<'students' | 'results'>('students')
  const [classStudents, setClassStudents] = useState<any[]>([])
  const [classTests, setClassTests] = useState<any[]>([])
  const [selectedTest, setSelectedTest] = useState<any | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null)

  // CRUD State
  const [showModal, setShowModal] = useState(false)
  const [editingClass, setEditingClass] = useState<any | null>(null)
  const [formData, setFormData] = useState({ class_name: '', staff_id: '' })

  const loadData = async () => {
    setLoading(true)
    const [classesRes, staffRes, studentsRes] = await Promise.all([
      supabase.from('classes').select('*, users(name)').order('class_name'),
      supabase.from('users').select('*').eq('role', 'staff'),
      supabase.from('students').select('class, gender')
    ])

    const statsMap: any = {}
    studentsRes.data?.forEach(s => {
        if (!statsMap[s.class]) statsMap[s.class] = { total: 0, boys: 0, girls: 0 }
        statsMap[s.class].total++
        if (s.gender === 'Male') statsMap[s.class].boys++
        else statsMap[s.class].girls++
    })

    const enrichedClasses = (classesRes.data || []).map(c => ({
        ...c,
        stats: statsMap[c.class_name] || { total: 0, boys: 0, girls: 0 }
    }))

    setClasses(enrichedClasses)
    setStaff(staffRes.data || [])
    setLoading(false)
  }

  const loadClassHub = async (className: string) => {
    setLoading(true)
    const [studentsRes, marksRes] = await Promise.all([
        supabase.from('students').select('*').eq('class', className).order('name'),
        supabase.from('marks').select('*, students(name, register_number, class)').eq('students.class', className).order('created_at', { ascending: false })
    ])

    setClassStudents(studentsRes.data || [])
    
    const grouped: any = {}
    marksRes.data?.forEach(m => {
        if (!m.students) return
        if (!grouped[m.test_name]) {
            grouped[m.test_name] = {
                name: m.test_name, subject: m.subject, date: new Date(m.created_at).toLocaleDateString('en-IN'),
                outOf: m.out_of || 100, scores: []
            }
        }
        grouped[m.test_name].scores.push({
            student: m.students.name, regNo: m.students.register_number,
            mark: m.marks, grade: m.grade
        })
    })
    setClassTests(Object.values(grouped))
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleClassClick = (cls: any) => {
    setViewingClass(cls)
    setActiveTab('students')
    loadClassHub(cls.class_name)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    if (editingClass) await supabase.from('classes').update(formData).eq('id', editingClass.id)
    else await supabase.from('classes').insert([formData])
    setShowModal(false)
    setEditingClass(null)
    setFormData({ class_name: '', staff_id: '' })
    loadData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return
    const { error } = await supabase.from('classes').delete().eq('id', id)
    if (!error) loadData()
    else alert(error.message)
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar role="admin" />
      <main className="flex-1 ml-0 md:ml-64 min-h-screen p-4 sm:p-10 transition-all duration-300">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-12 pl-12 sm:pl-0">
          <div className="flex items-center gap-4">
             {(viewingClass || selectedTest) && (
               <button 
                  onClick={() => { 
                    if (selectedTest) setSelectedTest(null)
                    else setViewingClass(null)
                  }} 
                  className="p-2 hover:bg-white rounded-2xl transition-all shadow-sm border border-slate-100"
               >
                 <ArrowLeft size={20} className="text-slate-900" />
               </button>
             )}
             <div>
               <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {selectedTest ? selectedTest.name : (viewingClass ? viewingClass.class_name : 'Class Management')}
               </h1>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {viewingClass ? `Assigned Staff: ${viewingClass.users?.name || 'Unassigned'}` : 'Institutional Structure Control'}
               </p>
             </div>
          </div>
          
          {!viewingClass && (
            <button 
                onClick={() => { setEditingClass(null); setShowModal(true); }}
                className="bg-slate-900 text-white px-6 sm:px-8 py-3 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 w-fit"
            >
                <Plus size={16} /> Create Class
            </button>
          )}

          {viewingClass && !selectedTest && (
            <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 shadow-inner border border-slate-200/50 w-fit">
                <button onClick={() => setActiveTab('students')} className={`px-4 sm:px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'students' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Students</button>
                <button onClick={() => setActiveTab('results')} className={`px-4 sm:px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'results' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Test Hub</button>
            </div>
          )}
        </header>

        <AnimatePresence mode="wait">
          {!viewingClass ? (
            <motion.div key="grid" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {classes.map((cls) => (
                 <motion.div 
                    key={cls.id} onClick={() => handleClassClick(cls)}
                    className="bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-slate-900 transition-all overflow-hidden group cursor-pointer"
                 >
                    <div className="bg-slate-900 p-8 text-white relative">
                        <div className="flex justify-between items-start mb-6">
                           <div className="bg-white/10 p-3 rounded-2xl text-white"><GraduationCap size={24} /></div>
                           <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                              <button onClick={() => { setEditingClass(cls); setFormData({ class_name: cls.class_name, staff_id: cls.staff_id }); setShowModal(true); }} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><Edit2 size={14} /></button>
                              <button onClick={() => handleDelete(cls.id)} className="p-2 bg-rose-500/20 hover:bg-rose-500 text-white rounded-xl transition-all"><Trash2 size={14} /></button>
                           </div>
                        </div>
                        <h3 className="text-2xl font-black">{cls.class_name}</h3>
                        <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">Assigned: {cls.users?.name || 'Unassigned'}</div>
                    </div>
                    <div className="p-8 grid grid-cols-3 gap-4 text-center">
                        <div><div className="text-lg font-black text-slate-900">{cls.stats.total}</div><div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Students</div></div>
                        <div className="border-x border-slate-50"><div className="text-lg font-black text-blue-500">{cls.stats.boys}</div><div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Boys</div></div>
                        <div><div className="text-lg font-black text-rose-500">{cls.stats.girls}</div><div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Girls</div></div>
                    </div>
                 </motion.div>
               ))}
            </motion.div>
          ) : activeTab === 'students' ? (
             <motion.div key="students" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-[48px] border border-slate-100 shadow-xl overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Profile</th>
                        <th className="px-10 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Reg No</th>
                        <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {loading ? (
                         <tr><td colSpan={3} className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-slate-200" size={40} /></td></tr>
                      ) : classStudents.map((s) => (
                         <tr 
                            key={s.id} onClick={() => setSelectedStudent(s)}
                            className="hover:bg-slate-50 transition-all cursor-pointer group"
                         >
                            <td className="px-10 py-4 flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-slate-400 border border-slate-100 group-hover:bg-white transition-colors">{s.name[0]}</div>
                               <div><div className="text-sm font-bold text-slate-900">{s.name}</div><div className="text-[9px] text-slate-400 font-bold uppercase">{s.school_name || 'SMTC Student'}</div></div>
                            </td>
                            <td className="px-10 py-4 text-center text-xs font-bold text-slate-400">{s.register_number}</td>
                            <td className="px-10 py-4 text-right">
                               <span className="bg-emerald-50 text-emerald-600 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Enrolled</span>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </motion.div>
          ) : !selectedTest ? (
             <motion.div key="tests" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classTests.map((test, i) => (
                    <button key={i} onClick={() => setSelectedTest(test)} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-900 transition-all text-left group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-slate-50 text-slate-900 p-3 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-colors"><Award size={20} /></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{test.date}</span>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 mb-1">{test.name}</h3>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">{test.subject}</div>
                        <div className="pt-6 border-t border-slate-50 flex items-center justify-between text-[10px] font-black uppercase text-slate-900">
                            Details <ChevronRight size={16} />
                        </div>
                    </button>
                ))}
             </motion.div>
          ) : (
            <motion.div key="results-detail" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[48px] border border-slate-100 shadow-xl overflow-x-auto">
                <div className="p-10 border-b border-slate-50 bg-slate-50/20 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-lg shadow-slate-900/20"><BarChart3 size={24} /></div>
                        <div><h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{selectedTest.name}</h3><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedTest.subject} • {selectedTest.date}</p></div>
                    </div>
                    <div className="bg-slate-900 text-white px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest">Out of {selectedTest.outOf}</div>
                </div>
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Rank & Student</th>
                            <th className="px-10 py-5 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Mark Progress</th>
                            <th className="px-10 py-5 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Final Mark</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {selectedTest.scores.sort((a:any, b:any) => b.mark - a.mark).map((score: any, idx: number) => {
                            const pct = (score.mark / selectedTest.outOf) * 100
                            return (
                                <tr key={idx} className="hover:bg-slate-50/30 transition-all">
                                    <td className="px-10 py-4 flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${idx < 3 ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>{idx + 1}</div>
                                        <div><div className="text-sm font-bold text-slate-900">{score.student}</div><div className="text-[9px] font-bold text-slate-400 uppercase">{score.regNo}</div></div>
                                    </td>
                                    <td className="px-10 py-4">
                                        <div className="h-1.5 w-full max-w-[200px] mx-auto bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className={`h-full rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                        </div>
                                    </td>
                                    <td className="px-10 py-4 text-right">
                                        <span className={`text-base font-black ${pct >= 80 ? 'text-emerald-600' : pct >= 40 ? 'text-slate-900' : 'text-rose-600'}`}>{score.mark} <span className="text-[10px] font-normal text-slate-300">/ {selectedTest.outOf}</span></span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Student Detail Modal */}
        <AnimatePresence>
          {selectedStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedStudent(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-2xl rounded-[32px] sm:rounded-[48px] overflow-hidden shadow-2xl relative z-10"
              >
                <div className="bg-slate-900 p-8 sm:p-12 text-white relative">
                   <button onClick={() => setSelectedStudent(null)} className="absolute top-8 right-8 p-2 hover:bg-white/10 rounded-full transition-all"><X size={20} /></button>
                   <div className="flex items-center gap-8">
                      <div className="w-24 h-24 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center text-4xl font-black">{selectedStudent.name[0]}</div>
                      <div>
                         <h2 className="text-3xl font-black mb-1">{selectedStudent.name}</h2>
                         <div className="bg-white/10 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-block">{selectedStudent.register_number}</div>
                      </div>
                   </div>
                </div>
                
                <div className="p-6 sm:p-12 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
                   <div className="space-y-8">
                      <DetailItem icon={<Phone size={16} />} label="Parent Contact" value={selectedStudent.parent_phone} />
                      <DetailItem icon={<Mail size={16} />} label="Email Address" value={selectedStudent.email || 'Not Provided'} />
                      <DetailItem icon={<MapPin size={16} />} label="Residential Address" value={selectedStudent.address} />
                   </div>
                   <div className="space-y-8">
                      <DetailItem icon={<SchoolIcon size={16} />} label="Academic Institution" value={selectedStudent.school_name} />
                      <DetailItem icon={<CreditCard size={16} />} label="Fee Structure" value={selectedStudent.payment_plan} />
                      <DetailItem icon={<User size={16} />} label="Gender" value={selectedStudent.gender} />
                   </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* CRUD Modal */}
        <AnimatePresence>
           {showModal && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white w-full max-w-md rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 shadow-2xl relative z-10">
                   <h2 className="text-xl font-black text-slate-900 mb-8">{editingClass ? 'Edit Class' : 'Create Class'}</h2>
                   <form onSubmit={handleSubmit} className="space-y-6">
                      <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Class Name</label><input required type="text" value={formData.class_name} onChange={e => setFormData({...formData, class_name: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-slate-900" placeholder="e.g. 10th A" /></div>
                      <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Assign Staff</label><select required value={formData.staff_id || ''} onChange={e => setFormData({...formData, staff_id: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-slate-900 cursor-pointer"><option value="">Select a Teacher</option>{staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.subject})</option>)}</select></div>
                      <button className="w-full bg-slate-900 text-white py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all">Save Class Details</button>
                   </form>
                </motion.div>
             </div>
           )}
        </AnimatePresence>
      </main>
    </div>
  )
}

function DetailItem({ icon, label, value }: any) {
  return (
    <div className="flex gap-4 items-start">
       <div className="bg-slate-50 p-2.5 rounded-xl text-slate-400 mt-1">{icon}</div>
       <div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</div>
          <div className="text-sm font-bold text-slate-900 leading-tight">{value}</div>
       </div>
    </div>
  )
}
