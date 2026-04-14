import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createSupabaseAdminClient } from '@/lib/supabase'

const ADMIN_CLERK_IDS = (process.env.ADMIN_CLERK_USER_IDS || '').split(',')

async function requireAdmin() {
  const { userId } = await auth()
  if (!userId || !ADMIN_CLERK_IDS.includes(userId)) {
    return null
  }
  return userId
}

// PATCH — approve/feature a review or send invite
export async function PATCH(req: NextRequest) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action, reviewId, invoiceId, clientEmail } = await req.json()
  const supabase = createSupabaseAdminClient()

  if (action === 'approve') {
    await supabase.from('reviews').update({ is_approved: true }).eq('id', reviewId)
    return NextResponse.json({ success: true })
  }

  if (action === 'feature') {
    await supabase.from('reviews').update({ is_featured: true }).eq('id', reviewId)
    return NextResponse.json({ success: true })
  }

  if (action === 'unfeature') {
    await supabase.from('reviews').update({ is_featured: false }).eq('id', reviewId)
    return NextResponse.json({ success: true })
  }

  if (action === 'send_invite') {
    if (!invoiceId || !clientEmail) {
      return NextResponse.json({ error: 'invoiceId and clientEmail required' }, { status: 400 })
    }

    const { data: invite, error } = await supabase
      .from('review_invitations')
      .insert({ invoice_id: invoiceId, client_email: clientEmail })
      .select()
      .single()

    if (error) return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })

    // Send invite email
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/review?token=${invite.token}`

        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'The Value Sage <onboarding@resend.dev>',
          to: clientEmail,
          subject: 'Share your experience — The Value Sage™',
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#080808;color:#EEECEA">
              <h1 style="color:#FF4D2E;font-size:24px">The Value Sage™</h1>
              <p style="margin-top:24px">Hi there,</p>
              <p style="color:#AAA;line-height:1.75">Your opinion genuinely matters. If you are willing to share your experience working with The Value Sage™, it helps other founders and creatives make informed decisions.</p>
              <p style="color:#AAA;line-height:1.75">This link is personal to you and expires in 14 days.</p>
              <a href="${reviewUrl}" style="display:inline-block;margin-top:24px;background:#FF4D2E;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600">Share Your Experience →</a>
              <p style="color:#444;font-size:11px;margin-top:32px">The Value Sage™ · enquiries@thevaluesage.com</p>
            </div>
          `,
        })
      } catch (e) {
        console.error('Invite email failed:', e)
      }
    }

    return NextResponse.json({ success: true, token: invite.token })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

// GET — admin: fetch all reviews including pending
export async function GET() {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseAdminClient()
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })

  return NextResponse.json({ reviews: data || [] })
}
