import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  // 1. GATEKEEPER: Check if this is a webhook from NOWPayments
  const signature = req.headers.get('x-nowpayments-signature') || req.headers.get('X-NowPayments-Signature')

  if (signature) {
    // ─── WEBHOOK HANDLER LOGIC (Updating the database after payment) ───
    try {
      const body = await req.text()
      // Adding 'as string' to satisfy strict TypeScript rules
      const webhookSecret = process.env.NOWPAYMENTS_WEBHOOK_SECRET as string

      if (!webhookSecret) {
        return NextResponse.json({ error: 'Webhook secret missing' }, { status: 500 })
      }

      const hmac = crypto.createHmac('sha512', webhookSecret).update(body).digest('hex')
      if (hmac !== signature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }

      const event = JSON.parse(body)
      const status = event.payment_status || event.status

      if (status === 'finished' || status === 'successful' || status === 'success') {
        const invoiceId = event.order_id || event.order_id_string || event.external_id
        const supabase = createSupabaseAdminClient()
        await supabase
          .from('invoices')
          .update({
            status: event.payment_type === 'deposit' ? 'deposit_paid' : 'paid',
            payment_method: 'nowpayments',
            crypto_currency: event.payment_currency || event.pay_currency || null,
            payment_ref: event.payment_id || event.id || event.payment_hash || null,
          })
          .eq('id', invoiceId)
      }

      return NextResponse.json({ received: true })
    } catch (err) {
      console.error('Webhook error:', err)
      return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
  }

  // ─── INVOICE CREATION LOGIC (Request from your frontend) ───
  try {
    const { invoiceId, invoiceNumber, amount, name, description, type } = await req.json()

    const apiKey = process.env.NOWPAYMENTS_API_KEY as string
    if (!apiKey) {
      return NextResponse.json({ error: 'NOW Payments not configured' }, { status: 503 })
    }

    const response = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: Number(amount),
        price_currency: 'NGN',
        order_id: invoiceId,
        order_description: description || `${name} · ${type === 'deposit' ? '50% Deposit' : 'Full Payment'}`,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/crypto-success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/invoices`,
        ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/crypto`,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('NOW Payments error:', data)
      return NextResponse.json({ error: 'NOW Payments initialization failed' }, { status: 400 })
    }

    return NextResponse.json({
      hosted_url: data.invoice_url,
      code: data.id,
    })
  } catch (err) {
    console.error('NOW Payments error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}