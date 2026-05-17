'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PageBanner from '@/components/layout/PageBanner'
import { BookOpen, GraduationCap, Calculator, ArrowRight, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

export default function CoursesPage() {
  const { t } = useLanguage()

  const courses = [
    {
      title: t('course1.title'),
      category: 'Junior Secondary',
      description: t('course1.desc'),
      icon: <BookOpen className="text-gold" size={32} />,
      duration: t('course.duration'),
      target: t('course1.target')
    },
    {
      title: t('course2.title'),
      category: 'Science Stream',
      description: t('course2.desc'),
      icon: <Calculator className="text-gold" size={32} />,
      duration: t('course.duration'),
      target: t('course2.target')
    },
    {
      title: t('course3.title'),
      category: 'Arts & Commerce',
      description: t('course3.desc'),
      icon: <TrendingUp className="text-gold" size={32} />,
      duration: t('course.duration'),
      target: t('course3.target')
    },
    {
      title: t('course4.title'),
      category: 'Language Skills',
      description: t('course4.desc'),
      icon: <GraduationCap className="text-gold" size={32} />,
      duration: t('course.duration_short'),
      target: t('course4.target')
    }
  ]

  return (
    <main className="min-h-screen">
      <Navbar />
      
      <PageBanner 
        title={t('courses.banner_title')}
        subtitle={t('courses.banner_sub')}
        breadcrumb={[{ name: t('nav.courses') }]}
      />

      <section className="py-24 bg-academic-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <div key={index} className="academic-card group hover:-translate-y-2 transition-all duration-300">
                <div className="p-8">
                  <div className="bg-navy p-4 rounded-2xl inline-block mb-6 group-hover:bg-gold transition-colors">
                    {course.icon}
                  </div>
                  <div className="text-xs font-bold text-gold uppercase tracking-widest mb-2">{course.category}</div>
                  <h3 className="text-2xl font-serif font-bold text-navy mb-4">{course.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    {course.description}
                  </p>
                  
                  <div className="border-t border-gray-100 pt-6 space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400 font-bold uppercase">{t('course.duration')}:</span>
                      <span className="text-navy font-bold">{course.duration}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400 font-bold uppercase">Target:</span>
                      <span className="text-navy font-bold">{course.target}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-between items-center group-hover:bg-navy transition-colors">
                  <span className="text-navy font-bold text-sm group-hover:text-white transition-colors">{t('common.enquiry')}</span>
                  <Link href="/contact">
                    <ArrowRight className="text-gold group-hover:text-white transition-colors" size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-20 bg-navy rounded-3xl p-12 text-center relative overflow-hidden border-4 border-gold/20 shadow-2xl">
             <div className="relative z-10">
               <h2 className="text-3xl font-serif font-bold text-white mb-6">{t('courses.enquiry_title')}</h2>
               <p className="text-gray-300 mb-8 max-w-2xl mx-auto italic text-lg">
                &quot;{t('courses.enquiry_desc')}&quot;
               </p>
               <Link 
                 href="/contact"
                 className="bg-gold text-navy px-10 py-4 rounded-lg font-bold inline-flex items-center space-x-2 hover:bg-white transition-all transform hover:scale-105"
               >
                 <span>{t('common.enquiry')}</span>
                 <ArrowRight size={20} />
               </Link>
             </div>
             {/* Decorative */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-[80px]" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/10 rounded-full blur-[80px]" />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
