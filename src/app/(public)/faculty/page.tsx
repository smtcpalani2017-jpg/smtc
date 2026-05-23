'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { BookOpen as BookIcon, User, Mail, Award, Clock } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import React, { useEffect, useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { motion } from 'framer-motion'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }

export default function FacultyPage() {
  const [faculty, setFaculty] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { t } = useLanguage()

  useEffect(() => {
    const fetchFaculty = async () => {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'staff')
        .not('image_url', 'is', null)
        .order('is_featured', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
      
      // Filter out faculty members who do not have a valid image_url
      const validFaculty = (data || []).filter(
        (f: any) => f.image_url && f.image_url.trim() !== ''
      )
      
      setFaculty(validFaculty)
      setLoading(false)
    }
    fetchFaculty()
  }, [])

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* ── Hero Banner ── */}
      <div className="bg-[#001F3F] pt-32 pb-20 text-center relative overflow-hidden">
        {/* background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <span className="inline-block text-gold font-black text-xs uppercase tracking-[0.3em] mb-4 border border-gold/20 px-4 py-1.5 rounded-full">
            Meet Our Educators
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold text-white mb-4 leading-tight">
            {t('faculty.banner_title')}
          </h1>
          <p className="text-gold/70 uppercase tracking-[0.3em] text-xs sm:text-sm font-bold">
            {t('faculty.banner_sub')}
          </p>
        </div>
      </div>

      {/* ── Faculty Grid ── */}
      <section className="py-20 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#001F3F] mb-4">{t('faculty.title')}</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              {t('faculty.desc')}
            </p>
          </div>

          {loading ? (
            /* Skeleton loaders */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden animate-pulse">
                  <div className="h-56 bg-gray-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-gray-100 rounded w-2/3" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="h-10 bg-gray-100 rounded-xl" />
                      <div className="h-10 bg-gray-100 rounded-xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : faculty.length === 0 ? (
            <div className="text-center py-24 text-gray-400 italic font-serif text-lg">{t('common.soon')}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {faculty.map((member, i) => (
                <motion.div
                  key={member.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl hover:shadow-navy/10 hover:-translate-y-2 transition-all duration-500 group flex flex-col"
                >
                  {/* Image section */}
                  <div className="relative h-56 sm:h-64 bg-gradient-to-br from-[#001F3F] to-[#001229] overflow-hidden shrink-0">
                    {member.image_url ? (
                      <img
                        src={member.image_url}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User size={64} className="text-white/10" />
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#001F3F] via-transparent to-transparent opacity-70" />
                    {/* Subject badge pinned to bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <span className="inline-block bg-gold/90 text-navy text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                        {member.subject || 'Faculty'}
                      </span>
                      {member.is_featured && (
                        <span className="ml-2 inline-block bg-white/20 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/10">
                          ★ Featured
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info section */}
                  <div className="p-5 sm:p-6 flex flex-col flex-1">
                    <h3 className="text-lg sm:text-xl font-serif font-bold text-[#001F3F] mb-1 leading-tight">{member.name}</h3>
                    <p className="text-[#D4AF37] font-bold text-xs mb-5">{member.subject || 'Faculty Member'}</p>

                    <div className="space-y-2.5 mb-5">
                      <div className="flex items-center gap-2.5 text-xs text-gray-500">
                        <BookIcon size={14} className="text-[#001F3F]/40 shrink-0" />
                        <span>Teacher at SMTC Palani</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-gray-500">
                        <Clock size={14} className="text-[#001F3F]/40 shrink-0" />
                        <span>{member.experience ? `${member.experience} of teaching` : 'Experienced Educator'}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-gray-500">
                        <Award size={14} className="text-[#001F3F]/40 shrink-0" />
                        <span className="font-bold text-[#001F3F]">Dedicated Mentor</span>
                      </div>
                    </div>

                    <div className="mt-auto bg-[#F8F9FA] p-3.5 rounded-2xl border border-gray-100">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Subject Expert</p>
                      <p className="text-[#001F3F] font-bold text-sm">{member.subject || 'Academic Excellence'}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Join Section ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-[#001F3F] p-8 sm:p-14 rounded-[2.5rem] border-4 border-[#D4AF37]/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/smtc-logo.png')] bg-center bg-no-repeat bg-contain opacity-[0.03] pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-4 sm:mb-6">Join Our Faculty Team</h2>
              <p className="text-gray-400 mb-8 max-w-2xl mx-auto italic text-sm sm:text-base leading-relaxed">
                We are always looking for passionate educators who want to make a difference in students&apos; lives.
                If you have the expertise and the drive, SMTC is the place for you.
              </p>
              <a
                href="mailto:smtcpalani2017@gmail.com"
                className="inline-flex items-center gap-3 bg-[#D4AF37] text-[#001F3F] px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all active:scale-95 shadow-xl shadow-[#D4AF37]/20 text-sm"
              >
                <Mail size={18} />
                <span>Send Resume</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
