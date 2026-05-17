'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, User, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { useLanguage } from '@/context/LanguageContext'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { language, setLanguage, t } = useLanguage()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.about'), href: '/about' },
    { name: t('nav.courses'), href: '/courses' },
    { name: t('nav.results'), href: '/results' },
    { name: t('nav.faculty'), href: '/faculty' },
    { name: t('nav.contact'), href: '/contact' },
  ]

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-700 ${
        isScrolled 
          ? 'bg-navy-dark/95 backdrop-blur-xl py-1 shadow-2xl shadow-black/20 border-b border-gold/10' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-12 h-12 transition-transform duration-500 group-hover:scale-110 bg-white rounded-full p-2 shadow-lg">
              <Image 
                src="/smtc-logo.png" 
                alt="SMTC Logo" 
                fill 
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-2xl leading-none text-white tracking-tight">
                SMTC
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-gold/80 font-semibold mt-0.5">
                Palani
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-semibold transition-all duration-300 relative group ${
                    isActive ? 'text-gold' : 'text-white/70 hover:text-white'
                  }`}
                >
                  <span className="relative z-10">{link.name}</span>
                  {isActive ? (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                      style={{ 
                        background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
                        boxShadow: '0 0 12px rgba(212, 175, 55, 0.6)'
                      }}
                      initial={false}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  ) : (
                    <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-center" />
                  )}
                </Link>
              )
            })}

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="ml-4 px-4 py-1.5 border border-gold/30 rounded-full text-xs font-bold text-gold hover:bg-gold hover:text-navy transition-all duration-300"
            >
              {language === 'en' ? 'தமிழ்' : 'English'}
            </button>

            <div className="pl-6 ml-4 border-l border-white/10">
              <Link
                href="/login"
                className="relative overflow-hidden bg-gold hover:bg-gold-light text-navy px-7 py-3 rounded-full text-sm font-black flex items-center space-x-2 transition-all duration-400 transform hover:-translate-y-1 active:translate-y-0 shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] group border-2 border-white/20"
              >
                <User size={18} className="text-navy" />
                <span className="tracking-wider uppercase">{t('nav.login')}</span>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 text-white hover:text-gold focus:outline-none transition-colors rounded-xl hover:bg-white/5"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden bg-navy-dark/98 backdrop-blur-2xl border-t border-gold/10 shadow-2xl overflow-hidden"
          >
            <div className="px-4 pt-4 pb-8 space-y-1">
              {navLinks.map((link, i) => {
                const isActive = pathname === link.href
                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-5 py-4 rounded-xl text-base font-bold transition-all ${
                        isActive 
                          ? 'bg-gradient-to-r from-gold to-gold-light text-navy shadow-lg shadow-gold/20' 
                          : 'text-white/80 hover:bg-white/5 hover:text-gold'
                      }`}
                    >
                      <span>{link.name}</span>
                      {isActive && <ChevronRight size={18} />}
                    </Link>
                  </motion.div>
                )
              })}
              <motion.div 
                className="pt-4 mt-4 border-t border-white/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <button
                  onClick={() => {
                    setLanguage(language === 'en' ? 'ta' : 'en')
                    setIsMobileMenuOpen(false)
                  }}
                  className="flex items-center justify-center space-x-2 w-full px-4 py-4 bg-navy-dark border-2 border-gold/20 text-gold font-bold rounded-xl mb-3 shadow-lg"
                >
                  <span>{language === 'en' ? 'தமிழ் மொழிக்கு மாற்றவும்' : 'Switch to English'}</span>
                </button>

                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center space-x-2 w-full px-4 py-4 bg-gold text-navy font-black rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.3)] border-2 border-white/10"
                >
                  <User size={20} />
                  <span>{t('nav.login')}</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
