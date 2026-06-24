import Link from 'next/link'
import Navbar from '@/components/Navbar'
import ImageConverter from '@/components/ImageConverter'
import Footer from '@/components/Footer'
import styles from '../ToolPage.module.css'

export default function ConvertPage() {
  return (
    <>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Pixora</p>
          <h1 className={styles.heroTitle}>Convert images</h1>
          <p className={styles.heroSub}>
            Switch between JPG, PNG and WEBP instantly — processed entirely in your browser, no uploads.
          </p>
          <Link href="/" className={styles.back}>← Back to all tools</Link>
        </section>

        <div className={styles.tools}>
          <ImageConverter />
        </div>
      </main>

      <Footer />
    </>
  )
}
