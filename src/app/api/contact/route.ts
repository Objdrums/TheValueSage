import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message required' }, { status: 400 })
    }

    const supabase = createSupabaseAdminClient()

    await supabase.from('contact_messages').insert({ name, email, subject, message })

    // Notify you via email
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)

        // Notify you
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'The Value Sage <onboarding@resend.dev>',
          to: 'thevaluesage@gmail.com',
          subject: `New contact: ${subject || 'No subject'} — from ${name}`,
          html: `<p><strong>From:</strong> ${name} (${email})</p><p><strong>Subject:</strong> ${subject}</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br/>')}</p>`,
        })

        // Confirm to sender
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'The Value Sage <onboarding@resend.dev>',
          to: email,
          subject: 'Message received — The Value Sage™',
          html: `<div style="font-family:sans-serif;max-width:500px;padding:32px"><h2 style="color:#FF4D2E">Message received.</h2><p>Hi ${name},</p><p>Your message has been received. Expect a response within 24–48hrs.</p><p style="color:#888;font-size:12px;margin-top:24px">The Value Sage™ · enquiries@thevaluesage.com</p></div>`,
        })
      } catch (e) {
        console.error('Contact email failed (non-fatal):', e)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
