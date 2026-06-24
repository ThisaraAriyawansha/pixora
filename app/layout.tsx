import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pixora — Image Tools',
  description: 'Compress, convert and resize images instantly in your browser.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
