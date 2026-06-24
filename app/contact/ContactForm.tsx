'use client'
import { useState } from 'react'
import toolStyles from '@/components/Tool.module.css'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`)
    window.location.href = `mailto:hello@pixora.app?subject=${encodeURIComponent('Pixora contact form')}&body=${body}`
  }

  return (
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
  )
}
