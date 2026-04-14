import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'The Value Sage™ | Brand & AI Strategist',
  description: 'Obanijesu David Solomon — Brand Identity, Web Design, AI & Automation, Speaking, Books. Rooted in Purpose, Driven by Value.',
  keywords: ['brand strategy', 'AI automation', 'brand identity', 'Nigeria', 'Ibadan'],
  openGraph: {
    title: 'The Value Sage™ | Brand & AI Strategist',
    description: 'Brand identity. Web design. AI & automation. Speaking. Books.',
    url: 'https://thevaluesage.com',
    siteName: 'The Value Sage™',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Value Sage™',
    creator: '@objdrums',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link
            href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap"
            rel="stylesheet"
          />
        </head>
        <body style={{ background: '#080808', color: '#EEECEA', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
