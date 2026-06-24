import Link from 'next/link'
import Navbar from '@/components/Navbar'
import ImageCompressor from '@/components/ImageCompressor'
import Footer from '@/components/Footer'
import styles from './page.module.css'

const FEATURES = [
  {
    title: 'Privacy first',
    desc: 'Images never leave your device. Every tool runs fully client-side in the browser.',
  },
  {
    title: 'Lightning fast',
    desc: 'No upload, no queue, no waiting on a server. Results appear in seconds.',
  },
  {
    title: 'Free, no limits',
    desc: 'No sign up, no watermarks, no daily caps. Use it as much as you need.',
  },
]

const OTHER_TOOLS = [
  {
    href: '/convert',
    title: 'Convert',
    desc: 'Switch between JPG, PNG and WEBP instantly, right in your browser.',
  },
  {
    href: '/resize',
    title: 'Resize',
    desc: 'Set exact dimensions while keeping the aspect ratio intact.',
  },
]

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
          <div className={styles.heroActions}>
            <a href="#compress" className={styles.heroBtn}>Start compressing</a>
            <Link href="/convert" className={styles.heroBtnOutline}>Explore all tools</Link>
          </div>
        </section>

        {/* Features */}
        <section className={styles.features}>
          <div className={styles.featureGrid}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tools */}
        <div className={styles.tools}>
          <ImageCompressor />
        </div>

        {/* Cross-links to the other tools */}
        <section className={styles.moreTools}>
          <h2 className={styles.moreToolsTitle}>More tools</h2>
          <div className={styles.moreToolsGrid}>
            {OTHER_TOOLS.map((tool) => (
              <Link key={tool.href} href={tool.href} className={styles.toolCard}>
                <h3 className={styles.toolCardTitle}>{tool.title}</h3>
                <p className={styles.toolCardDesc}>{tool.desc}</p>
                <span className={styles.toolCardLink}>Open →</span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
