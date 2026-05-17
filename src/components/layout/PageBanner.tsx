import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface PageBannerProps {
  title: string
  subtitle?: string
  breadcrumb: { name: string; href?: string }[]
}

const PageBanner = ({ title, subtitle, breadcrumb }: PageBannerProps) => {
  return (
    <div className="bg-navy pt-48 pb-24 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gold rounded-full blur-[120px]" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gold/20 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Breadcrumb */}
        <nav className="flex justify-center items-center space-x-2 text-gold/60 text-sm font-bold uppercase tracking-widest mb-6">
          <Link href="/" className="hover:text-gold transition-colors">Home</Link>
          {breadcrumb.map((item, index) => (
            <React.Fragment key={index}>
              <ChevronRight size={14} className="text-white/20" />
              {item.href ? (
                <Link href={item.href} className="hover:text-gold transition-colors">{item.name}</Link>
              ) : (
                <span className="text-gold font-bold">{item.name}</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-gold/80 text-lg md:text-xl font-medium max-w-2xl mx-auto italic">
            &quot;{subtitle}&quot;
          </p>
        )}
      </div>
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-30" />
    </div>
  )
}

export default PageBanner
