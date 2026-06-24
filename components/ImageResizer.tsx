'use client'
import { useRef, useState } from 'react'
import imageCompression from 'browser-image-compression'
import styles from './Tool.module.css'
import { formatBytes, getImageDimensions, labelFromType, validateImageFile } from '@/lib/imageUtils'

type Dimensions = { width: number; height: number }

export default function ImageResizer() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState<Dimensions | null>(null)
  const [maxWidth, setMaxWidth] = useState(1280)
  const [maxHeight, setMaxHeight] = useState(720)
  const [lockAspect, setLockAspect] = useState(true)
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
      const dims = await getImageDimensions(f)
      setDimensions(dims)
      setMaxWidth(dims.width)
      setMaxHeight(dims.height)
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

  const aspectRatio = dimensions ? dimensions.width / dimensions.height : null

  const handleWidthChange = (value: number) => {
    setMaxWidth(value)
    if (lockAspect && aspectRatio) {
      setMaxHeight(Math.round(value / aspectRatio))
    }
  }

  const handleHeightChange = (value: number) => {
    setMaxHeight(value)
    if (lockAspect && aspectRatio) {
      setMaxWidth(Math.round(value * aspectRatio))
    }
  }

  const resize = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const options = {
        maxWidthOrHeight: Math.max(maxWidth, maxHeight),
        useWebWorker: true,
        initialQuality: 1,
      }
      const result = await imageCompression(file, options)
      setResultUrl(URL.createObjectURL(result))
      setResultBlob(result)
    } catch (err) {
      console.error(err)
      setError('Something went wrong while resizing this image. Please try again.')
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
            <p className={styles.hint}>JPG, PNG, WEBP, GIF or AVIF — up to 25 MB</p>
          </>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

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
                onChange={(e) => handleWidthChange(Number(e.target.value))}
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
                onChange={(e) => handleHeightChange(Number(e.target.value))}
                className={styles.dimInput}
              />
            </div>
          </div>

          <div className={styles.lockRow}>
            <button
              type="button"
              className={`${styles.lockBtn} ${lockAspect ? styles.lockBtnActive : ''}`}
              onClick={() => setLockAspect(!lockAspect)}
            >
              {lockAspect ? '🔒 Aspect ratio locked' : '🔓 Aspect ratio unlocked'}
            </button>
          </div>

          <p className={styles.dimNote}>
            {dimensions
              ? `Original size: ${dimensions.width} × ${dimensions.height} px.`
              : 'Aspect ratio is preserved automatically.'}
          </p>

          <button className={styles.btn} onClick={resize} disabled={loading}>
            {loading ? 'Resizing…' : 'Resize image'}
          </button>
        </div>
      )}

      {resultUrl && resultBlob && (
        <div className={styles.result}>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Target</span>
              <span className={styles.statValue}>{maxWidth} × {maxHeight} px</span>
            </div>
            <div className={styles.statDivider}>→</div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>File size</span>
              <span className={styles.statValue}>{formatBytes(resultBlob.size)}</span>
            </div>
          </div>

          <div className={styles.compare}>
            <div className={styles.compareCol}>
              <span className={styles.compareLabel}>Before</span>
              <img src={preview!} alt="Original" className={styles.resultPreview} />
              {dimensions && <span className={styles.compareMeta}>{dimensions.width} × {dimensions.height} px</span>}
            </div>
            <div className={styles.compareCol}>
              <span className={styles.compareLabel}>After</span>
              <img src={resultUrl} alt="Resized" className={styles.resultPreview} />
            </div>
          </div>

          <button className={styles.btnOutline} onClick={download}>Download</button>
        </div>
      )}
    </section>
  )
}
