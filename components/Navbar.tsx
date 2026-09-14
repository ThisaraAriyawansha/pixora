'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Navbar.module.css'

const LINKS = [
  { href: '/', label: 'Compress' },
  { href: '/convert', label: 'Convert' },
  { href: '/resize', label: 'Resize' },
  { href: '/video', label: 'Video' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.logo}>Pixora</Link>

      <ul className={styles.links}>
        {LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={pathname === link.href ? styles.linkActive : undefined}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className={styles.menuBtn}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className={isOpen ? styles.iconOpen : undefined} />
      </button>

      <div className={`${styles.mobileMenu} ${isOpen ? styles.mobileMenuOpen : ''}`}>
        <ul>
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={pathname === link.href ? styles.linkActive : undefined}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
