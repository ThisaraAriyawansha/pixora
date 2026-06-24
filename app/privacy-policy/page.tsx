import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import styles from '../StaticPage.module.css'

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Pixora</p>
          <h1 className={styles.heroTitle}>Privacy Policy</h1>
          <p className={styles.heroSub}>
            What we do — and don&apos;t do — with your images and your data.
          </p>
        </section>

        <section className={styles.content}>
          <p className={styles.meta}>Last updated: June 2026</p>

          <h2>Your images stay on your device</h2>
          <p>
            Pixora&apos;s compress, convert and resize tools run entirely client-side, in your
            browser. When you drop or select an image, it is never uploaded to a server — it is
            read, processed and downloaded locally on your own device. We have no access to the
            images you process and do not store them anywhere.
          </p>

          <h2>Analytics</h2>
          <p>
            We use basic, privacy-conscious analytics (such as anonymized page-view counts) to
            understand how the site is used and to improve it. This data does not include the
            images you process and cannot be used to identify you personally.
          </p>

          <h2>Cookies</h2>
          <p>
            Pixora may use a small number of cookies or similar local storage strictly to support
            the analytics described above. No advertising or cross-site tracking cookies are used.
          </p>

          <h2>Contact us</h2>
          <p>
            Questions about this policy can be sent to{' '}
            <a href="mailto:hello@pixora.app">hello@pixora.app</a>.
          </p>
        </section>
      </main>

      <Footer />
    </>
  )
}
