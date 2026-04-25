import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import crypto from 'crypto'

// NOWPayments — crypto payments without work email or KYC
// Sign up at: nowpayments.io
// Supports: USDT, BTC, ETH, BNB, USDC, and 300+ coins
// Nigerian-friendly, no business verification for basic use

const NP_BASE = 'https://api.nowpayments.io/v1'

// POST — create a crypto payment for an invoice
export async function POST(req: NextRequest) {
  try {
    const { invoiceId, invoiceNumber, amount, email, description, type, preferredCurrency } = await req.json()

    const apiKey = process.env.NOWPAYMENTS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Crypto payments not configured. Add NOWPAYMENTS_API_KEY to environment variables.' }, { status: 503 })
    }

    if (!invoiceId || !amount || !email) {
      return NextResponse.json({ error: 'invoiceId, amount, and email are required' }, { status: 400 })
    }

    // First, check NOWPayments is available
    const statusRes = await fetch(`${NP_BASE}/status`, {
      headers: { 'x-api-key': apiKey },
    })
    if (!statusRes.ok) {
      return NextResponse.json({ error: 'NOWPayments service unavailable' }, { status: 503 })
    }

    // Create an invoice on NOWPayments
    const npRes = await fetch(`${NP_BASE}/invoice`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: 'ngn',                     // Pay in NGN equivalent
        pay_currency: preferredCurrency || 'usdttrc20', // Default: USDT on TRON (lowest fees)
        order_id: invoiceNumber,
        order_description: description || `The Value Sage™ — ${invoiceNumber} (${type === 'deposit' ? '50% Deposit' : 'Full Payment'})`,
        ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/nowpayments`,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?invoice=${invoiceId}&method=crypto`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders`,
        is_fixed_rate: true,                        // Lock the rate at creation time
        is_fee_paid_by_user: false,                 // You absorb the fee
      }),
    })

    const npData = await npRes.json()

    if (!npRes.ok || !npData.invoice_url) {
      console.error('NOWPayments error:', npData)
      return NextResponse.json({
        error: npData.message || 'Failed to create crypto payment',
        details: npData,
      }, { status: 400 })
    }

    return NextResponse.json({
      invoice_url: npData.invoice_url,     // Redirect user here to pay
      payment_id: npData.id,
      pay_currency: npData.pay_currency,
      pay_amount: npData.pay_amount,
      price_amount: npData.price_amount,
      price_currency: npData.price_currency,
    })
  } catch (err) {
    console.error('NOWPayments POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT — webhook handler for payment status updates from NOWPayments
// NOWPayments sends IPN (Instant Payment Notification) to this endpoint
export async function PUT(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-nowpayments-sig')
    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET

    // Verify signature if IPN secret is configured
    if (ipnSecret && signature) {
      const sorted = JSON.stringify(
        Object.fromEntries(
          Object.entries(JSON.parse(body)).sort(([a], [b]) => a.localeCompare(b))
        )
      )
      const expected = crypto.createHmac('sha512', ipnSecret).update(sorted).digest('hex')
      if (expected !== signature) {
        console.error('NOWPayments IPN signature mismatch')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const event = JSON.parse(body)
    console.log('NOWPayments IPN:', event.payment_status, 'Order:', event.order_id)

    // Payment status flow: waiting → confirming → confirmed → finished
    // Update invoice when payment is confirmed or finished
    if (event.payment_status === 'confirmed' || event.payment_status === 'finished') {
      const supabase = createSupabaseAdminClient()

      // Find invoice by invoice_number (order_id)
      const { data: invoice } = await supabase
        .from('invoices')
        .select('id, subtotal')
        .eq('invoice_number', event.order_id)
        .single()

      if (invoice) {
        // Determine if this was a deposit or full payment based on amount
        const isDeposit = parseFloat(event.price_amount) < invoice.subtotal * 0.9
        await supabase
          .from('invoices')
          .update({
            status: isDeposit ? 'deposit_paid' : 'paid',
            payment_method: 'crypto',
            crypto_currency: event.pay_currency,
            payment_ref: event.payment_id?.toString(),
          })
          .eq('id', invoice.id)

        console.log(`Invoice ${event.order_id} updated to ${isDeposit ? 'deposit_paid' : 'paid'}`)
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('NOWPayments IPN error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// GET — get supported currencies list (useful for letting clients choose their coin)
export async function GET() {
  try {
    const apiKey = process.env.NOWPAYMENTS_API_KEY
    if (!apiKey) return NextResponse.json({ currencies: [] })

    const res = await fetch(`${NP_BASE}/currencies?fixed_rate=true`, {
      headers: { 'x-api-key': apiKey },
    })
    const data = await res.json()

    // Return only the most common / useful currencies
    const preferred = ['usdttrc20', 'usdterc20', 'usdcbsc', 'btc', 'eth', 'bnbbsc', 'ltc']
    const all: string[] = data.currencies || []
    const sorted = [
      ...preferred.filter(c => all.includes(c)),
      ...all.filter(c => !preferred.includes(c)).slice(0, 20),
    ]

    return NextResponse.json({ currencies: sorted })
  } catch (err) {
    return NextResponse.json({ currencies: [] })
  }
}
