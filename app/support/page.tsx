import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import styles from '../StaticPage.module.css'

const FAQS = [
  {
    q: 'Is Pixora really free?',
    a: 'Yes. Compress, Convert and Resize are free to use with no sign up, no watermarks and no daily limits.',
  },
  {
    q: 'Do my images get uploaded anywhere?',
    a: 'No. Every tool processes images locally in your browser. Your files never leave your device. See the Privacy Policy for details.',
  },
  {
    q: 'What file types are supported?',
    a: 'JPG, PNG, WEBP, GIF and AVIF, up to 25 MB per file.',
  },
  {
    q: 'Why did my image fail to process?',
    a: 'This usually means the file is corrupted, too large, or not one of the supported formats. Try re-exporting the image and uploading it again.',
  },
  {
    q: 'Can I use Pixora on my phone?',
    a: 'Yes, the site is fully responsive and works on mobile browsers as well as desktop.',
  },
]

export default function SupportPage() {
  return (
    <>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Pixora</p>
          <h1 className={styles.heroTitle}>Support</h1>
          <p className={styles.heroSub}>
            Answers to common questions. Still stuck? <Link href="/contact">Get in touch</Link>.
          </p>
        </section>

        <section className={styles.content}>
          {FAQS.map((item) => (
            <div key={item.q}>
              <h2>{item.q}</h2>
              <p>{item.a}</p>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </>
  )
}
