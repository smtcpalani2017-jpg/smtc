'use client'

import React, { useState } from 'react'
import { addStaffAction } from '@/app/actions/staff'
import { ShieldCheck, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function SetupAdminPage() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState({ type: '', msg: '' })

  const handleSetup = async () => {
    setLoading(true)
    const result = await addStaffAction({
      name: 'Admin',
      email: 'smtcpalani2017@gmail.com',
      password: 'smtc@2017'
    })

    if (result.success) {
      setStatus({ type: 'success', msg: 'Main Admin account created successfully! You can now login.' })
    } else {
      setStatus({ type: 'error', msg: result.error || 'Failed to create admin.' })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-[40px] p-10 shadow-2xl border border-gray-100 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-navy text-gold rounded-2xl flex items-center justify-center mx-auto mb-6">
           <ShieldCheck size={32} />
        </div>
        <h1 className="font-serif font-bold text-2xl text-navy mb-2">Initial Admin Setup</h1>
        <p className="text-gray-400 text-sm mb-8">Click below to register the main admin account into the Auth system.</p>

        {status.msg && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${status.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span>{status.msg}</span>
          </div>
        )}

        <button 
          onClick={handleSetup}
          disabled={loading}
          className="w-full bg-navy text-gold py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-navy-light transition-all flex items-center justify-center"
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Setup Main Admin Account'}
        </button>
      </div>
    </div>
  )
}
