'use client'
import { useState } from 'react'
import imageCompression from 'browser-image-compression'
import styles from './Tool.module.css'

export default function ImageResizer() {
  const [file, setFile] = useState<File | null>(null)
  const [maxWidth, setMaxWidth] = useState(1280)
  const [maxHeight, setMaxHeight] = useState(720)
  const [loading, setLoading] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setResultUrl(null)
    setResultBlob(null)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (!f) return
    setFile(f)
    setResultUrl(null)
    setResultBlob(null)
  }

  const resize = async () => {
    if (!file) return
    setLoading(true)
    try {
      const options = {
        maxWidthOrHeight: Math.max(maxWidth, maxHeight),
        useWebWorker: true,
        initialQuality: 1,
      }
      const result = await imageCompression(file, options)
      const url = URL.createObjectURL(result)
      setResultUrl(url)
      setResultBlob(result)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const download = () => {
    if (!resultUrl || !file) return
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = `pixora-resized-${file.name}`
    a.click()
  }

  return (
    <section className={styles.tool} id="resize">
      <div className={styles.toolHeader}>
        <h2 className={styles.toolTitle}>Resize</h2>
        <p className={styles.toolDesc}>Set exact dimensions while preserving aspect ratio.</p>
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
          <div className={styles.dimensionRow}>
            <div className={styles.dimField}>
              <label className={styles.dimLabel}>Max width (px)</label>
              <input
                type="number"
                value={maxWidth}
                min={1}
                max={8000}
                onChange={(e) => setMaxWidth(Number(e.target.value))}
                className={styles.dimInput}
              />
            </div>
            <span className={styles.dimX}>×</span>
            <div className={styles.dimField}>
              <label className={styles.dimLabel}>Max height (px)</label>
              <input
                type="number"
                value={maxHeight}
                min={1}
                max={8000}
                onChange={(e) => setMaxHeight(Number(e.target.value))}
                className={styles.dimInput}
              />
            </div>
          </div>

          <p className={styles.dimNote}>Aspect ratio is preserved automatically.</p>

          <button className={styles.btn} onClick={resize} disabled={loading}>
            {loading ? 'Resizing…' : 'Resize image'}
          </button>
        </div>
      )}

      {resultUrl && (
        <div className={styles.result}>
          <img src={resultUrl} alt="Resized" className={styles.resultPreview} />
          <button className={styles.btnOutline} onClick={download}>Download</button>
        </div>
      )}
    </section>
  )
}
