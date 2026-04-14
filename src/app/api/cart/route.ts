import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createSupabaseAdminClient } from '@/lib/supabase'

const VAT = 0.075

// GET — fetch user's cart
export async function GET(req: NextRequest) {
  const { userId } = await auth()
  const sessionId = req.headers.get('x-session-id')

  const supabase = createSupabaseAdminClient()
  const query = supabase.from('cart_items').select('*').order('created_at', { ascending: true })

  if (userId) {
    query.eq('user_id', userId)
  } else if (sessionId) {
    query.eq('session_id', sessionId)
  } else {
    return NextResponse.json({ items: [] })
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })

  return NextResponse.json({ items: data || [] })
}

// POST — add item to cart
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  const sessionId = req.headers.get('x-session-id')
  const { serviceId, serviceName, tierName, price } = await req.json()

  const vat = Math.round(price * VAT)
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from('cart_items')
    .insert({
      user_id: userId || null,
      session_id: userId ? null : sessionId,
      service_id: serviceId,
      service_name: serviceName,
      tier_name: tierName,
      price,
      vat,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 })
  return NextResponse.json({ item: data })
}

// DELETE — remove item from cart
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const itemId = searchParams.get('id')

  if (!itemId) return NextResponse.json({ error: 'Item ID required' }, { status: 400 })

  const supabase = createSupabaseAdminClient()
  await supabase.from('cart_items').delete().eq('id', itemId)

  return NextResponse.json({ success: true })
}
