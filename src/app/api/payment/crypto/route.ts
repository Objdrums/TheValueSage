import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import crypto from 'crypto'

// Coinbase Commerce — works with Gmail, no KYC, supports BTC/ETH/USDT/USDC
// Sign up at: commerce.coinbase.com
// Accepted in Nigeria, popular with tech-forward clients

export async function POST(req: NextRequest) {
  try {
    const { invoiceId, invoiceNumber, amount, name, description, type } = await req.json()

    const apiKey = process.env.COINBASE_COMMERCE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Crypto payments not configured' }, { status: 503 })
    }

    // Create a Coinbase Commerce charge
    const response = await fetch('https://api.commerce.coinbase.com/charges', {
      method: 'POST',
      headers: {
        'X-CC-Api-Key': apiKey,
        'X-CC-Version': '2018-03-22',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `The Value Sage™ — ${invoiceNumber}`,
        description: description || `${name} · ${type === 'deposit' ? '50% Deposit' : 'Full Payment'}`,
        local_price: {
          amount: amount.toString(),
          currency: 'NGN',
        },
        pricing_type: 'fixed_price',
        metadata: {
          invoice_id: invoiceId,
          invoice_number: invoiceNumber,
          payment_type: type,
          client_name: name,
        },
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/crypto-success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/invoices`,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Coinbase Commerce error:', data)
      return NextResponse.json({ error: 'Crypto payment initialization failed' }, { status: 400 })
    }

    return NextResponse.json({
      hosted_url: data.data.hosted_url,
      code: data.data.code,
      // Supported currencies shown on Coinbase hosted page:
      // Bitcoin (BTC), Ethereum (ETH), USDC, USDT, DAI, and more
    })
  } catch (err) {
    console.error('Crypto payment error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Webhook handler — Coinbase Commerce sends events when payment status changes
export async function PUT(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-cc-webhook-signature')
  const webhookSecret = process.env.COINBASE_COMMERCE_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify webhook signature
  const hmac = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex')
  if (hmac !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(body)

  if (event.event.type === 'charge:confirmed') {
    const { invoice_id, payment_type } = event.event.data.metadata
    const supabase = createSupabaseAdminClient()
    await supabase
      .from('invoices')
      .update({
        status: payment_type === 'deposit' ? 'deposit_paid' : 'paid',
        payment_method: 'crypto',
        crypto_currency: event.event.data.payments?.[0]?.net?.crypto?.currency,
        payment_ref: event.event.data.code,
      })
      .eq('id', invoice_id)
  }

  return NextResponse.json({ received: true })
}
