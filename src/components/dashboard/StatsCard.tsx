import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color?: 'gold' | 'navy' | 'green' | 'blue' | 'red' | 'purple'
  trend?: { value: number; label: string }
}

const colorMap = {
  gold: { bg: 'bg-[#D4AF37]/10', icon: 'text-[#D4AF37]', badge: 'bg-[#D4AF37]/20 text-[#D4AF37]', border: 'border-[#D4AF37]/20' },
  navy: { bg: 'bg-[#001F3F]/10', icon: 'text-[#001F3F]', badge: 'bg-[#001F3F]/10 text-[#001F3F]', border: 'border-[#001F3F]/20' },
  green: { bg: 'bg-emerald-50', icon: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200' },
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', badge: 'bg-blue-100 text-blue-700', border: 'border-blue-200' },
  red: { bg: 'bg-red-50', icon: 'text-red-600', badge: 'bg-red-100 text-red-700', border: 'border-red-200' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', badge: 'bg-purple-100 text-purple-700', border: 'border-purple-200' },
}

export default function StatsCard({ title, value, subtitle, icon: Icon, color = 'gold', trend }: StatsCardProps) {
  const c = colorMap[color]
  return (
    <div className={`bg-white rounded-2xl border ${c.border} p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`${c.bg} p-3 rounded-xl`}>
          <Icon className={`h-5 w-5 ${c.icon}`} />
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${c.badge}`}>
            {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
          </span>
        )}
      </div>
      <div className="text-2xl font-black text-[#001F3F] mb-0.5">{value}</div>
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
    </div>
  )
}
