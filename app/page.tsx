import Navbar from '@/components/Navbar'
import ImageCompressor from '@/components/ImageCompressor'
import ImageConverter from '@/components/ImageConverter'
import ImageResizer from '@/components/ImageResizer'
import styles from './page.module.css'

export default function Home() {
  return (
    <>
      <Navbar />

      <main className={styles.main}>
        {/* Hero */}
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Image tools for the web</p>
          <h1 className={styles.heroTitle}>Pixora</h1>
          <p className={styles.heroSub}>
            Compress. Convert. Resize. Everything runs in your browser — no uploads, no servers, no limits.
          </p>
          <div className={styles.heroBadges}>
            <span className={styles.heroBadge}>100% free</span>
            <span className={styles.heroBadge}>No sign up</span>
            <span className={styles.heroBadge}>Privacy first</span>
          </div>
        </section>

        {/* Tools */}
        <div className={styles.tools}>
          <ImageCompressor />
          <ImageConverter />
          <ImageResizer />
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} Pixora — all processing happens locally in your browser.</p>
      </footer>
    </>
  )
}
