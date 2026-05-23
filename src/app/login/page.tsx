'use client'

import React, { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LogIn, Mail, Lock, Loader2, GraduationCap, AlertCircle, ShieldCheck, UserCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoginPage() {
  const [role, setRole] = useState<'admin' | 'staff' | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (fetchError || !userData) {
      setError('User profile not found.')
      setLoading(false)
      return
    }

    // Role validation
    if (userData.role !== role) {
      setError(`This account is not registered as ${role}.`)
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    localStorage.setItem('smtc_user', JSON.stringify(userData))
    router.push(role === 'admin' ? '/admin' : '/teacher/students')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gold/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-navy/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md sm:max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-16 h-16 sm:w-24 sm:h-24 bg-navy rounded-[20px] sm:rounded-[32px] mx-auto flex items-center justify-center mb-4 sm:mb-6 shadow-2xl shadow-navy/20">
            <GraduationCap className="h-8 w-8 sm:h-12 sm:w-12 text-gold" />
          </motion.div>
          <h1 className="font-serif font-bold text-navy text-3xl sm:text-4xl mb-2">SMTC Portal</h1>
          <p className="text-[9px] sm:text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">Education Management System</p>
        </div>

        <div className="bg-white rounded-[24px] sm:rounded-[48px] p-6 sm:p-12 shadow-2xl border border-gray-100 relative overflow-hidden min-h-[400px] sm:min-h-[450px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {!role ? (
              <motion.div 
                key="selection"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                className="space-y-6 sm:space-y-8"
              >
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-navy">Who are you?</h2>
                  <p className="text-gray-400 text-xs sm:text-sm mt-2">Please select your portal to continue</p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <button 
                    onClick={() => setRole('admin')}
                    className="group bg-navy text-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl flex items-center justify-between hover:bg-navy-light transition-all shadow-xl shadow-navy/10 hover:-translate-y-1 text-left"
                  >
                    <div className="flex items-center gap-3 sm:gap-5">
                      <div className="p-3 sm:p-4 bg-gold/10 text-gold rounded-xl sm:rounded-2xl group-hover:bg-gold group-hover:text-navy transition-all">
                        <ShieldCheck className="h-6 w-6 sm:h-8 sm:w-8" />
                      </div>
                      <div>
                        <div className="font-bold text-lg sm:text-xl">Admin Portal</div>
                        <div className="text-[9px] sm:text-xs text-white/40 uppercase font-black tracking-widest mt-1">Management Access</div>
                      </div>
                    </div>
                    <LogIn size={20} className="text-gold opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0 hidden sm:block" />
                  </button>

                  <button 
                    onClick={() => setRole('staff')}
                    className="group bg-white border-2 border-gray-100 p-5 sm:p-8 rounded-2xl sm:rounded-3xl flex items-center justify-between hover:border-gold transition-all hover:shadow-xl hover:shadow-gold/5 hover:-translate-y-1 text-left"
                  >
                    <div className="flex items-center gap-3 sm:gap-5">
                      <div className="p-3 sm:p-4 bg-gray-50 text-navy rounded-xl sm:rounded-2xl group-hover:bg-gold group-hover:text-navy transition-all">
                        <UserCircle className="h-6 w-6 sm:h-8 sm:w-8" />
                      </div>
                      <div>
                        <div className="font-bold text-lg sm:text-xl text-navy">Staff Portal</div>
                        <div className="text-[9px] sm:text-xs text-gray-400 uppercase font-black tracking-widest mt-1">Teaching & Records</div>
                      </div>
                    </div>
                    <LogIn size={20} className="text-navy opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0 hidden sm:block" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="form"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
              >
                <button 
                  onClick={() => { setRole(null); setError(''); }}
                  className="mb-6 sm:mb-8 flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-gray-400 uppercase hover:text-navy transition-colors"
                >
                  <ArrowLeft size={12} />
                  <span>Back to Selection</span>
                </button>

                <div className="mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-navy flex items-center gap-3">
                    {role === 'admin' ? <ShieldCheck className="text-gold" /> : <UserCircle className="text-gold" />}
                    <span>{role === 'admin' ? 'Admin' : 'Staff'} Sign In</span>
                  </h2>
                </div>

                <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-100 p-4 rounded-xl sm:rounded-2xl flex items-center gap-3 text-red-500 text-xs sm:text-sm">
                      <AlertCircle size={16} className="sm:w-[18px] sm:h-[18px] shrink-0" />
                      <span className="font-bold">{error}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gold transition-colors sm:w-5 sm:h-5" size={18} />
                      <input 
                        type="email" required placeholder="name@smtc.edu"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-xl sm:rounded-2xl px-11 sm:px-12 py-3.5 sm:py-4 text-xs sm:text-sm font-bold text-navy focus:ring-2 focus:ring-gold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gold transition-colors sm:w-5 sm:h-5" size={18} />
                      <input 
                        type={showPassword ? "text" : "password"} required placeholder="••••••••"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-xl sm:rounded-2xl pl-11 sm:pl-12 pr-12 py-3.5 sm:py-4 text-xs sm:text-sm font-bold text-navy focus:ring-2 focus:ring-gold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy transition-colors focus:outline-none"
                      >
                        {showPassword ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit" disabled={loading}
                    className="w-full bg-navy text-gold py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest hover:bg-navy-light transition-all flex items-center justify-center space-x-2"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <><span>Enter Portal</span><LogIn size={18} className="sm:w-5 sm:h-5" /></>}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full px-2 sm:px-0">
          <Link href="/" className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-900 border border-slate-200 hover:border-slate-900 text-slate-600 hover:text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-xl hover:-translate-y-0.5 cursor-pointer w-full sm:w-auto text-center shrink-0">
            <ArrowLeft size={14} /> Back to Website
          </Link>
          <Link href="/setup-admin" className="inline-flex items-center justify-center gap-2 bg-amber-50/50 hover:bg-amber-500 border border-amber-200/40 hover:border-amber-500 text-amber-600 hover:text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-xl hover:-translate-y-0.5 cursor-pointer w-full sm:w-auto text-center shrink-0">
            <ShieldCheck size={14} /> Initial Admin Setup
          </Link>
        </div>
      </div>
    </div>
  )
}
