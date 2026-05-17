'use client'

import React from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export default function ContactPage() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Header */}
      <div className="bg-navy pt-40 pb-20 text-center relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">{t('contact.banner_title')}</h1>
          <p className="text-gold uppercase tracking-[0.3em] text-sm font-bold">{t('contact.banner_sub')}</p>
        </div>
      </div>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="bg-academic-white p-10 rounded-3xl border border-gray-200">
               <h2 className="text-3xl font-serif font-bold text-navy mb-8">{t('contact.form_title')}</h2>
               <form className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-navy mb-2">{t('contact.student_name')}</label>
                      <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent outline-none" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-navy mb-2">{t('contact.parent_name')}</label>
                      <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent outline-none" placeholder="Richard Doe" />
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-navy mb-2">{t('contact.phone')}</label>
                      <input type="tel" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent outline-none" placeholder="+91 85260 07178" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-navy mb-2">{t('contact.grade')}</label>
                      <select className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent outline-none bg-white">
                        <option>6th Standard</option>
                        <option>7th Standard</option>
                        <option>8th Standard</option>
                        <option>9th Standard</option>
                        <option>10th Standard</option>
                        <option>11th Standard</option>
                        <option>12th Standard</option>
                        <option>Spoken English</option>
                      </select>
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-navy mb-2">{t('contact.message')}</label>
                    <textarea rows={4} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent outline-none" placeholder="How can we help you?"></textarea>
                 </div>

                 <button className="bg-navy text-white px-8 py-4 rounded-lg font-bold flex items-center space-x-2 hover:bg-gold hover:text-navy transition-all shadow-lg shadow-navy/20">
                   <span>{t('contact.submit')}</span>
                   <Send size={18} />
                 </button>
               </form>
            </div>

            {/* Info */}
            <div className="space-y-12">
               <div>
                  <h2 className="text-3xl font-serif font-bold text-navy mb-8">{t('contact.info_title')}</h2>
                  <div className="space-y-8">
                    <ContactInfoItem 
                      icon={<MapPin className="text-gold" />}
                      title={t('contact.campus')}
                      content="Smtc Annai Complex, New Dharapuram Road, Bank of India Upstairs, Near Girls Hr Sec School, Palani 624601"
                    />
                    <ContactInfoItem 
                      icon={<Phone className="text-gold" />}
                      title={t('contact.call')}
                    content={
                      <div className="flex flex-col space-y-3 mt-1">
                        <a 
                          href="tel:+918526007178" 
                          className="flex items-center space-x-2 text-navy hover:text-gold transition-all duration-300 font-extrabold text-lg hover:translate-x-1 active:scale-95"
                        >
                          <Phone size={16} className="text-gold shrink-0 animate-pulse" />
                          <span>+91 85260 07178</span>
                        </a>
                        <a 
                          href="tel:+916382752224" 
                          className="flex items-center space-x-2 text-navy hover:text-gold transition-all duration-300 font-extrabold text-lg hover:translate-x-1 active:scale-95"
                        >
                          <Phone size={16} className="text-gold shrink-0 animate-pulse" />
                          <span>+91 63827 52224</span>
                        </a>
                      </div>
                    }
                    />
                    <ContactInfoItem 
                      icon={<Mail className="text-gold" />}
                      title={t('contact.email')}
                      content={
                        <a href="mailto:smtcpalani2017@gmail.com" className="hover:text-gold text-navy transition-colors font-medium">smtcpalani2017@gmail.com</a>
                      }
                    />
                    <ContactInfoItem 
                      icon={<Clock className="text-gold" />}
                      title={t('contact.hours')}
                      content="Mon - Sat: 9:00 AM - 8:30 PM, Sun: 10:00 AM - 2:00 PM"
                    />
                  </div>
               </div>

               {/* Map Placeholder */}
               <div className="bg-navy/5 aspect-video rounded-3xl border-2 border-dashed border-navy/10 flex items-center justify-center text-navy/40 font-serif italic text-lg text-center px-4">
                  Sri Murugan Tuition Center (SMTC) - Palani
               </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

function ContactInfoItem({ icon, title, content }: { icon: React.ReactNode; title: string; content: React.ReactNode }) {
  return (
    <div className="flex items-start space-x-4">
      <div className="bg-navy p-3 rounded-xl shrink-0">{icon}</div>
      <div>
        <h4 className="font-bold text-navy uppercase text-xs tracking-widest mb-1">{title}</h4>
        <div className="text-gray-600 font-medium">{content}</div>
      </div>
    </div>
  )
}
