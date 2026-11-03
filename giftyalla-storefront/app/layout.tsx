import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { SITE } from '@/lib/config'
import './globals.css'

// Self-hosted at build time: no request to Google when the page loads, no layout shift.
const font = Plus_Jakarta_Sans({ subsets: ['latin'], display: 'swap', variable: '--font' })

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name}: ${SITE.tagline}`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  openGraph: { siteName: SITE.name, type: 'website' }
}
export const viewport: Viewport = { themeColor: '#6C3BF5' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={font.variable}>
      <body>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <a className="wa-fab" href={`https://wa.me/${SITE.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">💬</a>
      </body>
    </html>
  )
}
