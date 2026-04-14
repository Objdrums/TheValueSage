import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'

// Initialize Paystack payment for an invoice
// Works with test keys now — swap to live key when account approved
export async function POST(req: NextRequest) {
  try {
    const { invoiceId, invoiceNumber, amount, email, name, type } = await req.json()

    if (!invoiceId || !amount || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ error: 'Payment not configured' }, { status: 503 })
    }

    // Amount in kobo (Paystack uses smallest currency unit)
    const amountKobo = amount * 100

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amountKobo,
        currency: 'NGN',
        reference: `${invoiceNumber}-${type === 'deposit' ? 'dep' : 'full'}-${Date.now()}`,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/verify`,
        metadata: {
          invoice_id: invoiceId,
          invoice_number: invoiceNumber,
          client_name: name,
          payment_type: type, // 'deposit' or 'full'
          custom_fields: [
            { display_name: 'Invoice', variable_name: 'invoice_number', value: invoiceNumber },
            { display_name: 'Payment Type', variable_name: 'payment_type', value: type },
          ],
        },
      }),
    })

    const data = await response.json()

    if (!data.status) {
      console.error('Paystack error:', data)
      return NextResponse.json({ error: data.message || 'Payment initialization failed' }, { status: 400 })
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
      access_code: data.data.access_code,
    })
  } catch (err) {
    console.error('Payment init error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Verify Paystack payment after redirect
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const reference = searchParams.get('reference')

  if (!reference) {
    return NextResponse.json({ error: 'No reference provided' }, { status: 400 })
  }

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    })

    const data = await response.json()

    if (!data.status || data.data.status !== 'success') {
      return NextResponse.json({ success: false, message: 'Payment not successful' })
    }

    const { invoice_id, payment_type } = data.data.metadata

    // Update invoice status in Supabase
    const supabase = createSupabaseAdminClient()
    await supabase
      .from('invoices')
      .update({
        status: payment_type === 'deposit' ? 'deposit_paid' : 'paid',
        payment_method: 'paystack',
        payment_ref: reference,
      })
      .eq('id', invoice_id)

    return NextResponse.json({
      success: true,
      invoice_id,
      payment_type,
      amount: data.data.amount / 100,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
