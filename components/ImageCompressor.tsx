'use client'
import { useState } from 'react'
import imageCompression from 'browser-image-compression'
import styles from './Tool.module.css'

export default function ImageCompressor() {
  const [original, setOriginal] = useState<File | null>(null)
  const [compressed, setCompressed] = useState<Blob | null>(null)
  const [quality, setQuality] = useState(70)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setOriginal(file)
    setCompressed(null)
    setPreview(URL.createObjectURL(file))
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    setOriginal(file)
    setCompressed(null)
    setPreview(URL.createObjectURL(file))
  }

  const compress = async () => {
    if (!original) return
    setLoading(true)
    try {
      const options = {
        maxSizeMB: 10,
        initialQuality: quality / 100,
        useWebWorker: true,
        alwaysKeepResolution: true,
      }
      const result = await imageCompression(original, options)
      setCompressed(result)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const download = () => {
    if (!compressed || !original) return
    const url = URL.createObjectURL(compressed)
    const a = document.createElement('a')
    a.href = url
    a.download = `pixora-compressed-${original.name}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const fmt = (bytes: number) =>
    bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(2)} MB`

  const saved = original && compressed
    ? Math.round(((original.size - compressed.size) / original.size) * 100)
    : null

  return (
    <section className={styles.tool} id="compress">
      <div className={styles.toolHeader}>
        <h2 className={styles.toolTitle}>Compress</h2>
        <p className={styles.toolDesc}>Reduce file size without losing quality.</p>
      </div>

      <div
        className={styles.dropzone}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {preview ? (
          <img src={preview} alt="Preview" className={styles.previewImg} />
        ) : (
          <>
            <span className={styles.dropIcon}>↑</span>
            <p className={styles.dropText}>Drop image here or <label className={styles.fileLabel}>browse<input type="file" accept="image/*" onChange={handleFile} className={styles.fileInput} /></label></p>
          </>
        )}
      </div>

      {original && (
        <div className={styles.controls}>
          <div className={styles.sliderRow}>
            <label className={styles.sliderLabel}>Quality — {quality}%</label>
            <input
              type="range"
              min={10}
              max={100}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className={styles.slider}
            />
          </div>

          <button className={styles.btn} onClick={compress} disabled={loading}>
            {loading ? 'Compressing…' : 'Compress image'}
          </button>
        </div>
      )}

      {compressed && original && (
        <div className={styles.result}>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Original</span>
              <span className={styles.statValue}>{fmt(original.size)}</span>
            </div>
            <div className={styles.statDivider}>→</div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Compressed</span>
              <span className={styles.statValue}>{fmt(compressed.size)}</span>
            </div>
            {saved !== null && (
              <div className={styles.badge}>{saved}% smaller</div>
            )}
          </div>
          <button className={styles.btnOutline} onClick={download}>Download</button>
        </div>
      )}
    </section>
  )
}
