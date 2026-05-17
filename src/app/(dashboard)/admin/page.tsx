'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Sidebar from '@/components/dashboard/Sidebar'
import StatsCard from '@/components/dashboard/StatsCard'
import {
  Users, UserSquare2, CalendarCheck, School, TrendingUp,
  Bell, RefreshCw, AlertCircle, CheckCircle2, Clock, Activity, UserPlus
} from 'lucide-react'

interface Notification {
  id: string
  message: string
  type: 'student_added' | 'attendance_marked' | 'marks_uploaded'
  created_at: string
  created_by_name?: string
}

export default function AdminDashboard() {
  const supabase = createClient()
  const [stats, setStats] = useState({
    totalStudents: 0, totalStaff: 0, totalClasses: 0,
    todayAttendance: 0, boys: 0, girls: 0, presentToday: 0, absentToday: 0,
  })
  const [recentStudents, setRecentStudents] = useState<{ id: string; name: string; class: string; gender: string; created_at: string }[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const loadDashboardData = async () => {
    const today = new Date().toISOString().split('T')[0]
    const [studentsRes, staffRes, classesRes, attendanceRes] = await Promise.all([
      supabase.from('students').select('id, name, class, gender, created_at').order('created_at', { ascending: false }).limit(10),
      supabase.from('users').select('id').eq('role', 'staff'),
      supabase.from('classes').select('id'),
      supabase.from('attendance').select('status').eq('date', today),
    ])

    const students = studentsRes.data || []
    const allStudents = (await supabase.from('students').select('gender')).data || []
    const boys = allStudents.filter(s => s.gender === 'Male').length
    const girls = allStudents.filter(s => s.gender === 'Female').length
    const attendance = attendanceRes.data || []
    const presentToday = attendance.filter(a => a.status === 'present').length
    const absentToday = attendance.filter(a => a.status === 'absent').length
    const totalAtt = presentToday + absentToday
    const attPct = totalAtt > 0 ? Math.round((presentToday / totalAtt) * 100) : 0

    setStats({
      totalStudents: allStudents.length,
      totalStaff: (staffRes.data || []).length,
      totalClasses: (classesRes.data || []).length,
      todayAttendance: attPct,
      boys, girls, presentToday, absentToday,
    })
    setRecentStudents(students)
    setLastUpdated(new Date())
    setLoading(false)
  }

  useEffect(() => {
    loadDashboardData()

    // Realtime subscription for new students
    const channel = supabase
      .channel('admin-dashboard')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'students' }, (payload) => {
        const s = payload.new as { id: string; name: string; class: string }
        setNotifications(prev => [{
          id: Date.now().toString(),
          message: `New student "${s.name}" added to ${s.class}`,
          type: 'student_added',
          created_at: new Date().toISOString(),
        }, ...prev.slice(0, 9)])
        loadDashboardData()
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attendance' }, (payload) => {
        const a = payload.new as { class: string; date: string }
        setNotifications(prev => [{
          id: Date.now().toString(),
          message: `Attendance marked for ${a.class} on ${a.date}`,
          type: 'attendance_marked',
          created_at: new Date().toISOString(),
        }, ...prev.slice(0, 9)])
        loadDashboardData()
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'marks' }, (payload) => {
        const m = payload.new as { subject: string; test_name: string }
        setNotifications(prev => [{
          id: Date.now().toString(),
          message: `Marks uploaded for ${m.test_name} – ${m.subject}`,
          type: 'marks_uploaded',
          created_at: new Date().toISOString(),
        }, ...prev.slice(0, 9)])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const notifIcon = (type: string) => {
    if (type === 'student_added') return <UserPlus size={14} className="text-blue-500" />
    if (type === 'attendance_marked') return <CalendarCheck size={14} className="text-green-500" />
    return <CheckCircle2 size={14} className="text-purple-500" />
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      <Sidebar role="admin" userName="Admin" userEmail="smtcpalani2017@gmail.com" />
      <main className="flex-1 ml-0 md:ml-64 min-h-screen transition-all duration-300">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 min-h-16 py-3 flex items-center justify-between px-4 sm:px-8 pl-16 sm:pl-8 sticky top-0 z-30">
          <div>
            <h1 className="font-serif font-bold text-[#001F3F] text-lg sm:text-xl">Admin Overview</h1>
            <p className="text-[10px] sm:text-xs text-gray-400">Sri Murugan Tuition Center – Palani</p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="text-[10px] sm:text-xs text-gray-400 hidden xs:inline">Updated: {lastUpdated.toLocaleTimeString('en-IN')}</span>
            <button onClick={loadDashboardData} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
              <RefreshCw size={16} />
            </button>
            <div className="relative">
              <Bell size={20} className="text-gray-500" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </div>
            <div className="h-9 w-9 bg-[#D4AF37] text-[#001229] rounded-full flex items-center justify-center font-bold text-sm shrink-0">A</div>
          </div>
        </header>

        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <StatsCard title="Total Students" value={stats.totalStudents} icon={Users} color="navy" subtitle={`${stats.boys} Boys · ${stats.girls} Girls`} />
            <StatsCard title="Total Staff" value={stats.totalStaff} icon={UserSquare2} color="blue" />
            <StatsCard title="Active Classes" value={stats.totalClasses} icon={School} color="purple" />
            <StatsCard title="Today's Attendance" value={`${stats.todayAttendance}%`} icon={CalendarCheck} color="green" subtitle={`${stats.presentToday} Present · ${stats.absentToday} Absent`} />
          </div>

          {/* Boys/Girls Ratio */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-serif font-bold text-[#001F3F] text-base mb-4">Gender Distribution</h2>
            <div className="flex items-center space-x-4 mb-3">
              <span className="text-sm font-bold text-blue-600">Boys: {stats.boys}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-700"
                  style={{ width: stats.totalStudents > 0 ? `${(stats.boys / stats.totalStudents) * 100}%` : '0%' }}
                />
              </div>
              <span className="text-sm font-bold text-pink-600">Girls: {stats.girls}</span>
            </div>
            <div className="text-xs text-gray-400 text-center">
              {stats.totalStudents > 0 ? `${Math.round((stats.boys / stats.totalStudents) * 100)}% Boys · ${Math.round((stats.girls / stats.totalStudents) * 100)}% Girls` : 'No students yet'}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Students */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-serif font-bold text-[#001F3F] text-base">Recent Students Added</h2>
                <a href="/admin/students" className="text-xs text-[#D4AF37] font-bold hover:underline">View All →</a>
              </div>
              {loading ? (
                <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
              ) : recentStudents.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">No students yet</div>
              ) : (
                <div className="space-y-3">
                  {recentStudents.slice(0, 6).map(s => (
                    <div key={s.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${s.gender === 'Male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                        {s.name.charAt(0).toUpperCase()}
                      </div>
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

            {/* Live Notifications */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center space-x-2 mb-5">
                <Activity size={16} className="text-green-500 animate-pulse" />
                <h2 className="font-serif font-bold text-[#001F3F] text-base">Live Activity Feed</h2>
              </div>
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <Clock size={32} className="mx-auto mb-2 text-gray-300" />
                  Waiting for staff activity...
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map(n => (
                    <div key={n.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
                      <div className="mt-0.5">{notifIcon(n.type)}</div>
                      <div className="flex-1">
                        <p className="text-sm text-[#001F3F] font-medium">{n.message}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{formatTime(n.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Attendance Status */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-serif font-bold text-[#001F3F] text-base mb-4">Today&apos;s Attendance Summary</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="text-2xl font-black text-green-600">{stats.presentToday}</div>
                <div className="text-xs font-bold text-green-500 uppercase tracking-wider mt-1">Present</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl border border-red-100">
                <div className="text-2xl font-black text-red-500">{stats.absentToday}</div>
                <div className="text-xs font-bold text-red-400 uppercase tracking-wider mt-1">Absent</div>
              </div>
              <div className="text-center p-4 bg-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/20">
                <div className="text-2xl font-black text-[#D4AF37]">{stats.todayAttendance}%</div>
                <div className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mt-1">Rate</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
