'use client'

import React, { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Users, Trophy, BookOpen } from 'lucide-react'
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
    const step = Math.ceil(target / 50)
    const timer = setInterval(() => {
      current += step
      if (current >= target) { setCount(target); clearInterval(timer) }
      else setCount(current)
    }, 30)
    return () => clearInterval(timer)
  }, [started, target])

  return <div ref={ref}>{count.toLocaleString()}{suffix}</div>
}

const Stats = () => {
  const { t } = useLanguage()
  
  const stats = [
    {
      icon: <Users className="h-7 w-7" />,
      label: t('stats.students'),
      value: 1000,
      suffix: '+',
      color: 'from-blue-500/20 to-blue-600/20',
      iconColor: 'text-blue-400',
    },
    {
      icon: <GraduationCap className="h-7 w-7" />,
      label: t('stats.years'),
      value: 9,
      suffix: '+',
      color: 'from-gold/20 to-yellow-500/20',
      iconColor: 'text-gold',
    },
    {
      icon: <Trophy className="h-7 w-7" />,
      label: t('stats.pass'),
      value: 100,
      suffix: '%',
      color: 'from-emerald-500/20 to-green-500/20',
      iconColor: 'text-emerald-400',
    },
    {
      icon: <BookOpen className="h-7 w-7" />,
      label: t('stats.toppers'),
      value: 500,
      suffix: '+',
      color: 'from-purple-500/20 to-violet-500/20',
      iconColor: 'text-purple-400',
    },
  ]

  return (
    <div className="bg-[#F8F9FA] py-20 relative overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-navy/5 rounded-full blur-[120px]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="text-center group cursor-default"
            >
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
                <div className={`inline-flex items-center justify-center p-4 bg-gradient-to-br ${stat.color} rounded-2xl mb-5 group-hover:scale-110 transition-transform duration-400`}>
                  <div className={stat.iconColor}>{stat.icon}</div>
                </div>
                <div className="text-4xl font-serif font-bold text-navy mb-2">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Stats
