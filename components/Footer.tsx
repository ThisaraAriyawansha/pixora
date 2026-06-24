import styles from './Footer.module.css'

export default function Footer() {
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

      <p className={styles.copyright}>© {new Date().getFullYear()} Pixora — all processing happens locally in your browser.</p>

      <p className={styles.credit}>
        Design and developed by{' '}
        <a href="https://plexcode.vercel.app/" target="_blank" rel="noopener noreferrer">
          PlexCode
        </a>
      </p>
    </footer>
  )
}
