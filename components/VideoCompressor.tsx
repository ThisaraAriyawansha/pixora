'use client'
import { useRef, useState } from 'react'
import { fetchFile } from '@ffmpeg/util'
import styles from './Tool.module.css'
import { formatBytes } from '@/lib/imageUtils'
import { getFFmpeg, setProgressHandler } from '@/lib/ffmpegClient'
import {
  MAX_VIDEO_DURATION_SEC,
  VideoMeta,
  crfFromQuality,
  extFromVideoType,
  formatDuration,
  getVideoMeta,
  labelFromVideoType,
  validateVideoFile,
} from '@/lib/videoUtils'

type ItemStatus = 'pending' | 'compressing' | 'done' | 'error'

type VideoItem = {
  id: string
  file: File
  preview: string
  meta: VideoMeta | null
  status: ItemStatus
  compressed: Blob | null
  resultPreview: string | null
  progress: number
  error: string | null
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function VideoCompressor() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const idCounter = useRef(0)
  const [items, setItems] = useState<VideoItem[]>([])
  const [quality, setQuality] = useState(70)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [loadingEngine, setLoadingEngine] = useState(false)

  const addFiles = (fileList: FileList | File[] | null) => {
    if (!fileList) return
    const files = Array.from(fileList)
    const rejected: string[] = []
    const accepted: VideoItem[] = []

    for (const file of files) {
      const validationError = validateVideoFile(file)
      if (validationError) {
        rejected.push(`${file.name}: ${validationError}`)
        continue
      }
      idCounter.current += 1
      accepted.push({
        id: `${Date.now()}-${idCounter.current}`,
        file,
        preview: URL.createObjectURL(file),
        meta: null,
        status: 'pending',
        compressed: null,
        resultPreview: null,
        progress: 0,
        error: null,
      })
    }

    if (accepted.length) {
      setItems((prev) => [...prev, ...accepted])
      accepted.forEach((item) => {
        getVideoMeta(item.file)
          .then((meta) => {
            if (meta.duration > MAX_VIDEO_DURATION_SEC) {
              setItems((prev) =>
                prev.map((it) =>
                  it.id === item.id
                    ? { ...it, meta, status: 'error', error: `Video is too long. Max length is ${formatDuration(MAX_VIDEO_DURATION_SEC)}.` }
                    : it
                )
              )
              return
            }
            setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, meta } : it)))
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
    const pending = items.filter((item) => item.status === 'pending')
    if (!pending.length) return
    setIsProcessing(true)
    setGlobalError(null)

    try {
      setLoadingEngine(true)
      const ffmpeg = await getFFmpeg()
      setLoadingEngine(false)

      const crf = crfFromQuality(quality)

      for (const item of pending) {
        setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, status: 'compressing', progress: 0, error: null } : it)))
        setProgressHandler((progress) => {
          setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, progress } : it)))
        })

        const inputName = `input.${extFromVideoType(item.file.type)}`
        const outputName = 'output.mp4'
        try {
          await ffmpeg.writeFile(inputName, await fetchFile(item.file))
          await ffmpeg.exec([
            '-i', inputName,
            '-c:v', 'libx264',
            '-crf', String(crf),
            '-preset', 'veryfast',
            '-c:a', 'aac',
            '-b:a', '128k',
            '-movflags', '+faststart',
            outputName,
          ])
          const data = await ffmpeg.readFile(outputName)
          const result = new Blob([data as unknown as BlobPart], { type: 'video/mp4' })
          const resultPreview = URL.createObjectURL(result)
          setItems((prev) =>
            prev.map((it) => (it.id === item.id ? { ...it, status: 'done', compressed: result, resultPreview, progress: 1 } : it))
          )
        } catch (err) {
          console.error(err)
          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id ? { ...it, status: 'error', error: 'Compression failed. Please try again.' } : it
            )
          )
        } finally {
          await ffmpeg.deleteFile(inputName).catch(() => {})
          await ffmpeg.deleteFile(outputName).catch(() => {})
        }
      }
      setProgressHandler(null)
    } catch (err) {
      console.error(err)
      setGlobalError('Could not load the video engine. Please check your connection and try again.')
      setLoadingEngine(false)
    }

    setIsProcessing(false)
  }

  const getDownloadName = (file: File) => {
    const baseName = file.name.replace(/\.[^.]+$/, '')
    return `pixora-compressed-${baseName}.mp4`
  }

  const downloadItem = (item: VideoItem) => {
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
  const pendingCount = items.filter((item) => item.status === 'pending').length

  return (
    <section className={styles.tool} id="compress-video">
      <div className={styles.toolHeader}>
        <h2 className={styles.toolTitle}>Compress Video</h2>
        <p className={styles.toolDesc}>Shrink video file size right in your browser. Select one or many videos at once.</p>
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
          accept="video/*"
          multiple
          onChange={handleFiles}
          className={styles.fileInput}
        />
        {items.length > 0 ? (
          <>
            <span className={styles.dropIcon}>+</span>
            <p className={styles.dropText}>Add more videos or <span className={styles.fileLabel}>browse</span></p>
          </>
        ) : (
          <>
            <span className={styles.dropIcon}>↑</span>
            <p className={styles.dropText}>Drop videos here or <span className={styles.fileLabel}>browse</span></p>
            <p className={styles.hint}>MP4, WEBM, MOV or MKV — up to 300 MB and 15 minutes each.</p>
          </>
        )}
      </div>

      {globalError && <div className={styles.error}>{globalError}</div>}
      {loadingEngine && <p className={styles.hint}>Loading video engine… this only happens once.</p>}

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
                  aria-label="Remove video"
                  type="button"
                >
                  ×
                </button>
                <video
                  src={item.resultPreview ?? item.preview}
                  className={styles.fileCardVideo}
                  controls
                  preload="metadata"
                />
                <p className={styles.fileCardName} title={item.file.name}>{item.file.name}</p>
                <div className={styles.fileMeta}>
                  <span className={styles.fileMetaTag}>{labelFromVideoType(item.file.type)}</span>
                  <span className={styles.fileMetaTag}>{formatBytes(item.file.size)}</span>
                  {item.meta && (
                    <>
                      <span className={styles.fileMetaTag}>{item.meta.width} × {item.meta.height} px</span>
                      <span className={styles.fileMetaTag}>{formatDuration(item.meta.duration)}</span>
                    </>
                  )}
                </div>

                {item.status === 'compressing' && (
                  <>
                    <p className={styles.hint}>Compressing… {Math.round(item.progress * 100)}%</p>
                    <div className={styles.progressTrack}>
                      <div className={styles.progressFill} style={{ width: `${Math.round(item.progress * 100)}%` }} />
                    </div>
                  </>
                )}
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
            <p className={styles.hint}>Lower quality means a smaller file. 70% is a good balance for most videos. Output is always MP4 (H.264).</p>
          </div>

          <div className={styles.btnRow}>
            <button className={styles.btn} onClick={compressAll} disabled={isProcessing || pendingCount === 0}>
              {isProcessing ? 'Compressing…' : `Compress ${pendingCount > 1 ? `${pendingCount} videos` : 'video'}`}
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
