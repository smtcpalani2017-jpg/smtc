'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/utils/supabase/client'
import { ImageIcon, X, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }

export default function GalleryPage() {
  const [gallery, setGallery] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<any | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true)
      const { data, error } = await supabase.storage.from('faculty').download('gallery.json')
      
      let galleryData = []
      if (data) {
        try {
          const text = await data.text()
          galleryData = JSON.parse(text)
        } catch (e) {
          console.error('Error parsing gallery JSON', e)
        }
      }
      setGallery(galleryData)
      setLoading(false)
    }
    
    fetchGallery()
  }, [])

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <div className="bg-[#001F3F]">
        <Navbar />
      </div>

      {/* Hero Section */}
      <section className="bg-[#001F3F] text-white pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/smtc-logo.png')] bg-fixed opacity-[0.03] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="inline-flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full mb-6 border border-white/20">
             <ImageIcon className="text-gold" size={16} />
             <span className="text-xs font-black uppercase tracking-widest text-gold">Memories & Milestones</span>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} className="text-5xl md:text-6xl font-serif font-bold mb-6">Our Photo Gallery</motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.1 }} className="text-white/60 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            A glimpse into the life at Sri Murugan Tuition Center. From academic achievements to special events, explore our journey.
          </motion.p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
               <Loader2 className="animate-spin mb-4 text-gold" size={40} />
               <p className="font-bold tracking-widest uppercase text-sm">Loading Gallery...</p>
            </div>
          ) : gallery.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-20 text-center shadow-lg">
               <ImageIcon size={48} className="mx-auto text-gray-300 mb-6" />
               <h3 className="text-2xl font-serif font-bold text-navy mb-2">Gallery is Empty</h3>
               <p className="text-gray-500 mb-8">We are still curating our best memories. Check back later!</p>
               <Link href="/" className="inline-flex items-center space-x-2 bg-navy text-gold px-8 py-3 rounded-xl font-bold hover:bg-gold hover:text-navy transition-all duration-300">
                 <span>Back to Home</span><ArrowRight size={18} />
               </Link>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {gallery.map((item, index) => (
                <motion.div 
                  key={item.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="break-inside-avoid"
                >
                  <div 
                    onClick={() => setSelectedImage(item)}
                    className="bg-white p-3 rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gold/10 transition-all duration-300 cursor-pointer group hover:-translate-y-1"
                  >
                     <div className="rounded-2xl overflow-hidden relative">
                        <img 
                          src={item.image_url} 
                          alt={item.title} 
                          className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" 
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-navy/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <ImageIcon className="text-white" size={32} />
                        </div>
                     </div>
                     <div className="p-5">
                        <h3 className="font-serif font-extrabold text-navy text-xl">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-2 leading-relaxed font-medium">{item.description}</p>
                        )}
                     </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedImage(null)} 
              className="absolute inset-0 bg-navy/95 backdrop-blur-md cursor-zoom-out" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-5xl bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedImage(null)} 
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center backdrop-blur transition-all"
              >
                <X size={20} />
              </button>
              
              <div className="w-full md:w-2/3 bg-gray-100 flex items-center justify-center relative overflow-hidden p-0 min-h-[300px]">
                <img 
                  src={selectedImage.image_url} 
                  alt={selectedImage.title} 
                  className="w-full h-full object-contain max-h-[90vh]"
                />
              </div>
              
              <div className="w-full md:w-1/3 p-8 flex flex-col justify-center bg-white">
                <div className="inline-flex items-center space-x-2 bg-gold/10 px-3 py-1.5 rounded-lg mb-4 text-gold w-fit">
                   <ImageIcon size={14} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Gallery Item</span>
                </div>
                <h3 className="text-3xl font-serif font-bold text-navy mb-4 leading-tight">{selectedImage.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {selectedImage.description || 'No additional details provided for this image.'}
                </p>
                
                {selectedImage.created_at && (
                  <div className="mt-8 pt-8 border-t border-gray-100">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Added On</span>
                    <span className="text-sm font-bold text-navy">{new Date(selectedImage.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  )
}
