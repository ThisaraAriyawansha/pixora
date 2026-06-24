import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

const SITE_URL = 'https://pixora-zeta-ten.vercel.app'
const SITE_NAME = 'Pixora'
const DEFAULT_DESCRIPTION = 'Compress, convert and resize images instantly in your browser. Free, no sign up, no uploads — everything runs on your device.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Pixora - Image Tools',
    template: '%s | Pixora',
  },
  description: DEFAULT_DESCRIPTION,
  keywords: ['image compressor', 'compress image online', 'convert image format', 'resize image online', 'jpg to png', 'webp converter', 'free image tools'],
  icons: {
    icon: '/img/favicon.png',
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    url: SITE_URL,
    title: 'Pixora - Image Tools',
    description: DEFAULT_DESCRIPTION,
    images: ['/img/og_img_3.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pixora - Image Tools',
    description: DEFAULT_DESCRIPTION,
    images: ['/img/og_img_3.png'],
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
