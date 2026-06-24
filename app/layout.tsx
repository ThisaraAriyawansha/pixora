import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pixora - Image Tools',
  description: 'Compress, convert and resize images instantly in your browser.',
  icons: {
    icon: '/img/favicon.png',
  },
  openGraph: {
    title: 'Pixora - Image Tools',
    description: 'Compress, convert and resize images instantly in your browser.',
    images: ['/img/pixora-resized-og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pixora - Image Tools',
    description: 'Compress, convert and resize images instantly in your browser.',
    images: ['/img/pixora-resized-og.png'],
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
