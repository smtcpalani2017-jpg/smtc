'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Sidebar from '@/components/dashboard/Sidebar'
import { Trophy, BarChart3, BookOpen } from 'lucide-react'

interface Mark {
  id: string; student_id: string; subject: string; test_name: string
  marks: number; created_at: string; students?: { name: string; class: string }
}

const SUBJECTS = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Commerce', 'English']

export default function AdminMarksPage() {
  const supabase = createClient()
  const [marks, setMarks] = useState<Mark[]>([])
  const [filtered, setFiltered] = useState<Mark[]>([])
  const [subjectFilter, setSubjectFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  const loadMarks = async () => {
    const { data } = await supabase
      .from('marks')
      .select('*, students(name, class)')
      .order('created_at', { ascending: false })
    setMarks(data || [])
    setFiltered(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadMarks()
    const ch = supabase.channel('marks-admin')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'marks' }, loadMarks)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  useEffect(() => {
    if (subjectFilter === 'All') setFiltered(marks)
    else setFiltered(marks.filter(m => m.subject === subjectFilter))
  }, [subjectFilter, marks])

  const avg = filtered.length > 0 ? Math.round(filtered.reduce((a, m) => a + m.marks, 0) / filtered.length) : 0
  const top = filtered.reduce((a, m) => m.marks > a.marks ? m : a, filtered[0] || { marks: 0, students: { name: '–', class: '' } })
  const grouped = SUBJECTS.slice(1).map(sub => {
    const subMarks = marks.filter(m => m.subject === sub)
    const avg = subMarks.length > 0 ? Math.round(subMarks.reduce((a, m) => a + m.marks, 0) / subMarks.length) : 0
    return { subject: sub, avg, count: subMarks.length }
  }).filter(g => g.count > 0)

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      <Sidebar role="admin" userName="Admin" userEmail="smtcpalani2017@gmail.com" />
      <main className="flex-1 ml-0 md:ml-64 min-h-screen transition-all duration-300">
        <header className="bg-white border-b border-gray-200 min-h-16 py-3 flex items-center px-4 sm:px-8 pl-16 sm:pl-8 sticky top-0 z-30">
          <h1 className="font-serif font-bold text-[#001F3F] text-lg sm:text-xl">Test & Marks Analytics</h1>
        </header>

        <div className="p-4 sm:p-8 space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 text-center">
              <div className="text-3xl font-black text-[#001F3F]">{filtered.length}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Total Records</div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-5 text-center">
              <div className="text-3xl font-black text-[#D4AF37]">{avg}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Class Average</div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-5 text-center">
              <div className="text-3xl font-black text-green-600">{top?.marks || 0}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Top Score</div>
              <div className="text-xs text-gray-400 mt-0.5">{top?.students?.name}</div>
            </div>
          </div>

          {/* Subject Performance */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-serif font-bold text-[#001F3F] text-base mb-5 flex items-center space-x-2">
              <BarChart3 size={16} className="text-[#D4AF37]" />
              <span>Subject-wise Average</span>
            </h2>
            {grouped.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No marks data available</p>
            ) : (
              <div className="space-y-4">
                {grouped.sort((a, b) => b.avg - a.avg).map(g => (
                  <div key={g.subject}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-semibold text-[#001F3F]">{g.subject}</span>
                      <span className={`font-bold text-xs ${g.avg >= 60 ? 'text-green-600' : g.avg >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>{g.avg}/100</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${g.avg >= 60 ? 'bg-green-500' : g.avg >= 40 ? 'bg-yellow-400' : 'bg-red-400'}`}
                        style={{ width: `${g.avg}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{g.count} test entries</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Marks Table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-serif font-bold text-[#001F3F] text-base">All Test Records</h2>
              <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#001F3F] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]">
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Student', 'Class', 'Test Name', 'Subject', 'Marks', 'Grade'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">No marks uploaded yet</td></tr>
                  ) : filtered.map((m) => {
                    const grade = m.marks >= 90 ? 'A+' : m.marks >= 75 ? 'A' : m.marks >= 60 ? 'B' : m.marks >= 45 ? 'C' : 'F'
                    const gradeColor = grade === 'A+' || grade === 'A' ? 'text-green-600 bg-green-100' : grade === 'B' ? 'text-blue-600 bg-blue-100' : grade === 'C' ? 'text-yellow-600 bg-yellow-100' : 'text-red-600 bg-red-100'
                    return (
                      <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-5 py-3 text-sm font-semibold text-[#001F3F]">{m.students?.name || '–'}</td>
                        <td className="px-5 py-3"><span className="text-xs bg-[#001F3F]/10 text-[#001F3F] px-2 py-1 rounded-full font-bold">{m.students?.class || '–'}</span></td>
                        <td className="px-5 py-3 text-sm text-gray-600">{m.test_name}</td>
                        <td className="px-5 py-3 text-sm text-gray-500">{m.subject}</td>
                        <td className="px-5 py-3 text-sm font-black text-[#001F3F]">{m.marks}<span className="text-gray-400 font-normal">/100</span></td>
                        <td className="px-5 py-3"><span className={`text-xs font-black px-2 py-1 rounded-full ${gradeColor}`}>{grade}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
