'use client'

import React, { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LogIn, Mail, Lock, Loader2, GraduationCap, AlertCircle, ShieldCheck, UserCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoginPage() {
  const [role, setRole] = useState<'admin' | 'staff' | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 bg-navy rounded-[32px] mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-navy/20">
            <GraduationCap size={48} className="text-gold" />
          </motion.div>
          <h1 className="font-serif font-bold text-navy text-4xl mb-2">SMTC Portal</h1>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">Education Management System</p>
        </div>

        <div className="bg-white rounded-[48px] p-12 shadow-2xl border border-gray-100 relative overflow-hidden min-h-[450px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {!role ? (
              <motion.div 
                key="selection"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                className="space-y-8"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-navy">Who are you?</h2>
                  <p className="text-gray-400 text-sm mt-2">Please select your portal to continue</p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <button 
                    onClick={() => setRole('admin')}
                    className="group bg-navy text-white p-8 rounded-3xl flex items-center justify-between hover:bg-navy-light transition-all shadow-xl shadow-navy/10 hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-5">
                      <div className="p-4 bg-gold/10 text-gold rounded-2xl group-hover:bg-gold group-hover:text-navy transition-all">
                        <ShieldCheck size={32} />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-xl">Admin Portal</div>
                        <div className="text-xs text-white/40 uppercase font-black tracking-widest mt-1">Management Access</div>
                      </div>
                    </div>
                    <LogIn size={24} className="text-gold opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
                  </button>

                  <button 
                    onClick={() => setRole('staff')}
                    className="group bg-white border-2 border-gray-100 p-8 rounded-3xl flex items-center justify-between hover:border-gold transition-all hover:shadow-xl hover:shadow-gold/5 hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-5">
                      <div className="p-4 bg-gray-50 text-navy rounded-2xl group-hover:bg-gold group-hover:text-navy transition-all">
                        <UserCircle size={32} />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-xl text-navy">Staff Portal</div>
                        <div className="text-xs text-gray-400 uppercase font-black tracking-widest mt-1">Teaching & Records</div>
                      </div>
                    </div>
                    <LogIn size={24} className="text-navy opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
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
                  className="mb-8 flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase hover:text-navy transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Selection</span>
                </button>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-navy flex items-center gap-3">
                    {role === 'admin' ? <ShieldCheck className="text-gold" /> : <UserCircle className="text-gold" />}
                    <span>{role === 'admin' ? 'Admin' : 'Staff'} Sign In</span>
                  </h2>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-sm">
                      <AlertCircle size={18} />
                      <span className="font-bold">{error}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gold transition-colors" size={20} />
                      <input 
                        type="email" required placeholder="name@smtc.edu"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl px-12 py-4 text-sm font-bold text-navy focus:ring-2 focus:ring-gold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gold transition-colors" size={20} />
                      <input 
                        type="password" required placeholder="••••••••"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl px-12 py-4 text-sm font-bold text-navy focus:ring-2 focus:ring-gold"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" disabled={loading}
                    className="w-full bg-navy text-gold py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-navy-light transition-all flex items-center justify-center space-x-2"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <><span>Enter Portal</span><LogIn size={20} /></>}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-10 text-center space-y-4">
          <Link href="/" className="block text-[10px] font-black text-gray-400 uppercase hover:text-gold transition-colors tracking-[0.2em]">
            Back to Institutional Website
          </Link>
          <Link href="/setup-admin" className="block text-[10px] font-black text-gold/20 uppercase hover:text-gold transition-colors">
            Initial Admin Setup (One-time)
          </Link>
        </div>
      </div>
    </div>
  )
}
