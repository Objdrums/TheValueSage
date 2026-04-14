import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

// Browser client — for use in components and client-side code
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Server/admin client — for API routes and server actions only
// Uses service role key — bypasses RLS — never expose to browser
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// ── TYPE HELPERS ──────────────────────────────────────────────────────────────
export type Invoice = {
  id: string
  invoice_number: string
  user_id?: string
  client_name: string
  client_email: string
  client_phone?: string
  type: 'service' | 'session' | 'cart'
  service_name?: string
  tier_name?: string
  session_date?: string
  session_time?: string
  items: Array<{ desc: string; qty: number; rate: number }>
  subtotal: number
  vat: number
  total: number
  deposit: number
  note?: string
  status: 'pending' | 'deposit_paid' | 'paid' | 'cancelled'
  payment_method?: string
  payment_ref?: string
  created_at: string
}

export type CartItem = {
  id: string
  user_id?: string
  session_id?: string
  service_id: string
  service_name: string
  tier_name: string
  price: number
  vat: number
  created_at: string
}

export type Booking = {
  id: string
  invoice_id?: string
  session_type: string
  format: string
  session_date: string
  session_time: string
  client_name: string
  client_email: string
  client_phone?: string
  notes?: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  created_at: string
}
