'use client'

import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'
import Hero from '@/components/layout/Hero'
import Stats from '@/components/layout/Stats'
import Footer from '@/components/layout/Footer'
import { CheckCircle2, Star, TrendingUp, Users2, BookOpen, Trophy, GraduationCap, ArrowRight, User, Beaker, Dna, Calculator, Globe2, Award, Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useLanguage } from '@/context/LanguageContext'

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }

/* ===== CUSTOM SKELETON SHIMMER LOADERS ===== */
const CourseSkeleton = () => (
  <div className="bg-white p-8 rounded-3xl border border-gray-100 animate-pulse h-full space-y-6">
    <div className="w-16 h-16 bg-gray-100 rounded-2xl" />
    <div className="h-6 bg-gray-100 rounded w-2/3" />
    <div className="space-y-2">
      <div className="h-4 bg-gray-100 rounded w-full" />
      <div className="h-4 bg-gray-100 rounded w-5/6" />
    </div>
  </div>
)

const ResultSkeleton = () => (
  <div className="w-full max-w-md h-[450px] bg-white/5 rounded-[40px] p-10 border border-white/10 animate-pulse flex flex-col justify-between">
    <div className="flex justify-between items-start">
      <div className="w-24 h-24 bg-white/10 rounded-3xl border border-white/5" />
      <div className="w-28 h-8 bg-white/10 rounded-full" />
    </div>
    <div className="space-y-4">
      <div className="w-12 h-12 bg-white/10 rounded-full" />
      <div className="h-10 bg-white/10 rounded w-3/4" />
      <div className="h-6 bg-white/10 rounded w-1/2" />
    </div>
    <div className="h-6 bg-white/10 rounded w-2/3" />
  </div>
)

const FacultySkeleton = () => (
  <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 animate-pulse h-full flex flex-col">
    <div className="aspect-[3/4] bg-gray-200" />
    <div className="p-6 space-y-4 flex flex-col flex-1">
      <div className="h-6 bg-gray-200 rounded w-3/4" />
      <div className="grid grid-cols-2 gap-3 mt-auto">
        <div className="h-10 bg-gray-100 rounded" />
        <div className="h-10 bg-gray-100 rounded" />
      </div>
    </div>
  </div>
)

/* ===== RESULTS CAROUSEL ===== */
function ResultCarousel({ results }: { results: any[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % results.length)
    }, 2800)
    return () => clearInterval(timer)
  }, [results.length])

  const r = results[index]

  return (
    <motion.div 
      key={index}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0"
    >
      <div className="glass rounded-[40px] p-10 border border-white/10 hover:bg-white/10 transition-all duration-500 h-full flex flex-col justify-between shadow-2xl">
        <div className="flex justify-between items-start">
           <div className="w-24 h-24 bg-gold/20 rounded-3xl border-4 border-gold/30 flex items-center justify-center overflow-hidden shadow-lg relative">
             {r.image_url ? (
               <img 
                  src={r.image_url} 
                  alt={r.student_name} 
                  className="w-full h-full object-cover" 
                  loading="lazy"
                />
             ) : (
               <GraduationCap className="h-12 w-12 text-gold" />
             )}
           </div>
           <div className="text-right">
             <span className="bg-gradient-to-r from-gold to-gold-light text-navy text-xs font-black px-6 py-2 rounded-full shadow-xl shadow-gold/20 tracking-[0.2em]">{r.achievement}</span>
           </div>
        </div>
        <div className="space-y-2">
           <Quote className="text-gold/20 h-12 w-12 mb-2" />
           <h3 className="text-4xl font-serif font-bold text-white leading-tight">{r.student_name}</h3>
           <p className="text-gold text-xl font-bold tracking-wide">{r.exam_name}: <span className="text-white">{r.score}</span></p>
        </div>
        <div className="pt-8 border-t border-white/5 flex items-center justify-between">
           <p className="text-white/40 text-sm font-medium tracking-widest uppercase italic">The Legacy of SMTC</p>
           <div className="flex space-x-1.5">
              {results.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === index ? 'w-8 bg-gold' : 'w-1.5 bg-white/10'}`} />
              ))}
           </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ===== UNIQUE TESTIMONIALS CAROUSEL ===== */
const testimonials = [
  { name: 'Mrs. Lakshmi', role: 'Parent of 12th Student', text: 'My daughter scored exceptionally well in her board exams. The teaching methodology for Math and Science is simply the best in Palani.' },
  { name: 'Mr. Rajesh Kumar', role: 'Parent of 10th Student', text: 'SMTC transformed my son from an average student to a top achiever in all school subjects. The personal attention is remarkable.' },
  { name: 'Divya Priya', role: 'Spoken English Student', text: 'The Spoken English classes at SMTC are amazing. I feel so much more confident speaking English now, and it has helped my school performance too.' },
  { name: 'Mr. Arun V.', role: 'Parent of 8th Student', text: 'Highly professional coaching for school students. The conceptual clarity given at SMTC is outstanding. My son loves his classes here.' },
  { name: 'Mrs. Selvi M.', role: 'Parent of 12th Student', text: 'A perfect place for students to build their foundation. My son improved drastically in English and Mathematics thanks to the expert faculty.' }
]

function TestimonialCarousel() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  const next = () => setIndex((prev) => (prev + 1) % testimonials.length)
  const prev = () => setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)

  const t = testimonials[index]

  return (
    <div className="relative max-w-4xl mx-auto px-4">
      <div className="relative min-h-[300px] bg-white p-8 sm:p-12 rounded-[32px] sm:rounded-[50px] border border-gray-100 shadow-xl flex flex-col justify-between overflow-hidden">
        <Quote className="absolute top-8 right-8 sm:top-10 sm:right-12 h-16 w-16 text-gold/5" />
        
        <div className="space-y-6">
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={20} className="text-gold fill-gold" />
            ))}
          </div>
          
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-gray-600 text-lg sm:text-xl leading-relaxed italic font-medium"
            >
              &ldquo;{t.text}&rdquo;
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-8 border-t border-gray-50 mt-8 gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-navy text-gold flex items-center justify-center font-bold text-lg shadow-lg shadow-navy/20">
              {t.name[0]}
            </div>
            <div>
              <div className="font-bold text-navy text-base sm:text-lg">{t.name}</div>
              <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{t.role}</div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button 
              onClick={prev}
              className="w-10 h-10 rounded-full border border-gray-200 hover:border-gold hover:text-gold flex items-center justify-center text-navy transition-all active:scale-90"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={next}
              className="w-10 h-10 rounded-full border border-gray-200 hover:border-gold hover:text-gold flex items-center justify-center text-navy transition-all active:scale-90"
              aria-label="Next testimonial"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center space-x-2 mt-6">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-gold' : 'w-2 bg-gray-200'}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const [faculty, setFaculty] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { t } = useLanguage()

  const ICON_MAP: Record<string, any> = {
    'BookOpen': <BookOpen className="h-7 w-7" />,
    'Calculator': <Calculator className="h-7 w-7" />,
    'TrendingUp': <TrendingUp className="h-7 w-7" />,
    'Beaker': <Beaker className="h-7 w-7" />,
    'Dna': <Dna className="h-7 w-7" />,
    'Trophy': <Trophy className="h-7 w-7" />
  }

  useEffect(() => {
    const fetchData = async () => {
      const [facRes, courRes, resRes] = await Promise.all([
        supabase.from('users')
          .select('name, subject, experience, image_url, is_featured')
          .eq('role', 'staff')
          .not('image_url', 'is', null)
          .order('is_featured', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false }),
        supabase.from('website_courses').select('*').eq('is_active', true).order('created_at', { ascending: true }),
        supabase.from('website_results').select('*').eq('is_featured', true).limit(4)
      ])
      
      // Filter out faculty members who do not have a valid image_url
      const validFaculty = (facRes.data || []).filter(
        (f: any) => f.image_url && f.image_url.trim() !== ''
      )
      
      setFaculty(validFaculty)
      setCourses(courRes.data || [])
      setResults(resRes.data || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Stats />

      {/* ===== ABOUT OVERVIEW ===== */}
      <section className="py-28 bg-[#001F3F] text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/smtc-logo.png')] bg-fixed opacity-[0.03] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.7 }} className="lg:w-1/2 relative">
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <div className="aspect-video bg-gradient-to-br from-navy-dark to-navy flex items-center justify-center p-12 relative">
                  <div className="absolute inset-0 bg-[url('/smtc-logo.png')] bg-center bg-no-repeat bg-contain opacity-[0.06]" />
                  <div className="text-center relative z-10 w-full">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 bg-white rounded-full p-2.5 shadow-lg">
                      <Image 
                        src="/smtc-logo.png" 
                        alt="SMTC Logo" 
                        fill 
                        sizes="(max-width: 480px) 150px, (max-width: 768px) 250px, 400px"
                        className="object-contain" 
                        loading="lazy"
                      />
                    </div>
                    <h3 className="text-white font-serif text-2xl">Institutional Excellence</h3>
                    <p className="text-gold/60 italic text-sm mt-2">Since 2017 &bull; Palani</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-gold/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-navy/5 rounded-full blur-3xl" />
            </motion.div>
            
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.7, delay: 0.2 }} className="lg:w-1/2">
              <span className="text-gold font-bold tracking-[0.2em] uppercase text-xs mb-4 block">Since 2017</span>
              <h2 className="section-title text-white">About SMTC</h2>
              <p className="text-white/60 mb-6 text-lg leading-relaxed italic">&ldquo;Excellence in teaching, integrity in mentorship, and success in results.&rdquo;</p>
              <p className="text-white/50 mb-8 leading-relaxed">Sri Murugan Tuition Center (SMTC) has been a beacon of academic excellence in Palani for over 9 years. We specialize in comprehensive coaching for students from 6th to 12th Standard for all subjects, along with dedicated Spoken English classes to build student confidence.</p>
              <div className="grid grid-cols-2 gap-6 mb-10">
                {[{ t: 'Our Vision', d: 'Nurturing future leaders through quality education.' }, { t: 'Our Values', d: 'Integrity, dedication, and student-first approach.' }].map((item) => (
                  <div key={item.t} className="flex items-start space-x-3">
                    <CheckCircle2 className="text-gold h-5 w-5 mt-1 shrink-0" />
                    <div><h4 className="font-bold text-gold text-sm">{item.t}</h4><p className="text-xs text-white/60">{item.d}</p></div>
                  </div>
                ))}
              </div>
              <Link href="/about" className="btn-primary inline-flex items-center space-x-2 text-sm">
                <span>Learn More About SMTC</span><ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== COURSES ===== */}
      <section className="py-28 bg-academic-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/3 rounded-full blur-[150px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="section-title section-title-center !text-[#001F3F]">Our Specialized Courses</h2>
            <p className="text-slate-700 mt-6 max-w-2xl mx-auto font-medium">Tailored academic programs designed to bridge the gap between classroom learning and competitive success.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {loading ? (
              <>
                <CourseSkeleton />
                <CourseSkeleton />
                <CourseSkeleton />
              </>
            ) : courses.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-400 italic">No courses listed yet.</div>
            ) : courses.map((course: any, i: number) => (
              <motion.div key={course.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}>
                <div className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-gold/30 transition-all duration-500 group hover:shadow-2xl hover:shadow-gold/5 hover:-translate-y-2 h-full">
                  <div className="bg-gradient-to-br from-navy to-navy-light p-4 rounded-2xl inline-block mb-6 text-gold group-hover:scale-110 group-hover:rotate-3 transition-all duration-400 shadow-lg shadow-navy/20">
                    {ICON_MAP[course.icon_name] || <BookOpen className="h-7 w-7" />}
                  </div>
                  <h3 className="text-xl font-bold text-navy mb-3">{course.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{course.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/courses" className="inline-flex items-center space-x-2 border-2 border-navy text-navy px-10 py-4 rounded-full font-bold hover:bg-navy hover:text-white transition-all duration-300 hover:-translate-y-1">
              <span>View All Courses</span><ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== RESULTS ===== */}
      <section className="py-28 gradient-hero text-white relative overflow-hidden gpu-accelerated-container">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 left-10 w-[300px] h-[300px] bg-gold/4 rounded-full blur-[80px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="lg:w-1/2">
               <h2 className="section-title text-white">Proven Excellence</h2>
               <p className="text-white/50 mb-12 text-lg leading-relaxed max-w-xl">From 6th Standard to Board Exams, our students consistently achieve top marks across all subjects and excel in our Spoken English programs.</p>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12 gpu-accelerated-content">
                 {[
                   { icon: <Trophy size={24} />, val: '100%', label: 'Pass Percentage' },
                   { icon: <Star size={24} />, val: 'A+', label: 'Grade Average' },
                   { icon: <Users2 size={24} />, val: '1000+', label: 'Centum Achievers' },
                   { icon: <GraduationCap size={24} />, val: '24+', label: 'State Ranks' }
                 ].map((s, i) => (
                   <div key={s.label} className="flex items-center space-x-4 group">
                     <div className="bg-gold/10 p-4 rounded-2xl text-gold border border-gold/10 group-hover:bg-gold group-hover:text-navy transition-all duration-300">{s.icon}</div>
                     <div>
                       <div className="text-3xl font-bold font-serif">{s.val}</div>
                       <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-black">{s.label}</div>
                     </div>
                   </div>
                 ))}
               </div>

               <Link href="/results" className="inline-flex items-center space-x-3 bg-gold text-navy px-8 py-4 rounded-full font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-gold/10">
                 <span>Full Hall of Fame</span><ArrowRight size={20} />
               </Link>
            </motion.div>

            <div className="lg:w-1/2 w-full flex justify-center">
               <div className="w-full max-w-md h-[380px] sm:h-[450px] relative">
                  {loading ? (
                    <ResultSkeleton />
                  ) : results.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-white/20 italic">Results coming soon...</div>
                  ) : (
                    <ResultCarousel results={results} />
                  )}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FACULTY ===== */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="section-title section-title-center !text-[#001F3F]">Our Expert Faculty</h2>
            <p className="text-slate-700 mt-6 max-w-2xl mx-auto font-medium">Guided by experience, driven by passion. Meet the mentors who shape future achievers.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
            {loading ? (
              <>
                <FacultySkeleton />
                <FacultySkeleton />
                <FacultySkeleton />
                <FacultySkeleton />
              </>
            ) : faculty.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-400 italic">Faculty profiles coming soon...</div>
            ) : faculty.map((f: any, i: number) => (
              <motion.div key={f.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }} className="h-full">
                <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 group hover:shadow-2xl hover:shadow-navy/10 transition-all duration-500 hover:-translate-y-3 h-full flex flex-col">
                  <div className="w-full h-56 sm:h-64 bg-gradient-to-br from-[#001F3F] to-[#001229] flex items-center justify-center relative overflow-hidden shrink-0">
                    {f.image_url ? (
                      <img 
                        src={f.image_url} 
                        alt={f.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        loading="lazy"
                      />
                    ) : (
                      <User size={70} className="text-white/10 group-hover:scale-125 transition-transform duration-700" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="text-gold font-black text-xs uppercase tracking-[0.2em]">{f.subject || 'Faculty'}</div>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-navy text-lg mb-4 line-clamp-2 min-h-[3.5rem] flex items-start">{f.name}</h3>
                    <div className="grid grid-cols-2 gap-3 mt-auto">
                      <div className="text-center p-2.5 bg-academic-white rounded-xl">
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Experience</div>
                        <div className="text-sm font-black text-navy">{f.experience || '–'}</div>
                      </div>
                      <div className="text-center p-2.5 bg-academic-white rounded-xl">
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Subject</div>
                        <div className="text-[10px] font-black text-gold truncate px-1">{f.subject || 'Expert'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/faculty" className="inline-flex items-center space-x-2 bg-navy text-white px-10 py-4 rounded-full font-bold hover:bg-gold hover:text-navy transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-navy/20">
              <span>Meet Our Faculty</span><ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS (UNIQUE CAROUSEL) ===== */}
      <section className="py-28 bg-academic-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-navy/3 rounded-full blur-[150px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-16">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center">
            <h2 className="section-title section-title-center text-[#001F3F]">What Parents Say</h2>
            <p className="text-slate-700 mt-6 max-w-2xl mx-auto font-medium">Hear from parents and students who trust SMTC for academic excellence.</p>
          </motion.div>
        </div>

        <TestimonialCarousel />
      </section>

      <Footer />
    </main>
  )
}
