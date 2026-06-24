'use client'
import { useState } from 'react'
import imageCompression from 'browser-image-compression'
import styles from './Tool.module.css'
import { formatBytes, getImageDimensions, labelFromType, validateImageFile } from '@/lib/imageUtils'

type Dimensions = { width: number; height: number }

export default function ImageCompressor() {
  const [original, setOriginal] = useState<File | null>(null)
  const [compressed, setCompressed] = useState<Blob | null>(null)
  const [dimensions, setDimensions] = useState<Dimensions | null>(null)
  const [quality, setQuality] = useState(70)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [resultPreview, setResultPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const loadFile = async (file: File) => {
    const validationError = validateImageFile(file)
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    setOriginal(file)
    setCompressed(null)
    setResultPreview(null)
    setPreview(URL.createObjectURL(file))
    try {
      setDimensions(await getImageDimensions(file))
    } catch {
      setDimensions(null)
    }
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) loadFile(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) loadFile(file)
  }

  const reset = () => {
    setOriginal(null)
    setCompressed(null)
    setDimensions(null)
    setPreview(null)
    setResultPreview(null)
    setError(null)
  }

  const compress = async () => {
    if (!original) return
    setLoading(true)
    setError(null)
    try {
      const options = {
        maxSizeMB: 10,
        initialQuality: quality / 100,
        useWebWorker: true,
        alwaysKeepResolution: true,
      }
      const result = await imageCompression(original, options)
      setCompressed(result)
      setResultPreview(URL.createObjectURL(result))
    } catch (err) {
      console.error(err)
      setError('Something went wrong while compressing this image. Please try again.')
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
        className={`${styles.dropzone} ${isDragOver ? styles.dropzoneActive : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
      >
        {preview ? (
          <div className={styles.dropzoneInner}>
            <button className={styles.removeBtn} onClick={reset} aria-label="Remove image" type="button">×</button>
            <img src={preview} alt="Preview" className={styles.previewImg} />
            <div className={styles.fileMeta}>
              <span className={styles.fileMetaTag}>{labelFromType(original!.type)}</span>
              <span className={styles.fileMetaTag}>{formatBytes(original!.size)}</span>
              {dimensions && <span className={styles.fileMetaTag}>{dimensions.width} × {dimensions.height} px</span>}
            </div>
          </div>
        ) : (
          <>
            <span className={styles.dropIcon}>↑</span>
            <p className={styles.dropText}>Drop image here or <label className={styles.fileLabel}>browse<input type="file" accept="image/*" onChange={handleFile} className={styles.fileInput} /></label></p>
            <p className={styles.hint}>JPG, PNG, WEBP, GIF or AVIF — up to 25 MB</p>
          </>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

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
            <p className={styles.hint}>Lower quality means a smaller file. 70% is a good balance for most photos.</p>
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
              <span className={styles.statValue}>{formatBytes(original.size)}</span>
            </div>
            <div className={styles.statDivider}>→</div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Compressed</span>
              <span className={styles.statValue}>{formatBytes(compressed.size)}</span>
            </div>
            {saved !== null && (
              <div className={styles.badge}>{saved}% smaller</div>
            )}
          </div>

          <div className={styles.compare}>
            <div className={styles.compareCol}>
              <span className={styles.compareLabel}>Before</span>
              <img src={preview!} alt="Original" className={styles.resultPreview} />
            </div>
            <div className={styles.compareCol}>
              <span className={styles.compareLabel}>After</span>
              <img src={resultPreview!} alt="Compressed" className={styles.resultPreview} />
            </div>
          </div>

          <button className={styles.btnOutline} onClick={download}>Download</button>
        </div>
      )}
    </section>
  )
}
