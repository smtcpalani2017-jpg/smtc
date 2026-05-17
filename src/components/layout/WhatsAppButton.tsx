'use client'

import React from 'react'

export default function WhatsAppButton() {
  const whatsappUrl = "https://wa.me/918526007178?text=Hello%20SMTC%2C%20I%20would%20like%20to%20enquire%20about%20admissions%20and%20classes."

  return (
    <a 
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-[0_4px_24px_rgba(37,211,102,0.4)] hover:shadow-[0_8px_32px_rgba(37,211,102,0.6)] transition-all duration-300 hover:scale-110 active:scale-95 group focus:outline-none"
      aria-label="Contact SMTC on WhatsApp"
    >
      {/* Animated Pulse Waves */}
      <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping opacity-75 pointer-events-none group-hover:animate-none" />
      
      {/* WhatsApp SVG Icon */}
      <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.574 1.971 14.1 .946 11.993.946c-5.444 0-9.87 4.372-9.874 9.802-.001 1.73.473 3.41 1.37 4.908L2.44 19.5l4.207-1.104zM18.818 15.68c-.33-.165-1.953-.964-2.253-1.074-.3-.109-.518-.165-.738.165-.218.331-.849 1.074-1.04 1.294-.188.22-.379.247-.708.082-1.229-.615-2.099-1.08-2.936-2.518-.22-.379-.22-.379.082-.678.272-.271.33-.33.495-.497.162-.165.218-.275.33-.495.11-.22.055-.413-.028-.578-.083-.166-.738-1.782-1.01-2.44-.266-.64-.539-.553-.738-.563-.19-.01-.409-.012-.628-.012-.22 0-.578.082-.88.413-.3.33-1.155 1.129-1.155 2.752 0 1.623 1.182 3.192 1.346 3.413.165.22 2.327 3.55 5.637 4.978.788.34 1.402.543 1.882.697.79.25 1.512.215 2.08.13.634-.096 1.953-.798 2.228-1.57.275-.771.275-1.432.193-1.57-.083-.139-.303-.222-.633-.387z" />
      </svg>
    </a>
  )
}
