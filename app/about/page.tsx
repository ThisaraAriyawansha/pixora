import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import styles from '../StaticPage.module.css'

export const metadata: Metadata = {
  title: 'About',
  description: 'Pixora is a set of free, privacy-first image tools that run entirely in your browser. Learn why we built it and how it works.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Pixora</p>
          <h1 className={styles.heroTitle}>About</h1>
          <p className={styles.heroSub}>
            Image tools that respect your time, your files, and your privacy.
          </p>
        </section>

        <section className={styles.content}>
          <h2>Why Pixora</h2>
          <p>
            Pixora started as a simple idea: compressing, converting or resizing an image
            shouldn&apos;t require uploading it to a stranger&apos;s server, creating an account,
            or watching an ad. Every tool on this site runs entirely in your browser using the
            same engine the page itself loads with — your images are processed on your device
            and never sent anywhere.
          </p>

          <h2>What you can do here</h2>
          <ul>
            <li><strong>Compress</strong> — shrink file size while keeping visual quality.</li>
            <li><strong>Convert</strong> — switch between JPG, PNG and WEBP instantly.</li>
            <li><strong>Resize</strong> — set exact dimensions while preserving aspect ratio.</li>
          </ul>

          <h2>Who built it</h2>
          <p>
            Pixora is designed and developed by{' '}
            <a href="https://plexcode.vercel.app/" target="_blank" rel="noopener noreferrer">
              PlexCode
            </a>
            . If you run into an issue or have a feature request, the{' '}
            <Link href="/contact">contact page</Link> is the fastest way to reach us.
          </p>
        </section>
      </main>

      <Footer />
    </>
  )
}
