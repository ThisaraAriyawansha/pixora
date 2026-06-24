import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ContactForm from './ContactForm'
import styles from '../StaticPage.module.css'

export const metadata: Metadata = {
  title: 'Contact',
  description: "Got a question, bug report or feature idea about Pixora? Get in touch with the team.",
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Pixora</p>
          <h1 className={styles.heroTitle}>Contact</h1>
          <p className={styles.heroSub}>
            Got a question, bug report or feature idea? We&apos;d like to hear it.
          </p>
        </section>

        <section className={styles.content}>
          <p>
            Email us directly at{' '}
            <a href="mailto:hello@pixora.app">hello@pixora.app</a>, or use the form below — it
            will open your email client with everything filled in.
          </p>

          <ContactForm />
        </section>
      </main>

      <Footer />
    </>
  )
}
