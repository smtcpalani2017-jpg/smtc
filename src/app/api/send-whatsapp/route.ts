import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { studentName, parentName, phone } = await request.json()

    // Clean phone number
    let cleanPhone = phone.replace(/[^0-9]/g, '')
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone // default to India country code
    }

    const todayStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    const text = `Dear Parent,\nYour child *${studentName}* was *ABSENT* for SMTC Tuition class today (${todayStr}). Please ensure their regular attendance.\n\n- SMTC Tuition Academy`

    const instanceId = process.env.WHATSAPP_INSTANCE_ID
    const token = process.env.WHATSAPP_API_TOKEN

    // Real Ultramsg API dispatch if configured
    if (instanceId && token) {
      const response = await fetch(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          token: token,
          to: cleanPhone,
          body: text,
          priority: '10'
        })
      })
      const result = await response.json()
      return NextResponse.json({ success: true, provider: 'ultramsg', result })
    }

    // Fail if API credentials are not set so frontend knows it must use manual/stepper mode
    return NextResponse.json({ 
      success: false, 
      error: 'WhatsApp API credentials not configured. Please add WHATSAPP_INSTANCE_ID and WHATSAPP_API_TOKEN in .env.local to send automatic background messages.' 
    }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
