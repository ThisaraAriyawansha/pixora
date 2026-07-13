'use client'
import { useRef, useState } from 'react'
import imageCompression from 'browser-image-compression'
import styles from './Tool.module.css'
import { extFromType, formatBytes, getImageDimensions, labelFromType, validateImageFile } from '@/lib/imageUtils'

const FORMATS = ['image/jpeg', 'image/png', 'image/webp']
type Dimensions = { width: number; height: number }
type ItemStatus = 'pending' | 'converting' | 'done' | 'error'

type ConvertItem = {
  id: string
  file: File
  preview: string
  dimensions: Dimensions | null
  status: ItemStatus
  converted: Blob | null
  resultPreview: string | null
  error: string | null
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function ImageConverter() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const idCounter = useRef(0)
  const [items, setItems] = useState<ConvertItem[]>([])
  const [targetFormat, setTargetFormat] = useState('image/webp')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  const addFiles = (fileList: FileList | File[] | null) => {
    if (!fileList) return
    const files = Array.from(fileList)
    const rejected: string[] = []
    const accepted: ConvertItem[] = []

    for (const file of files) {
      const validationError = validateImageFile(file)
      if (validationError) {
        rejected.push(`${file.name}: ${validationError}`)
        continue
      }
      idCounter.current += 1
      accepted.push({
        id: `${Date.now()}-${idCounter.current}`,
        file,
        preview: URL.createObjectURL(file),
        dimensions: null,
        status: 'pending',
        converted: null,
        resultPreview: null,
        error: null,
      })
    }

    if (accepted.length) {
      setItems((prev) => [...prev, ...accepted])
      accepted.forEach((item) => {
        getImageDimensions(item.file)
          .then((dims) => {
            setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, dimensions: dims } : it)))
          })
          .catch(() => {})
      })
    }

    setGlobalError(rejected.length ? rejected.join(' — ') : null)
  }

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    addFiles(e.dataTransfer.files)
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const resetAll = () => {
    setItems([])
    setGlobalError(null)
  }

  const convertAll = async () => {
    if (!items.length) return
    setIsProcessing(true)
    setGlobalError(null)
    const options = {
      fileType: targetFormat,
      initialQuality: 0.9,
      useWebWorker: true,
      alwaysKeepResolution: true,
    }

    for (const item of items) {
      setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, status: 'converting', error: null } : it)))
      try {
        const result = await imageCompression(item.file, options)
        const resultPreview = URL.createObjectURL(result)
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: 'done', converted: result, resultPreview } : it))
        )
      } catch (err) {
        console.error(err)
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id ? { ...it, status: 'error', error: 'Conversion failed. Please try again.' } : it
          )
        )
      }
    }
    setIsProcessing(false)
  }

  const getDownloadName = (file: File) => {
    const baseName = file.name.replace(/\.[^.]+$/, '')
    return `pixora-${baseName}.${extFromType(targetFormat)}`
  }

  const downloadItem = (item: ConvertItem) => {
    if (!item.converted) return
    const url = URL.createObjectURL(item.converted)
    const a = document.createElement('a')
    a.href = url
    a.download = getDownloadName(item.file)
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadAll = async () => {
    for (const item of items) {
      if (item.status === 'done') {
        downloadItem(item)
        await sleep(150)
      }
    }
  }

  const doneItems = items.filter((item) => item.status === 'done')

  return (
    <section className={styles.tool} id="convert">
      <div className={styles.toolHeader}>
        <h2 className={styles.toolTitle}>Convert</h2>
        <p className={styles.toolDesc}>Change image format instantly in your browser. Select one or many images at once.</p>
      </div>

      <div
        className={`${styles.dropzone} ${isDragOver ? styles.dropzoneActive : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
          className={styles.fileInput}
        />
        {items.length > 0 ? (
          <>
            <span className={styles.dropIcon}>+</span>
            <p className={styles.dropText}>Add more images or <span className={styles.fileLabel}>browse</span></p>
          </>
        ) : (
          <>
            <span className={styles.dropIcon}>↑</span>
            <p className={styles.dropText}>Drop images here or <span className={styles.fileLabel}>browse</span></p>
            <p className={styles.hint}>JPG, PNG, WEBP, GIF or AVIF — up to 50 MB each. You can select multiple files at once.</p>
          </>
        )}
      </div>

      {globalError && <div className={styles.error}>{globalError}</div>}

      {items.length > 0 && (
        <div className={styles.fileGrid}>
          {items.map((item) => (
            <div key={item.id} className={styles.fileCard}>
              <button
                className={styles.removeBtn}
                onClick={() => removeItem(item.id)}
                aria-label="Remove image"
                type="button"
              >
                ×
              </button>
              <img src={item.resultPreview ?? item.preview} alt={item.file.name} className={styles.fileCardThumb} />
              <p className={styles.fileCardName} title={item.file.name}>{item.file.name}</p>
              <div className={styles.fileMeta}>
                <span className={styles.fileMetaTag}>{labelFromType(item.file.type)}</span>
                <span className={styles.fileMetaTag}>{formatBytes(item.file.size)}</span>
                {item.dimensions && (
                  <span className={styles.fileMetaTag}>{item.dimensions.width} × {item.dimensions.height} px</span>
                )}
              </div>

              {item.status === 'converting' && <p className={styles.hint}>Converting…</p>}
              {item.status === 'error' && <div className={styles.error}>{item.error}</div>}
              {item.status === 'done' && item.converted && (
                <>
                  <div className={styles.fileCardResult}>
                    <span className={styles.statValue}>{formatBytes(item.converted.size)}</span>
                    <span className={styles.badge}>{labelFromType(targetFormat)}</span>
                  </div>
                  <button className={styles.btnOutline} onClick={() => downloadItem(item)} type="button">
                    Download
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
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

          <div className={styles.btnRow}>
            <button className={styles.btn} onClick={convertAll} disabled={isProcessing}>
              {isProcessing ? 'Converting…' : `Convert ${items.length > 1 ? `${items.length} images` : 'image'}`}
            </button>
            <button className={styles.btnGhost} onClick={resetAll} type="button">Clear all</button>
          </div>
        </div>
      )}

      {doneItems.length > 0 && (
        <div className={styles.result}>
          <button className={styles.btnOutline} onClick={downloadAll} type="button">
            Download all ({doneItems.length})
          </button>
        </div>
      )}
    </section>
  )
}
