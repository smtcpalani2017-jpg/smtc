'use client'

import React, { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Award, Star, Sparkles } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true) },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    let current = 0
    const step = Math.ceil(target / 60)
    const timer = setInterval(() => {
      current += step
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(current)
    }, 25)
    return () => clearInterval(timer)
  }, [started, target])

  return <div ref={ref} className="counter-value">{count.toLocaleString()}{suffix}</div>
}

const Hero = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const { t } = useLanguage()
  
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  return (
    <div className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-[#001229] gradient-hero">
      {/* Dynamic Light Effects */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(800px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(212, 175, 55, 0.06), transparent 60%)`
        }}
      />
      
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-gold/4 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-blue-500/3 rounded-full blur-[80px] animate-pulse-glow" style={{ animationDelay: '4s' }} />
        
        {/* Floating Geometric Elements */}
        <motion.div 
          animate={{ y: [-20, 20, -20], rotate: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-32 right-[15%] w-3 h-3 bg-gold/30 rounded-full"
        />
        <motion.div 
          animate={{ y: [15, -15, 15], rotate: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-[60%] right-[10%] w-2 h-2 bg-gold/20 rounded-full"
        />
        <motion.div 
          animate={{ y: [-10, 25, -10] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-[40%] left-[5%] w-4 h-4 border border-gold/20 rounded-full"
        />
        <motion.div 
          animate={{ y: [20, -15, 20], x: [-10, 10, -10] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute bottom-[30%] right-[25%] w-2 h-2 bg-white/10 rounded-sm rotate-45"
        />

        {/* Decorative Lines */}
        <svg className="absolute top-0 left-0 w-full h-full opacity-[0.03]" viewBox="0 0 1200 800">
          <line x1="0" y1="200" x2="1200" y2="200" stroke="#D4AF37" strokeWidth="0.5"/>
          <line x1="0" y1="400" x2="1200" y2="400" stroke="#D4AF37" strokeWidth="0.5"/>
          <line x1="0" y1="600" x2="1200" y2="600" stroke="#D4AF37" strokeWidth="0.5"/>
          <line x1="300" y1="0" x2="300" y2="800" stroke="#D4AF37" strokeWidth="0.5"/>
          <line x1="600" y1="0" x2="600" y2="800" stroke="#D4AF37" strokeWidth="0.5"/>
          <line x1="900" y1="0" x2="900" y2="800" stroke="#D4AF37" strokeWidth="0.5"/>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="inline-flex items-center space-x-2 glass px-5 py-2.5 rounded-full mb-8"
            >
              <Sparkles className="text-gold h-4 w-4" />
              <span className="text-white/90 text-xs font-semibold uppercase tracking-wider">
                Excellence in Education Since 2017
              </span>
              <div className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
            </motion.div>
            
              <h1 className="text-5xl md:text-6xl xl:text-7xl font-serif font-bold text-white mb-6 leading-[1.1]">
              {t('hero.title1')}{' '}
              <br />
              <span className="relative">
                <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
                  {t('hero.title2')}
                </span>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.2, duration: 0.8, ease: 'easeOut' }}
                  className="absolute -bottom-2 left-0 right-0 h-[3px] bg-gradient-to-r from-gold via-gold-light to-transparent origin-left"
                />
              </span>
            </h1>
            
             <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-white/60 text-lg mb-10 max-w-xl leading-relaxed"
            >
              {t('hero.desc')}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <Link 
                href="/courses"
                className="btn-primary flex items-center justify-center space-x-2 text-base"
              >
                <span>{t('hero.view_courses')}</span>
                <ArrowRight size={18} />
              </Link>
              <Link 
                href="/contact"
                className="btn-outline flex items-center justify-center text-base"
              >
                {t('hero.enquiry')}
              </Link>
            </motion.div>


          </motion.div>

          {/* Right Side - Logo Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:flex items-center justify-center"
          >
            {/* Rotating ring */}
            <div className="absolute w-[480px] h-[480px] border border-gold/10 rounded-full animate-spin-slow" />
            <div className="absolute w-[420px] h-[420px] border border-gold/5 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '30s' }} />
            
            {/* Glow behind logo */}
            <div className="absolute w-[350px] h-[350px] bg-gold/8 rounded-full blur-[80px] animate-pulse-glow" />
            
            {/* Logo Container */}
            <motion.div 
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative z-10"
            >
              <div className="relative w-[320px] h-[320px] xl:w-[380px] xl:h-[380px] bg-white rounded-full p-8 shadow-[0_0_50px_rgba(255,255,255,0.2)] flex items-center justify-center">
                <div className="relative w-full h-full">
                  <Image 
                    src="/smtc-logo.png" 
                    alt="Sri Murugan Tuition Center - SMTC Palani"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </motion.div>

            {/* Floating Achievement Cards */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-4 -left-4 glass rounded-2xl p-5 shadow-2xl z-20"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-gold/20 p-2.5 rounded-xl">
                  <Award className="text-gold h-6 w-6" />
                </div>
                <div>
                  <div className="text-white font-bold text-lg">Top Ranks</div>
                  <div className="text-white/50 text-xs font-medium">Every Single Year</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [8, -8, 8] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              className="absolute -top-2 -right-2 glass rounded-2xl p-4 shadow-2xl z-20"
            >
              <div className="flex items-center space-x-2">
                <Star className="text-gold h-5 w-5 fill-gold" />
                <Star className="text-gold h-5 w-5 fill-gold" />
                <Star className="text-gold h-5 w-5 fill-gold" />
                <Star className="text-gold h-5 w-5 fill-gold" />
                <Star className="text-gold h-5 w-5 fill-gold" />
              </div>
              <p className="text-white/70 text-[10px] mt-1.5 font-semibold text-center">Rated #1 in Palani</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

    </div>
  )
}

export default Hero
