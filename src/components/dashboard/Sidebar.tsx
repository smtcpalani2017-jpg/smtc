'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, UserSquare2, CalendarCheck,
  GraduationCap, Megaphone, Settings, LogOut, BookOpen,
  BarChart3, ClipboardList, Calendar, School, ChevronLeft, ChevronRight, Bell, Banknote, Globe, Menu, X, Archive
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface SidebarProps {
  role: 'admin' | 'teacher'
  userName?: string
  userEmail?: string
}

const Sidebar = ({ role: initialRole, userName: initialName = 'User', userEmail: initialEmail = '' }: SidebarProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [userData, setUserData] = useState({ name: initialName, email: initialEmail, role: initialRole })

  React.useEffect(() => {
    const savedUser = localStorage.getItem('smtc_user')
    if (savedUser) {
      const parsed = JSON.parse(savedUser)
      setUserData({
        name: parsed.name,
        email: parsed.email,
        role: parsed.role
      })
    }
  }, [initialName, initialEmail, initialRole])

  const adminLinks = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Students', href: '/admin/students', icon: Users },
    { name: 'Staff', href: '/admin/staff', icon: UserSquare2 },
    { name: 'Classes', href: '/admin/classes', icon: School },
    { name: 'Attendance', href: '/admin/attendance', icon: CalendarCheck },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Fees', href: '/admin/fees', icon: Banknote },
    { name: 'Archives', href: '/admin/archives', icon: Archive },
    { name: 'Website', href: '/admin/website', icon: Globe },
  ]

  const teacherLinks = [
    { name: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
    { name: 'Add Student', href: '/teacher/students', icon: Users },
    { name: 'My Classes', href: '/teacher/classes', icon: School },
    { name: 'Attendance', href: '/teacher/attendance', icon: CalendarCheck },
    { name: 'Test Marks', href: '/teacher/marks', icon: ClipboardList },
    { name: 'Fees', href: '/teacher/fees', icon: Banknote },
    { name: 'Calendar', href: '/teacher/calendar', icon: Calendar },
  ]

  const links = userData.role === 'admin' ? adminLinks : teacherLinks
  const initials = userData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const handleLogout = async () => {
    localStorage.removeItem('smtc_user')
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-3 left-4 z-50 p-2 bg-[#001229] text-white hover:text-[#D4AF37] border border-white/10 rounded-xl md:hidden shadow-lg flex items-center justify-center h-10 w-10 transition-all duration-300"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 z-39 md:hidden backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      <div className={`h-screen bg-[#001229] text-white flex flex-col fixed left-0 top-0 z-40 transition-all duration-300 border-r border-white/5 
        ${collapsed ? 'w-20' : 'w-64'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
      {/* Header */}
      <div className={`p-4 border-b border-white/10 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="bg-[#D4AF37] p-2 rounded-lg shrink-0">
              <BookOpen className="h-5 w-5 text-[#001229]" />
            </div>
            <div>
              <div className="font-serif font-bold text-base leading-none">SMTC</div>
              <div className="text-[10px] uppercase tracking-widest text-[#D4AF37]/70 mt-0.5">
                {userData.role === 'admin' ? 'Admin Portal' : 'Staff Portal'}
              </div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="bg-[#D4AF37] p-2 rounded-lg">
            <BookOpen className="h-5 w-5 text-[#001229]" />
          </div>
        )}
        
        {/* Mobile Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white ml-auto md:hidden flex items-center justify-center"
        >
          <X size={18} />
        </button>

        {/* Desktop Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white ml-2 hidden md:block"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.name}
              href={link.href}
              title={collapsed ? link.name : undefined}
              className={`flex items-center ${collapsed ? 'justify-center px-2' : 'space-x-3 px-3'} py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-[#D4AF37] text-[#001229] font-bold shadow-lg shadow-[#D4AF37]/20'
                  : 'text-white/50 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={19} className={isActive ? 'text-[#001229]' : 'text-white/50 group-hover:text-[#D4AF37]'} />
              {!collapsed && <span className="text-sm">{link.name}</span>}
            </Link>
          )
        })}
      </div>

      {/* User + Actions */}
      <div className="p-3 border-t border-white/10 space-y-2">
        {!collapsed && (
          <div className="flex items-center space-x-3 px-3 py-2">
            <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${userData.role === 'admin' ? 'bg-[#D4AF37] text-[#001229]' : 'bg-blue-500 text-white'}`}>
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{userData.name}</div>
              <div className="text-[10px] text-white/30 truncate">{userData.email}</div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Sign Out' : undefined}
          className={`flex items-center ${collapsed ? 'justify-center px-2' : 'space-x-3 px-3'} py-2.5 w-full bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all text-sm font-bold`}
        >
          <LogOut size={17} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
    </>
  )
}

export default Sidebar
