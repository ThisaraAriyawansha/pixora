import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import styles from '../StaticPage.module.css'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'The terms for using Pixora — kept short, because the tools are free.',
  alternates: { canonical: '/terms-conditions' },
}

export default function TermsPage() {
  return (
    <>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Pixora</p>
          <h1 className={styles.heroTitle}>Terms & Conditions</h1>
          <p className={styles.heroSub}>
            The basics of using Pixora — kept short, because the tools are free.
          </p>
        </section>

        <section className={styles.content}>
          <p className={styles.meta}>Last updated: June 2026</p>

          <h2>Using Pixora</h2>
          <p>
            Pixora is provided free of charge for personal and commercial use. By using the site
            you agree to use it responsibly and not to attempt to disrupt, reverse engineer for
            malicious purposes, or abuse the service.
          </p>

          <h2>Your content</h2>
          <p>
            You retain all rights to the images you process with Pixora. Since processing happens
            entirely in your browser, we never receive, store or claim any rights to your files.
          </p>

          <h2>No warranty</h2>
          <p>
            Pixora is provided &quot;as is&quot;, without warranty of any kind. We do our best to
            keep the tools accurate and reliable, but we are not liable for any loss or damage
            arising from the use of this site.
          </p>

          <h2>Changes</h2>
          <p>
            We may update these terms from time to time. Continued use of Pixora after changes
            are posted means you accept the updated terms.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms can be sent to{' '}
            <a href="mailto:hello@pixora.app">hello@pixora.app</a>.
          </p>
        </section>
      </main>

      <Footer />
    </>
  )
}
