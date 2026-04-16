import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import crypto from 'crypto'

// NOW Payments gateway integration
// Sign up at: nowpayments.io
// Supports crypto and multi-currency invoices for direct checkout pages.

export async function POST(req: NextRequest) {
  try {
    const { invoiceId, invoiceNumber, amount, name, description, type } = await req.json()

    const apiKey = process.env.NOWPAYMENTS_API_KEY
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
        ipn_callback_url: `${
          .env.NEXT_PUBLIC_APP_URL}/api/payment/crypto`,
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

// Webhook handler — NOW Payments sends IPN callbacks when payment status changes
export async function PUT(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-nowpayments-signature') || req.headers.get('X-NowPayments-Signature')
  const webhookSecret = process.env.NOWPAYMENTS_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
}
