'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Trophy, Star, TrendingUp, Users } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { createClient } from '@/utils/supabase/client'
import React, { useEffect, useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'

const growthData = [
  { year: '2020', pass: 92, honors: 45 },
  { year: '2021', pass: 95, honors: 58 },
  { year: '2022', pass: 96, honors: 72 },
  { year: '2023', pass: 98, honors: 85 },
  { year: '2024', pass: 99, honors: 98 },
]

export default function ResultsPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { t } = useLanguage()

  useEffect(() => {
    const fetchResults = async () => {
      const { data } = await supabase.from('website_results').select('*').order('created_at', { ascending: false })
      setResults(data || [])
      setLoading(false)
    }
    fetchResults()
  }, [])

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Header */}
      <div className="bg-navy pt-40 pb-20 text-center relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">{t('results.banner_title')}</h1>
          <p className="text-gold uppercase tracking-[0.3em] text-sm font-bold">{t('results.banner_sub')}</p>
        </div>
      </div>

      {/* Hall of Fame */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title inline-block">{t('results.achievements')}</h2>
            <p className="text-gray-500 mt-4 italic font-serif">&quot;{t('about.quote')}&quot;</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
               <div className="col-span-full text-center py-24 text-gray-300 italic font-serif">{t('common.loading')}</div>
            ) : results.length === 0 ? (
               <div className="col-span-full text-center py-24 text-gray-300 italic font-serif">{t('common.soon')}</div>
            ) : results.map((r, index) => (
              <div key={r.id} className="academic-card group hover:border-gold transition-all duration-300">
                <div className="bg-navy h-64 flex items-center justify-center relative overflow-hidden">
                   {r.image_url ? (
                     <img src={r.image_url} alt={r.student_name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                   ) : (
                     <Users className="text-white/10 w-32 h-32 absolute -bottom-8 -right-8" />
                   )}
                   {!r.image_url && (
                     <div className="h-24 w-24 bg-gold rounded-full border-4 border-white/20 flex items-center justify-center text-navy font-bold text-3xl">
                        {r.student_name.charAt(0)}
                     </div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-6 text-center">
                  <div className="text-gold text-[10px] font-black uppercase tracking-[0.2em] mb-2">{r.exam_name}</div>
                  <h3 className="text-xl font-serif font-bold text-navy mb-2 line-clamp-1">{r.student_name}</h3>
                  <div className="bg-navy/5 inline-block px-4 py-1.5 rounded-full mb-4">
                     <span className="text-navy font-bold text-sm">{r.score}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-gold">
                     <Trophy size={16} />
                     <span className="text-xs font-black uppercase tracking-widest">{r.achievement}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-24 bg-academic-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
               <h2 className="section-title">{t('results.title')}</h2>
               <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                 {t('results.desc')}
               </p>
               <div className="grid grid-cols-2 gap-8">
                 <div className="bg-white p-6 rounded-2xl border border-gray-200">
                    <div className="text-3xl font-bold text-navy">100%</div>
                    <div className="text-xs uppercase tracking-widest text-gray-500 font-bold mt-1">{t('stats.pass')}</div>
                 </div>
                 <div className="bg-white p-6 rounded-2xl border border-gray-200">
                    <div className="text-3xl font-bold text-navy">500+</div>
                    <div className="text-xs uppercase tracking-widest text-gray-500 font-bold mt-1">{t('stats.toppers')}</div>
                 </div>
                 <div className="bg-white p-6 rounded-2xl border border-gray-200">
                    <div className="text-3xl font-bold text-navy">24+</div>
                    <div className="text-xs uppercase tracking-widest text-gray-500 font-bold mt-1">State Ranks</div>
                 </div>
                 <div className="bg-white p-6 rounded-2xl border border-gray-200">
                    <div className="text-3xl font-bold text-navy">1000+</div>
                    <div className="text-xs uppercase tracking-widest text-gray-500 font-bold mt-1">{t('stats.students')}</div>
                 </div>
               </div>
            </div>
            
            <div className="lg:w-1/2 w-full">
               <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                 <h4 className="font-serif font-bold text-navy text-xl mb-8 flex items-center space-x-2">
                    <TrendingUp className="text-gold" />
                    <span>Academic Progress (2020-2024)</span>
                 </h4>
                 <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={growthData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="honors" fill="#001F3F" radius={[6, 6, 0, 0]} name="State Ranks/Honors" />
                      </BarChart>
                    </ResponsiveContainer>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-20 bg-navy text-center">
         <div className="max-w-3xl mx-auto px-4">
           <Star className="text-gold h-12 w-12 mx-auto mb-8 animate-pulse" />
           <p className="text-2xl font-serif text-white italic leading-relaxed">
             &quot;{t('about.quote')}&quot;
           </p>
         </div>
      </section>

      <Footer />
    </main>
  )
}
