import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { name, email } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const supabase = createSupabaseAdminClient()

    const { error } = await supabase
      .from('subscribers')
      .upsert({ name, email, status: 'active' }, { onConflict: 'email' })

    if (error) {
      console.error('Subscriber insert error:', error)
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
    }

    // Send welcome email if Resend is configured
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'The Value Sage <onboarding@resend.dev>',
          to: email,
          subject: 'You are in — The Value Sage Newsletter',
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#080808;color:#EEECEA">
              <h1 style="font-size:28px;font-weight:800;color:#FF4D2E;margin-bottom:4px">The Value Sage™</h1>
              <p style="color:#666;margin-bottom:32px;font-size:12px;letter-spacing:0.15em">NEWSLETTER</p>
              <p style="font-size:16px;line-height:1.7">Hi ${name || 'there'},</p>
              <p style="font-size:15px;line-height:1.75;color:#AAA">You are in. Expect brand strategy, AI insights, finance thinking, and music theory — all at the intersection of what I actually work at.</p>
              <p style="font-size:15px;line-height:1.75;color:#AAA">No algorithm decides if you see it. No noise. Just value, directly to you.</p>
              <p style="margin-top:32px;font-size:14px;color:#666">Rooted in Purpose, Driven by Value.<br/>— Obanijesu David Solomon, The Value Sage™</p>
              <p style="color:#444;font-size:11px;margin-top:32px">enquiries@thevaluesage.com · Ibadan, Nigeria</p>
            </div>
          `,
        })
      } catch (emailErr) {
        console.error('Welcome email failed (non-fatal):', emailErr)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
