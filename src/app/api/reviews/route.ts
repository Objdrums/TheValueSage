import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createSupabaseAdminClient } from '@/lib/supabase'

// GET — public: fetch approved reviews
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const featured = searchParams.get('featured') === 'true'

  const supabase = createSupabaseAdminClient()
  let query = supabase
    .from('reviews')
    .select('id, client_name, client_role, service_name, rating, body, is_featured, created_at')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  if (featured) query = query.eq('is_featured', true)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })

  return NextResponse.json({ reviews: data || [] })
}

// POST — submit a review (requires invoice ownership OR invite token)
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  const { clientName, clientRole, serviceName, rating, body, inviteToken, invoiceId } = await req.json()

  if (!clientName || !serviceName || !rating || !body) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be 1–5' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()

  // Verify invite token if provided
  if (inviteToken) {
    const { data: invite } = await supabase
      .from('review_invitations')
      .select('*')
      .eq('token', inviteToken)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (!invite) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 403 })
    }

    // Mark invite as used
    await supabase.from('review_invitations').update({ used: true }).eq('token', inviteToken)
  } else if (!userId || !invoiceId) {
    return NextResponse.json({ error: 'Verified customer access required' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      user_id: userId || null,
      invoice_id: invoiceId || null,
      client_name: clientName,
      client_role: clientRole || null,
      service_name: serviceName,
      rating,
      body,
      is_approved: false, // Admin approves before showing
      invite_token: inviteToken || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })

  return NextResponse.json({
    success: true,
    message: 'Review submitted. It will appear after approval.',
    review: data,
  })
}
