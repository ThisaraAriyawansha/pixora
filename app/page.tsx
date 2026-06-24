import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import ImageCompressor from '@/components/ImageCompressor'
import Footer from '@/components/Footer'
import styles from './page.module.css'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

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

const OUR_TOOLS = [
  {
    href: 'https://infinitysub.vercel.app/',
    logo: '/img/InfinitySub.png',
    title: 'InfinitySub',
    tag: 'Subtitle Translator',
    desc: 'Translate subtitle files into dozens of languages in seconds, free and online.',
  },
]

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pixora',
    url: 'https://pixora-zeta-ten.vercel.app',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: 'Compress, convert and resize images instantly in your browser. Free, no sign up, no uploads.',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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

        {/* Our other tools */}
        <section className={styles.ourTools}>
          <h2 className={styles.ourToolsTitle}>Our Tools</h2>
          <p className={styles.ourToolsSub}>Other free tools built by the PlexCode team.</p>
          <div className={styles.ourToolsGrid}>
            {OUR_TOOLS.map((tool) => (
              <a
                key={tool.href}
                href={tool.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ourToolCard}
              >
                <Image
                  src={tool.logo}
                  alt={`${tool.title} logo`}
                  width={56}
                  height={56}
                  className={styles.ourToolLogo}
                />
                <div className={styles.ourToolInfo}>
                  <h3 className={styles.ourToolTitle}>{tool.title}</h3>
                  <p className={styles.ourToolTag}>{tool.tag}</p>
                  <p className={styles.ourToolDesc}>{tool.desc}</p>
                </div>
                <span className={styles.ourToolLink}>Visit →</span>
              </a>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
