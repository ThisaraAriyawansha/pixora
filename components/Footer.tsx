'use client'
import { useState } from 'react'
import Link from 'next/link'
import styles from './Footer.module.css'

const LEFT_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms-conditions', label: 'Terms & Conditions' },
]

const RIGHT_LINKS = [
  { href: '/contact', label: 'Contact' },
  { href: '/support', label: 'Support' },
]

export default function Footer() {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.brandRow}>
        <span className={styles.line} />
        <div className={styles.brand}>
          <span className={styles.logo}>Pixora</span>
          <span className={styles.tagline}>Image Tools</span>
        </div>
        <span className={styles.line} />
      </div>

      <div className={styles.columns}>
        <ul className={styles.linkList}>
          {LEFT_LINKS.map((link) => (
            <li key={link.label}><Link href={link.href}>{link.label}</Link></li>
          ))}
        </ul>

        <div className={styles.center}>
          <div className={styles.socials}>
            <a href="#" aria-label="Twitter" className={styles.socialIcon}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 4.5c-.85.38-1.76.63-2.72.75a4.7 4.7 0 0 0 2.06-2.6 9.4 9.4 0 0 1-2.98 1.14 4.68 4.68 0 0 0-7.97 4.27A13.28 13.28 0 0 1 1.64 3.16a4.66 4.66 0 0 0 1.45 6.24 4.65 4.65 0 0 1-2.12-.59 4.68 4.68 0 0 0 3.75 4.62 4.68 4.68 0 0 1-2.11.08 4.68 4.68 0 0 0 4.37 3.25A9.4 9.4 0 0 1 .5 18.58a13.25 13.25 0 0 0 7.18 2.1c8.6 0 13.31-7.13 13.31-13.32 0-.2 0-.41-.02-.61A9.6 9.6 0 0 0 23 4.5z"/></svg>
            </a>
            <a href="#" aria-label="GitHub" className={styles.socialIcon}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.13-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.58.24 2.75.12 3.04.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.4-5.25 5.68.42.36.78 1.08.78 2.18 0 1.58-.01 2.85-.01 3.24 0 .31.21.66.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>
            </a>
            <a href="#" aria-label="Instagram" className={styles.socialIcon}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zm0 5.38a4.46 4.46 0 1 0 0 8.92 4.46 4.46 0 0 0 0-8.92zm0 7.36a2.9 2.9 0 1 1 0-5.8 2.9 2.9 0 0 1 0 5.8zm5.68-7.54a1.04 1.04 0 1 1-2.08 0 1.04 1.04 0 0 1 2.08 0z"/></svg>
            </a>
          </div>

          <span className={styles.divider} />

          <h3 className={styles.newsletterTitle}>Weekly Newsletter</h3>
          <form className={styles.newsletterForm} onSubmit={handleSubscribe}>
            <input
              type="email"
              required
              placeholder="name@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.newsletterInput}
            />
            <button type="submit" className={styles.newsletterBtn}>Subscribe</button>
          </form>
        </div>

        <ul className={styles.linkList}>
          {RIGHT_LINKS.map((link) => (
            <li key={link.label}><Link href={link.href}>{link.label}</Link></li>
          ))}
        </ul>
      </div>

      <p className={styles.copyright}>© {new Date().getFullYear()}</p>

      <p className={styles.credit}>
        Design and developed by{' '}
        <a href="https://plexcode.vercel.app/" target="_blank" rel="noopener noreferrer">
          PlexCode
        </a>
      </p>
    </footer>
  )
}
