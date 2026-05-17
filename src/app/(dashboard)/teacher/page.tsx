'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Sidebar from '@/components/dashboard/Sidebar'
import StatsCard from '@/components/dashboard/StatsCard'
import { Users, CalendarCheck, School, ClipboardList, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

export default function TeacherDashboard() {
  const supabase = createClient()
  const [stats, setStats] = useState({
    totalStudents: 0, classCount: 0, todayPresent: 0,
    todayAbsent: 0, todayPct: 0, pendingTests: 0,
  })
  const [recentStudents, setRecentStudents] = useState<{ id: string; name: string; class: string; created_at: string }[]>([])
  const [classes, setClasses] = useState<{ class_name: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const today = new Date().toISOString().split('T')[0]

      const [studRes, attRes, classRes] = await Promise.all([
        supabase.from('students').select('id, name, class, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('attendance').select('status').eq('date', today),
        supabase.from('classes').select('class_name'),
      ])

      const students = studRes.data || []
      const allStudents = (await supabase.from('students').select('id')).data || []
      const att = attRes.data || []
      const present = att.filter((a: { status: string }) => a.status === 'present').length
      const absent = att.filter((a: { status: string }) => a.status === 'absent').length
      const total = present + absent

      // Group students by class
      const allSt = (await supabase.from('students').select('class')).data || []
      const classMap: Record<string, number> = {}
      allSt.forEach((s: { class: string }) => { classMap[s.class] = (classMap[s.class] || 0) + 1 })
      const classArr = Object.entries(classMap).map(([class_name, count]) => ({ class_name, count }))

      setStats({
        totalStudents: allStudents.length,
        classCount: classArr.length,
        todayPresent: present,
        todayAbsent: absent,
        todayPct: total > 0 ? Math.round((present / total) * 100) : 0,
        pendingTests: 0,
      })
      setRecentStudents(students)
      setClasses(classArr)
      setLoading(false)
    }
    loadData()
  }, [])

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      <Sidebar role="teacher" userName="Staff" userEmail="staff@smtc.edu" />
      <main className="flex-1 ml-64 min-h-screen">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 sticky top-0 z-30">
          <div>
            <h1 className="font-serif font-bold text-[#001F3F] text-xl">Staff Dashboard</h1>
            <p className="text-xs text-gray-400">Welcome back! Here&apos;s your overview.</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-xs font-bold text-[#001F3F]">Staff Account</p>
              <p className="text-[10px] text-gray-400">{new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
            </div>
            <div className="h-9 w-9 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">S</div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <StatsCard title="My Students" value={stats.totalStudents} icon={Users} color="navy" />
            <StatsCard title="Classes" value={stats.classCount} icon={School} color="purple" />
            <StatsCard title="Today Present" value={stats.todayPresent} icon={CalendarCheck} color="green" />
            <StatsCard title="Today Absent" value={stats.todayAbsent} icon={AlertCircle} color="red" />
          </div>

          {/* Today's Attendance */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-serif font-bold text-[#001F3F] text-base mb-4">Today&apos;s Attendance Status</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                <CheckCircle2 size={24} className="mx-auto text-green-500 mb-2" />
                <div className="text-2xl font-black text-green-600">{stats.todayPresent}</div>
                <div className="text-xs font-bold text-green-500 uppercase mt-1">Present</div>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                <AlertCircle size={24} className="mx-auto text-red-500 mb-2" />
                <div className="text-2xl font-black text-red-500">{stats.todayAbsent}</div>
                <div className="text-xs font-bold text-red-400 uppercase mt-1">Absent</div>
              </div>
              <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl p-4 text-center">
                <Clock size={24} className="mx-auto text-[#D4AF37] mb-2" />
                <div className="text-2xl font-black text-[#D4AF37]">{stats.todayPct}%</div>
                <div className="text-xs font-bold text-[#D4AF37] uppercase mt-1">Rate</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assigned Classes */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-serif font-bold text-[#001F3F] text-base mb-4">Classes & Students</h2>
              {classes.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No classes assigned yet</p>
              ) : (
                <div className="space-y-3">
                  {classes.map(c => (
                    <div key={c.class_name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="bg-[#001F3F] text-[#D4AF37] w-10 h-10 rounded-xl flex items-center justify-center">
                          <School size={18} />
                        </div>
                        <span className="text-sm font-bold text-[#001F3F]">{c.class_name}</span>
                      </div>
                      <span className="text-xs bg-[#D4AF37]/10 text-[#D4AF37] px-3 py-1 rounded-full font-bold">{c.count} students</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recently Added Students */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif font-bold text-[#001F3F] text-base">Recent Students</h2>
                <a href="/teacher/students" className="text-xs text-[#D4AF37] font-bold hover:underline">Add New →</a>
              </div>
              {recentStudents.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No students added yet</p>
              ) : (
                <div className="space-y-3">
                  {recentStudents.map(s => (
                    <div key={s.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">{s.name.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-[#001F3F] truncate">{s.name}</div>
                        <div className="text-xs text-gray-400">{s.class}</div>
                      </div>
                      <span className="text-[10px] text-gray-400">{new Date(s.created_at).toLocaleDateString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
