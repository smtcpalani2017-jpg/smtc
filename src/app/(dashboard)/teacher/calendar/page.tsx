'use client'

import React, { useState, useEffect } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  ArrowRight, Star, StickyNote, Save, Trash2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

// Predefined Govt Holidays for 2026
const HOLIDAYS = [
  { date: '2026-05-01', title: 'May Day', desc: 'International Labours Day' },
  { date: '2026-08-15', title: 'Independence Day', desc: 'National Holiday' },
  { date: '2026-01-26', title: 'Republic Day', desc: 'National Holiday' },
  { date: '2026-10-02', title: 'Gandhi Jayanti', desc: 'National Holiday' },
]

export default function TeacherCalendar() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  
  // Notes State
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [activeNote, setActiveNote] = useState('')

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem('smtc_calendar_notes')
    if (savedNotes) setNotes(JSON.parse(savedNotes))
  }, [])

  // Calendar Logic
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthName = currentDate.toLocaleString('default', { month: 'long' })
  
  const totalDays = new Date(year, month + 1, 0).getDate()
  const startDay = new Date(year, month, 1).getDay()
  const days = Array.from({ length: totalDays }, (_, i) => i + 1)
  const padding = Array.from({ length: startDay }, (_, i) => null)

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const getDateStr = (day: number) => `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`

  const isToday = (day: number) => {
    const today = new Date()
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
  }

  const selectedDateStr = selectedDate ? `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}` : ''
  const selectedHoliday = HOLIDAYS.find(h => h.date === selectedDateStr)

  useEffect(() => {
    if (selectedDateStr) setActiveNote(notes[selectedDateStr] || '')
  }, [selectedDateStr, notes])

  const saveNote = () => {
    if (!selectedDateStr) return
    const newNotes = { ...notes, [selectedDateStr]: activeNote }
    if (!activeNote) delete newNotes[selectedDateStr]
    setNotes(newNotes)
    localStorage.setItem('smtc_calendar_notes', JSON.stringify(newNotes))
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar role="teacher" />
      <main className="flex-1 ml-0 md:ml-64 min-h-screen p-4 sm:p-10 flex flex-col xl:flex-row gap-6 sm:gap-10 transition-all duration-300">
        
        {/* Main Calendar View */}
        <div className="flex-1 space-y-8">
           <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-12 sm:pl-0">
              <div>
                 <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Academic Calendar</h1>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Holidays & Personal Notes</p>
              </div>
              <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm w-fit">
                 <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400"><ChevronLeft size={18} /></button>
                 <span className="text-sm font-black text-slate-900 min-w-[120px] text-center uppercase tracking-widest">{monthName} {year}</span>
                 <button onClick={handleNextMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400"><ChevronRight size={18} /></button>
              </div>
           </header>

           <div className="bg-white rounded-[32px] sm:rounded-[48px] p-4 sm:p-10 border border-slate-100 shadow-xl overflow-x-auto">
              <div className="grid grid-cols-7 min-w-[600px]">
                 {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest mb-8">{d}</div>
                 ))}
                 
                 {padding.map((_, i) => <div key={`p-${i}`} className="h-20 sm:h-28" />)}
                 {days.map(day => {
                    const dateStr = getDateStr(day)
                    const holiday = HOLIDAYS.find(h => h.date === dateStr)
                    const hasNote = !!notes[dateStr]
                    const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === month
                    
                    return (
                       <button 
                          key={day} 
                          onClick={() => setSelectedDate(new Date(year, month, day))}
                          className={`h-20 sm:h-28 relative border-t border-slate-50 transition-all p-3 sm:p-4 text-left group hover:bg-slate-50/50 ${isSelected ? 'bg-slate-50' : ''}`}
                       >
                          <span className={`text-xs sm:text-sm font-black ${isToday(day) ? 'bg-slate-900 text-white w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center' : isSelected ? 'text-slate-900 underline decoration-slate-900 underline-offset-4' : 'text-slate-400'}`}>
                             {day}
                          </span>
                          
                          <div className="mt-1 sm:mt-2 flex flex-col gap-1">
                             {holiday && (
                                <div className="text-[6px] sm:text-[7px] font-black uppercase px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-600 truncate">
                                   {holiday.title}
                                </div>
                             )}
                             {hasNote && (
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm" />
                             )}
                          </div>
                       </button>
                    )
                 })}
              </div>
           </div>
        </div>

        {/* Detail & Note Sidebar */}
        <div className="w-full xl:w-[400px] space-y-8">
           <AnimatePresence mode="wait">
              {selectedDate && (
                 <motion.div 
                    key={selectedDateStr}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                    className="bg-slate-900 rounded-[48px] p-10 text-white shadow-2xl h-full relative overflow-hidden flex flex-col"
                 >
                    <div className="absolute top-0 right-0 p-10 opacity-5"><CalendarIcon size={200} /></div>
                    
                    <div className="relative z-10 flex-1">
                       <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2">Selected Date</div>
                       <h2 className="text-4xl font-black mb-1">{selectedDate.getDate()} {monthName}</h2>
                       <div className="text-xs font-bold text-slate-400 mb-10 uppercase tracking-widest">{selectedDate.toLocaleString('default', { weekday: 'long' })}</div>

                       {/* Holiday Section */}
                       {selectedHoliday && (
                          <div className="bg-rose-500/20 border border-rose-500/20 p-6 rounded-[32px] mb-8">
                             <div className="flex items-center gap-2 mb-2 text-rose-400">
                                <Star size={14} className="fill-current" />
                                <span className="text-xs font-black uppercase tracking-widest">Public Holiday</span>
                             </div>
                             <h4 className="text-sm font-black mb-1">{selectedHoliday.title}</h4>
                             <p className="text-[10px] text-rose-300/60 font-medium">{selectedHoliday.desc}</p>
                          </div>
                       )}

                       {/* Personal Notes Section */}
                       <div className="space-y-4">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                             <span className="flex items-center gap-2"><StickyNote size={12} /> My Notes</span>
                             {activeNote && <span className="text-emerald-400 flex items-center gap-1"><Save size={10} /> Saved</span>}
                          </div>
                          <textarea 
                             value={activeNote}
                             onChange={(e) => setActiveNote(e.target.value)}
                             onBlur={saveNote}
                             placeholder="Type your notes here... (Auto-saves on blur)"
                             className="w-full h-[180px] bg-white/5 border border-white/5 rounded-[32px] p-6 text-sm text-slate-300 placeholder:text-slate-600 focus:ring-2 focus:ring-white/10 outline-none transition-all resize-none"
                          />
                       </div>
                    </div>

                    <div className="relative z-10 pt-10 border-t border-white/10 space-y-4">
                       <button 
                          onClick={() => router.push(`/teacher/attendance?date=${selectedDateStr}`)}
                          className="w-full bg-white text-slate-900 py-6 rounded-[24px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-slate-100 transition-all shadow-xl"
                       >
                          View Attendance <ArrowRight size={16} />
                       </button>
                    </div>
                 </motion.div>
              )}
           </AnimatePresence>
        </div>

      </main>
    </div>
  )
}
