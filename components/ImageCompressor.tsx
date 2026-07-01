'use client'
import { useRef, useState } from 'react'
import imageCompression from 'browser-image-compression'
import styles from './Tool.module.css'
import { formatBytes, getImageDimensions, labelFromType, validateImageFile } from '@/lib/imageUtils'

type Dimensions = { width: number; height: number }
type NamingMode = 'renamed' | 'original'
type ItemStatus = 'pending' | 'compressing' | 'done' | 'error'

type CompressItem = {
  id: string
  file: File
  preview: string
  dimensions: Dimensions | null
  status: ItemStatus
  compressed: Blob | null
  resultPreview: string | null
  error: string | null
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function ImageCompressor() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const idCounter = useRef(0)
  const [items, setItems] = useState<CompressItem[]>([])
  const [quality, setQuality] = useState(70)
  const [namingMode, setNamingMode] = useState<NamingMode>('renamed')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  const addFiles = (fileList: FileList | File[] | null) => {
    if (!fileList) return
    const files = Array.from(fileList)
    const rejected: string[] = []
    const accepted: CompressItem[] = []

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
        compressed: null,
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

  const compressAll = async () => {
    if (!items.length) return
    setIsProcessing(true)
    setGlobalError(null)
    const options = {
      maxSizeMB: 10,
      initialQuality: quality / 100,
      useWebWorker: true,
      alwaysKeepResolution: true,
    }

    for (const item of items) {
      if (item.status === 'done') continue
      setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, status: 'compressing', error: null } : it)))
      try {
        const result = await imageCompression(item.file, options)
        const resultPreview = URL.createObjectURL(result)
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: 'done', compressed: result, resultPreview } : it))
        )
      } catch (err) {
        console.error(err)
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id ? { ...it, status: 'error', error: 'Compression failed. Please try again.' } : it
          )
        )
      }
    }
    setIsProcessing(false)
  }

  const getDownloadName = (file: File) =>
    namingMode === 'original' ? file.name : `pixora-compressed-${file.name}`

  const downloadItem = (item: CompressItem) => {
    if (!item.compressed) return
    const url = URL.createObjectURL(item.compressed)
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
  const doneOriginalSize = doneItems.reduce((sum, item) => sum + item.file.size, 0)
  const doneCompressedSize = doneItems.reduce((sum, item) => sum + (item.compressed?.size ?? 0), 0)
  const savedPct = doneItems.length
    ? Math.round(((doneOriginalSize - doneCompressedSize) / doneOriginalSize) * 100)
    : null

  return (
    <section className={styles.tool} id="compress">
      <div className={styles.toolHeader}>
        <h2 className={styles.toolTitle}>Compress</h2>
        <p className={styles.toolDesc}>Reduce file size without losing quality. Select one or many images at once.</p>
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
          {items.map((item) => {
            const itemSaved = item.compressed
              ? Math.round(((item.file.size - item.compressed.size) / item.file.size) * 100)
              : null
            return (
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

                {item.status === 'compressing' && <p className={styles.hint}>Compressing…</p>}
                {item.status === 'error' && <div className={styles.error}>{item.error}</div>}
                {item.status === 'done' && item.compressed && (
                  <>
                    <div className={styles.fileCardResult}>
                      <span className={styles.statValue}>{formatBytes(item.compressed.size)}</span>
                      {itemSaved !== null && <span className={styles.badge}>{itemSaved}% smaller</span>}
                    </div>
                    <button className={styles.btnOutline} onClick={() => downloadItem(item)} type="button">
                      Download
                    </button>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}

      {items.length > 0 && (
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

          <div className={styles.selectRow}>
            <label className={styles.selectLabel}>File name</label>
            <select
              value={namingMode}
              onChange={(e) => setNamingMode(e.target.value as NamingMode)}
              className={styles.select}
            >
              <option value="renamed">Add &quot;pixora-compressed-&quot; prefix</option>
              <option value="original">Keep original file name</option>
            </select>
          </div>

          <div className={styles.btnRow}>
            <button className={styles.btn} onClick={compressAll} disabled={isProcessing}>
              {isProcessing ? 'Compressing…' : `Compress ${items.length > 1 ? `${items.length} images` : 'image'}`}
            </button>
            <button className={styles.btnGhost} onClick={resetAll} type="button">Clear all</button>
          </div>
        </div>
      )}

      {doneItems.length > 0 && (
        <div className={styles.result}>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Original</span>
              <span className={styles.statValue}>{formatBytes(doneOriginalSize)}</span>
            </div>
            <div className={styles.statDivider}>→</div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Compressed</span>
              <span className={styles.statValue}>{formatBytes(doneCompressedSize)}</span>
            </div>
            {savedPct !== null && <div className={styles.badge}>{savedPct}% smaller</div>}
          </div>

          <button className={styles.btnOutline} onClick={downloadAll} type="button">
            Download all ({doneItems.length})
          </button>
        </div>
      )}
    </section>
  )
}
