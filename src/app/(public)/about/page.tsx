'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PageBanner from '@/components/layout/PageBanner'
import { Target, Heart, ShieldCheck } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export default function AboutPage() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen">
      <Navbar />
      
      <PageBanner 
        title={t('nav.about')}
        subtitle={t('hero.badge')}
        breadcrumb={[{ name: t('nav.about') }]}
      />

      {/* History Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
               <h2 className="section-title">{t('about.story_title')}</h2>
               <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
                 <p>{t('about.story_p1')}</p>
                 <p>{t('about.story_p2')}</p>
                 <p>{t('about.story_p3')}</p>
               </div>
            </div>
            <div className="lg:w-1/2 grid grid-cols-2 gap-4">
               <div className="aspect-square bg-navy rounded-2xl flex items-center justify-center p-8 text-center border-4 border-gold/20">
                  <div>
                    <div className="text-gold text-4xl font-serif font-bold mb-2">9+</div>
                    <div className="text-white text-xs uppercase tracking-widest">{t('about.trust')}</div>
                  </div>
               </div>
               <div className="aspect-square bg-academic-white rounded-2xl flex items-center justify-center p-8 text-center border border-gray-200">
                  <div>
                    <div className="text-navy text-4xl font-serif font-bold mb-2">1000+</div>
                    <div className="text-gray-500 text-xs uppercase tracking-widest">{t('about.alumni')}</div>
                  </div>
               </div>
               <div className="aspect-square bg-academic-white rounded-2xl flex items-center justify-center p-8 text-center border border-gray-200">
                  <div>
                    <div className="text-navy text-4xl font-serif font-bold mb-2">10+</div>
                    <div className="text-gray-500 text-xs uppercase tracking-widest">{t('about.expert_faculty')}</div>
                  </div>
               </div>
               <div className="aspect-square bg-gold rounded-2xl flex items-center justify-center p-8 text-center shadow-lg shadow-gold/20">
                  <div>
                    <div className="text-navy text-4xl font-serif font-bold mb-2">100%</div>
                    <div className="text-navy text-xs uppercase tracking-widest font-bold">{t('about.pass_rate')}</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-24 bg-academic-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
             <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="bg-navy p-4 rounded-2xl inline-block mb-6 group-hover:bg-gold transition-colors">
                   <Target className="text-white group-hover:text-navy" size={32} />
                </div>
                <h3 className="text-2xl font-serif font-bold text-navy mb-4">{t('about.vision')}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('about.vision_desc')}
                </p>
             </div>
             
             <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="bg-navy p-4 rounded-2xl inline-block mb-6 group-hover:bg-gold transition-colors">
                   <Heart className="text-white group-hover:text-navy" size={32} />
                </div>
                <h3 className="text-2xl font-serif font-bold text-navy mb-4">{t('about.mission')}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('about.mission_desc')}
                </p>
             </div>

             <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="bg-navy p-4 rounded-2xl inline-block mb-6 group-hover:bg-gold transition-colors">
                   <ShieldCheck className="text-white group-hover:text-navy" size={32} />
                </div>
                <h3 className="text-2xl font-serif font-bold text-navy mb-4">{t('about.values')}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('about.values_desc')}
                </p>
             </div>
           </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
