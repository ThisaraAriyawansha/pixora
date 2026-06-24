import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import ImageResizer from '@/components/ImageResizer'
import Footer from '@/components/Footer'
import styles from '../ToolPage.module.css'

export const metadata: Metadata = {
  title: 'Resize Images Online',
  description: 'Resize images to exact dimensions while keeping the aspect ratio intact — processed entirely in your browser, no uploads.',
  alternates: { canonical: '/resize' },
}

export default function ResizePage() {
  return (
    <>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Pixora</p>
          <h1 className={styles.heroTitle}>Resize images</h1>
          <p className={styles.heroSub}>
            Set exact dimensions while keeping the aspect ratio intact — processed entirely in your browser, no uploads.
          </p>
          <Link href="/" className={styles.back}>← Back to all tools</Link>
        </section>

        <div className={styles.tools}>
          <ImageResizer />
        </div>
      </main>

      <Footer />
    </>
  )
}
