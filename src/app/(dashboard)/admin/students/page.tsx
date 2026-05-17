'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Sidebar from '@/components/dashboard/Sidebar'
import { Search, Filter, Eye, Trash2, UserPlus, Download, ChevronDown } from 'lucide-react'

interface Student {
  id: string; name: string; register_number: string; class: string
  gender: string; parent_name: string; parent_phone: string
  address: string; join_date: string; created_at: string; created_by?: string
}

const CLASSES = ['All', '10th A', '10th B', '11th Science', '11th Commerce', '12th Science', '12th Commerce', 'NEET', 'JEE']

export default function AdminStudentsPage() {
  const supabase = createClient()
  const [students, setStudents] = useState<Student[]>([])
  const [filtered, setFiltered] = useState<Student[]>([])
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('All')
  const [genderFilter, setGenderFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Student | null>(null)

  const loadStudents = async () => {
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
      <main className="flex-1 ml-0 md:ml-64 min-h-screen transition-all duration-300">
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
                {CLASSES.map(c => <option key={c}>{c}</option>)}
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
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-[#001F3F] text-lg">Student Profile</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black ${selected.gender === 'Male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                {selected.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-[#001F3F] text-lg">{selected.name}</h3>
                <p className="text-xs text-gray-400">{selected.register_number} · {selected.class}</p>
              </div>
            </div>
            {[
              ['Gender', selected.gender], ['Parent', selected.parent_name],
              ['Phone', selected.parent_phone], ['Address', selected.address],
              ['Joined', selected.join_date ? new Date(selected.join_date).toLocaleDateString('en-IN') : '–'],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-xs font-bold text-gray-400 uppercase">{label}</span>
                <span className="text-sm text-[#001F3F] font-medium">{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
