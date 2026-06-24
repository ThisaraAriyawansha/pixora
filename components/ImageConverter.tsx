'use client'
import { useState } from 'react'
import imageCompression from 'browser-image-compression'
import styles from './Tool.module.css'

const FORMATS = ['image/jpeg', 'image/png', 'image/webp']
const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null)
  const [targetFormat, setTargetFormat] = useState('image/webp')
  const [loading, setLoading] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setResultUrl(null)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (!f) return
    setFile(f)
    setResultUrl(null)
  }

  const convert = async () => {
    if (!file) return
    setLoading(true)
    try {
      const options = {
        fileType: targetFormat,
        initialQuality: 0.9,
        useWebWorker: true,
        alwaysKeepResolution: true,
      }
      const result = await imageCompression(file, options)
      const url = URL.createObjectURL(result)
      setResultUrl(url)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const download = () => {
    if (!resultUrl || !file) return
    const a = document.createElement('a')
    a.href = resultUrl
    const baseName = file.name.replace(/\.[^.]+$/, '')
    a.download = `pixora-${baseName}.${EXT[targetFormat]}`
    a.click()
  }

  return (
    <section className={styles.tool} id="convert">
      <div className={styles.toolHeader}>
        <h2 className={styles.toolTitle}>Convert</h2>
        <p className={styles.toolDesc}>Change image format instantly in your browser.</p>
      </div>

      <div
        className={styles.dropzone}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {file ? (
          <p className={styles.fileName}>{file.name}</p>
        ) : (
          <>
            <span className={styles.dropIcon}>↑</span>
            <p className={styles.dropText}>Drop image here or <label className={styles.fileLabel}>browse<input type="file" accept="image/*" onChange={handleFile} className={styles.fileInput} /></label></p>
          </>
        )}
      </div>

      {file && (
        <div className={styles.controls}>
          <div className={styles.selectRow}>
            <label className={styles.selectLabel}>Convert to</label>
            <select
              value={targetFormat}
              onChange={(e) => setTargetFormat(e.target.value)}
              className={styles.select}
            >
              {FORMATS.map((f) => (
                <option key={f} value={f}>{EXT[f].toUpperCase()}</option>
              ))}
            </select>
          </div>

          <button className={styles.btn} onClick={convert} disabled={loading}>
            {loading ? 'Converting…' : 'Convert image'}
          </button>
        </div>
      )}

      {resultUrl && (
        <div className={styles.result}>
          <img src={resultUrl} alt="Converted" className={styles.resultPreview} />
          <button className={styles.btnOutline} onClick={download}>Download</button>
        </div>
      )}
    </section>
  )
}
