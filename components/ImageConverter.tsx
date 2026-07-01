'use client'
import { useRef, useState } from 'react'
import imageCompression from 'browser-image-compression'
import styles from './Tool.module.css'
import { extFromType, formatBytes, getImageDimensions, labelFromType, validateImageFile } from '@/lib/imageUtils'

const FORMATS = ['image/jpeg', 'image/png', 'image/webp']
type Dimensions = { width: number; height: number }

export default function ImageConverter() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState<Dimensions | null>(null)
  const [targetFormat, setTargetFormat] = useState('image/webp')
  const [loading, setLoading] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const loadFile = async (f: File) => {
    const validationError = validateImageFile(f)
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResultUrl(null)
    setResultBlob(null)
    try {
      setDimensions(await getImageDimensions(f))
    } catch {
      setDimensions(null)
    }
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) loadFile(f)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) loadFile(f)
  }

  const reset = () => {
    setFile(null)
    setPreview(null)
    setDimensions(null)
    setResultUrl(null)
    setResultBlob(null)
    setError(null)
  }

  const convert = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const options = {
        fileType: targetFormat,
        initialQuality: 0.9,
        useWebWorker: true,
        alwaysKeepResolution: true,
      }
      const result = await imageCompression(file, options)
      setResultUrl(URL.createObjectURL(result))
      setResultBlob(result)
    } catch (err) {
      console.error(err)
      setError('Something went wrong while converting this image. Please try again.')
    }
    setLoading(false)
  }

  const download = () => {
    if (!resultUrl || !file) return
    const a = document.createElement('a')
    a.href = resultUrl
    const baseName = file.name.replace(/\.[^.]+$/, '')
    a.download = `pixora-${baseName}.${extFromType(targetFormat)}`
    a.click()
  }

  return (
    <section className={styles.tool} id="convert">
      <div className={styles.toolHeader}>
        <h2 className={styles.toolTitle}>Convert</h2>
        <p className={styles.toolDesc}>Change image format instantly in your browser.</p>
      </div>

      <div
        className={`${styles.dropzone} ${isDragOver ? styles.dropzoneActive : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => {
          if (!file) fileInputRef.current?.click()
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className={styles.fileInput}
        />
        {file ? (
          <div className={styles.dropzoneInner}>
            <button className={styles.removeBtn} onClick={reset} aria-label="Remove image" type="button">×</button>
            <p className={styles.fileName}>{file.name}</p>
            <div className={styles.fileMeta}>
              <span className={styles.fileMetaTag}>{labelFromType(file.type)}</span>
              <span className={styles.fileMetaTag}>{formatBytes(file.size)}</span>
              {dimensions && <span className={styles.fileMetaTag}>{dimensions.width} × {dimensions.height} px</span>}
            </div>
          </div>
        ) : (
          <>
            <span className={styles.dropIcon}>↑</span>
            <p className={styles.dropText}>Drop image here or <span className={styles.fileLabel}>browse</span></p>
            <p className={styles.hint}>JPG, PNG, WEBP, GIF or AVIF — up to 50 MB</p>
          </>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

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
                <option key={f} value={f}>{labelFromType(f)}</option>
              ))}
            </select>
          </div>
          <p className={styles.hint}>WEBP usually gives the smallest file size while keeping good quality.</p>

          <button className={styles.btn} onClick={convert} disabled={loading}>
            {loading ? 'Converting…' : 'Convert image'}
          </button>
        </div>
      )}

      {resultUrl && resultBlob && file && (
        <div className={styles.result}>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>{labelFromType(file.type)}</span>
              <span className={styles.statValue}>{formatBytes(file.size)}</span>
            </div>
            <div className={styles.statDivider}>→</div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>{labelFromType(targetFormat)}</span>
              <span className={styles.statValue}>{formatBytes(resultBlob.size)}</span>
            </div>
          </div>

          <div className={styles.compare}>
            <div className={styles.compareCol}>
              <span className={styles.compareLabel}>Before</span>
              <img src={preview!} alt="Original" className={styles.resultPreview} />
            </div>
            <div className={styles.compareCol}>
              <span className={styles.compareLabel}>After</span>
              <img src={resultUrl} alt="Converted" className={styles.resultPreview} />
            </div>
          </div>

          <button className={styles.btnOutline} onClick={download}>Download</button>
        </div>
      )}
    </section>
  )
}
