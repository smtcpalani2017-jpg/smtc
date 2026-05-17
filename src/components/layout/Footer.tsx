'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Globe, Share2, Mail, Phone, MapPin, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden">
      {/* Top CTA Banner */}
      <div className="gradient-hero relative py-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-20 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-10 left-20 w-[300px] h-[300px] bg-gold/4 rounded-full blur-[80px]" />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">
              Begin Your Journey to{' '}
              <span className="text-gold">Academic Excellence</span>
            </h2>
            <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto">
              Join thousands of successful students who started their winning streak at SMTC. 
              Admissions for 2025-26 are now open.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-primary flex items-center justify-center space-x-2 text-base">
                <span>Apply for Admission</span>
                <ArrowRight size={18} />
              </Link>
              <Link href="/courses" className="btn-outline flex items-center justify-center text-base">
                Explore Courses
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="bg-navy-dark pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Logo & Info */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative w-12 h-12">
                  <Image src="/smtc-logo.png" alt="SMTC Logo" fill className="object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif font-bold text-xl leading-none text-white">SMTC</span>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-gold/70 mt-0.5">Sri Murugan Tuition Center</span>
                </div>
              </div>
              <p className="text-white/40 text-sm leading-relaxed mb-6">
                Empowering students through quality education and dedicated mentorship 
                since 2017. Building tomorrow&apos;s leaders, today.
              </p>
              <div className="flex space-x-3">
                {[
                  { icon: <Globe size={18} />, label: 'Website' },
                ].map((social) => (
                  <a 
                    key={social.label}
                    href="#" 
                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:bg-gold hover:text-navy transition-all duration-300 hover:-translate-y-1"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-serif font-bold text-base mb-6 text-white relative inline-block">
                Quick Links
                <div className="absolute -bottom-1 left-0 w-8 h-[2px] bg-gold" />
              </h4>
              <ul className="space-y-3">
                {[
                  { name: 'About Us', href: '/about' },
                  { name: 'Our Courses', href: '/courses' },
                  { name: 'Academic Results', href: '/results' },
                  { name: 'Faculty Profiles', href: '/faculty' },
                  { name: 'Gallery', href: '/gallery' },
                  { name: 'Contact Us', href: '/contact' },
                ].map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="text-white/40 hover:text-gold text-sm transition-all duration-300 flex items-center space-x-2 group"
                    >
                      <div className="w-1 h-1 bg-gold/30 rounded-full group-hover:bg-gold group-hover:scale-150 transition-all duration-300" />
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-serif font-bold text-base mb-6 text-white relative inline-block">
                Contact Info
                <div className="absolute -bottom-1 left-0 w-8 h-[2px] bg-gold" />
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3 group">
                  <div className="mt-1 w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0 group-hover:bg-gold/20 transition-colors">
                    <MapPin className="text-gold h-4 w-4" />
                  </div>
                  <span className="text-white/40 text-sm leading-relaxed">
                    Smtc Annai Complex,<br />New Dharapuram Road,<br />Bank of India Upstairs,<br />Near Girls Hr Sec School,<br />Palani 624601
                  </span>
                </li>
                <li className="flex items-start space-x-3 group">
                  <div className="mt-1 w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0 group-hover:bg-gold/20 transition-colors">
                    <Phone className="text-gold h-4 w-4" />
                  </div>
                  <div className="flex flex-col text-white/50 text-sm space-y-2">
                    <a 
                      href="tel:+918526007178" 
                      className="flex items-center space-x-2 text-white/80 hover:text-gold transition-all duration-300 font-bold hover:translate-x-1 active:scale-95"
                    >
                      <Phone size={13} className="text-gold shrink-0 animate-pulse" />
                      <span>+91 85260 07178</span>
                    </a>
                    <a 
                      href="tel:+916382752224" 
                      className="flex items-center space-x-2 text-white/80 hover:text-gold transition-all duration-300 font-bold hover:translate-x-1 active:scale-95"
                    >
                      <Phone size={13} className="text-gold shrink-0 animate-pulse" />
                      <span>+91 63827 52224</span>
                    </a>
                  </div>
                </li>
                <li className="flex items-center space-x-3 group">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0 group-hover:bg-gold/20 transition-colors">
                    <Mail className="text-gold h-4 w-4" />
                  </div>
                  <span className="text-white/40 text-sm">smtcpalani2017@gmail.com</span>
                </li>
              </ul>
            </div>

            {/* Timings */}
            <div>
              <h4 className="font-serif font-bold text-base mb-6 text-white relative inline-block">
                Class Timings
                <div className="absolute -bottom-1 left-0 w-8 h-[2px] bg-gold" />
              </h4>
              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Morning Batch</span>
                  <span className="text-gold font-semibold">6:00 AM - 8:00 AM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Evening Batch</span>
                  <span className="text-gold font-semibold">4:30 PM - 7:30 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Weekend Special</span>
                  <span className="text-gold font-semibold">9:00 AM - 1:00 PM</span>
                </div>
              </div>
              <Link 
                href="/contact"
                className="block w-full text-center bg-gradient-to-r from-gold to-gold-light text-navy px-6 py-3 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-gold/20 transition-all duration-300 hover:-translate-y-0.5"
              >
                Book a Free Demo
              </Link>
            </div>
          </div>

          {/* Tagline */}
          <div className="text-center mb-10">
            <p className="text-gold/40 text-sm font-serif italic tracking-wider">&ldquo;Learn &bull; Grow &bull; Success&rdquo;</p>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-white/30 text-xs">
            <p>&copy; {currentYear} Sri Murugan Tuition Center. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-gold transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gold transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-gold transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
