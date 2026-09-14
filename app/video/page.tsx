import type { Metadata } from 'next'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import styles from '../ToolPage.module.css'

const VideoCompressor = dynamic(() => import('@/components/VideoCompressor'), { ssr: false })

export const metadata: Metadata = {
  title: 'Compress Video — MP4',
  description: 'Compress videos to MP4 instantly in your browser. Free, no sign up, no uploads.',
  alternates: { canonical: '/video' },
}

export default function VideoPage() {
  return (
    <>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Pixora</p>
          <h1 className={styles.heroTitle}>Compress video</h1>
          <p className={styles.heroSub}>
            Shrink video file size instantly — processed entirely in your browser, no uploads.
          </p>
          <Link href="/" className={styles.back}>← Back to all tools</Link>
        </section>

        <div className={styles.tools}>
          <VideoCompressor />
        </div>
      </main>

      <Footer />
    </>
  )
}
