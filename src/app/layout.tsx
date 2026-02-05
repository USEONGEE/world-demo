import type { Metadata, Viewport } from 'next'
import { RootProviders } from '@/providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'World Gate',
  description: 'World MiniApp for Human Verification and Wallet Management',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  )
}
