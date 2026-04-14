import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'

const VAT_RATE = 0.075
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    const body = await req.json()
    const { type, service, tier, sessionDate, sessionTime, client, items, subtotal, note } = body

    const vat = Math.round(subtotal * VAT_RATE)
    const total = subtotal + vat
    const deposit = Math.round(total * 0.5)
    const invoiceNumber = `TVS-${Date.now().toString().slice(-6)}`
    const today = new Date().toLocaleDateString('en-NG', { day: '2-digit', month: 'long', year: 'numeric' })
    const due = new Date(Date.now() + 72 * 3600000).toLocaleDateString('en-NG', { day: '2-digit', month: 'long', year: 'numeric' })

    // Generate AI note if not provided
    let invoiceNote = note
    if (!invoiceNote) {
      const msg = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 150,
        system: 'You write warm, professional invoice notes for The Value Sage brand studio. 2 sentences max.',
        messages: [{ role: 'user', content: `Write an invoice closing note for: ${service} — ${tier} tier. Client: ${client?.name || 'Client'}.` }],
      })
      invoiceNote = msg.content[0].type === 'text' ? msg.content[0].text : 'We look forward to working with you.'
    }

    const supabase = createSupabaseAdminClient()

    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        user_id: userId || null,
        client_name: client?.name || '',
        client_email: client?.email || '',
        client_phone: client?.phone || null,
        type,
        service_name: service,
        tier_name: tier,
        session_date: sessionDate || null,
        session_time: sessionTime || null,
        items: items || [{ desc: `${service} — ${tier}`, qty: 1, rate: subtotal }],
        subtotal,
        vat,
        total,
        deposit,
        note: invoiceNote,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
    }

    // Send confirmation email via Resend (graceful fallback if not configured)
    if (process.env.RESEND_API_KEY && client?.email) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'The Value Sage <onboarding@resend.dev>',
          to: client.email,
          subject: `Invoice ${invoiceNumber} — The Value Sage™`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">
              <h1 style="font-size:24px;color:#FF4D2E;margin-bottom:4px">The Value Sage™</h1>
              <p style="color:#888;margin-bottom:32px">Invoice ${invoiceNumber}</p>
              <p>Hi ${client.name},</p>
              <p>${invoiceNote}</p>
              <table style="width:100%;border-collapse:collapse;margin:24px 0">
                <tr style="background:#f5f5f5">
                  <td style="padding:10px;font-weight:600">${service} — ${tier}</td>
                  <td style="padding:10px;text-align:right">₦${subtotal.toLocaleString()}</td>
                </tr>
                <tr><td style="padding:8px;color:#666">VAT (7.5%)</td><td style="padding:8px;text-align:right">₦${vat.toLocaleString()}</td></tr>
                <tr style="border-top:2px solid #111"><td style="padding:10px;font-weight:700">Total</td><td style="padding:10px;text-align:right;font-weight:700;color:#FF4D2E;font-size:18px">₦${total.toLocaleString()}</td></tr>
                <tr><td style="padding:8px;color:#FF4D2E">50% Deposit to begin</td><td style="padding:8px;text-align:right;color:#FF4D2E">₦${deposit.toLocaleString()}</td></tr>
              </table>
              <p style="margin-top:24px;color:#666">Payment details will follow within 2 hours. Questions? Reply to this email.</p>
              <p style="color:#aaa;font-size:12px;margin-top:32px">The Value Sage™ · enquiries@thevaluesage.com · Ibadan, Nigeria</p>
            </div>
          `,
        })
      } catch (emailErr) {
        console.error('Email send failed (non-fatal):', emailErr)
      }
    }

    return NextResponse.json({
      invoice: {
        ...invoice,
        date: today,
        due,
      },
    })
  } catch (err) {
    console.error('Invoice API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET — list invoices for current user
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createSupabaseAdminClient()

    // Get user's email from Clerk, then match invoices
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })

    return NextResponse.json({ invoices: data })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
