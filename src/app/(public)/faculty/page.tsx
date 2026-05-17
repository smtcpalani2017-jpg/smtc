'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { GraduationCap as CapIcon, Award as AwardIcon, BookOpen as BookIcon, User, Mail } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import React, { useEffect, useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'

export default function FacultyPage() {
  const [faculty, setFaculty] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { t } = useLanguage()

  useEffect(() => {
    const fetchFaculty = async () => {
      const { data } = await supabase.from('users').select('*').eq('role', 'staff').order('created_at', { ascending: false })
      setFaculty(data || [])
      setLoading(false)
    }
    fetchFaculty()
  }, [])

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Header */}
      <div className="bg-navy pt-40 pb-20 text-center relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">{t('faculty.banner_title')}</h1>
          <p className="text-gold uppercase tracking-[0.3em] text-sm font-bold">{t('faculty.banner_sub')}</p>
        </div>
      </div>

      <section className="py-24 bg-academic-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title inline-block">{t('faculty.title')}</h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              {t('faculty.desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {loading ? (
               <div className="col-span-full text-center py-24 text-gray-300 italic font-serif">{t('common.loading')}</div>
            ) : faculty.length === 0 ? (
               <div className="col-span-full text-center py-24 text-gray-300 italic font-serif">{t('common.soon')}</div>
            ) : faculty.map((member) => (
              <div key={member.id} className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm group hover:shadow-xl transition-all">
                <div className="bg-navy h-40 relative">
                    {member.image_url ? (
                      <img src={member.image_url} alt={member.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <div className="w-full h-full bg-navy" />
                    )}
                   <div className="absolute -bottom-12 left-8">
                      <div className="h-24 w-24 bg-gold rounded-2xl border-4 border-white flex items-center justify-center text-navy shadow-lg group-hover:scale-110 transition-transform overflow-hidden bg-center bg-cover" style={member.image_url ? { backgroundImage: `url(${member.image_url})` } : {}}>
                         {!member.image_url && <User size={48} />}
                      </div>
                   </div>
                </div>
                <div className="pt-16 p-8">
                  <h3 className="text-2xl font-serif font-bold text-navy mb-1">{member.name}</h3>
                  <p className="text-gold font-bold text-sm mb-6">{member.subject || 'Faculty Member'}</p>
                  
                  <div className="space-y-4 mb-8">
                     <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <CapIcon size={18} className="text-navy opacity-40" />
                        <span>Teacher at SMTC</span>
                     </div>
                     <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <BookIcon size={18} className="text-navy opacity-40" />
                        <span>{member.experience || 'Experienced'} of teaching</span>
                     </div>
                     <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <AwardIcon size={18} className="text-navy opacity-40" />
                        <span className="font-bold text-navy">Dedicated Mentor</span>
                     </div>
                  </div>

                  <div className="bg-academic-white p-4 rounded-xl border border-gray-100">
                     <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Subject Expert</p>
                     <p className="text-navy font-semibold text-sm">{member.subject || 'Academic Excellence'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <div className="bg-navy p-12 rounded-[3rem] border-8 border-gold/10">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">Join Our Faculty Team</h2>
              <p className="text-gray-400 mb-8 max-w-2xl mx-auto italic">
                "We are always looking for passionate educators who want to make a difference in students' lives. 
                If you have the expertise and the drive, SMTC is the place for you."
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                 <a href="mailto:careers@smtc.edu" className="bg-gold text-navy px-8 py-4 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-white transition-all">
                    <Mail size={20} />
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
