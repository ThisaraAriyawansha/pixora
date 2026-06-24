'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import styles from '../StaticPage.module.css'
import toolStyles from '@/components/Tool.module.css'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`)
    window.location.href = `mailto:hello@pixora.app?subject=${encodeURIComponent('Pixora contact form')}&body=${body}`
  }

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

          <form onSubmit={handleSubmit} className={toolStyles.controls}>
            <div className={toolStyles.dimField}>
              <label className={toolStyles.dimLabel}>Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={toolStyles.dimInput}
              />
            </div>

            <div className={toolStyles.dimField}>
              <label className={toolStyles.dimLabel}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={toolStyles.dimInput}
              />
            </div>

            <div className={toolStyles.dimField}>
              <label className={toolStyles.dimLabel}>Message</label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={toolStyles.dimInput}
              />
            </div>

            <button type="submit" className={toolStyles.btn}>Send message</button>
          </form>
        </section>
      </main>

      <Footer />
    </>
  )
}
