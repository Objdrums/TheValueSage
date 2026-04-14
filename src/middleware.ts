import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/invoices(.*)',
  '/cart(.*)',
  '/admin(.*)',
])

// Routes that are public (no auth needed)
const isPublicRoute = createRouteMatcher([
  '/',
  '/services(.*)',
  '/portfolio(.*)',
  '/books(.*)',
  '/sessions(.*)',
  '/about(.*)',
  '/contact(.*)',
  '/school(.*)',
  '/newsletter(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',   // payment webhooks — public, verified by signature
  '/api/newsletter(.*)', // newsletter signup — public
  '/api/contact(.*)',    // contact form — public
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
