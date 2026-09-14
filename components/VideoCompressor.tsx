'use client'
import { useRef, useState } from 'react'
import { fetchFile } from '@ffmpeg/util'
import styles from './Tool.module.css'
import { formatBytes } from '@/lib/imageUtils'
import { getFFmpeg, setProgressHandler } from '@/lib/ffmpegClient'
import {
  ACCEPTED_VIDEO_TYPES,
  MAX_VIDEO_DURATION_SEC,
  RESOLUTION_PRESETS,
  VideoMeta,
  crfFromQuality,
  extFromVideoType,
  formatDuration,
  getVideoMeta,
  guessVideoTypeFromName,
  labelFromVideoType,
  validateVideoFile,
  videoBitrateForTargetSize,
} from '@/lib/videoUtils'

type ItemStatus = 'pending' | 'compressing' | 'done' | 'error'

type CompressionMethod = 'percentage' | 'sizeMB' | 'quality' | 'resolution' | 'bitrate'

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
  const [method, setMethod] = useState<CompressionMethod>('percentage')
  const [quality, setQuality] = useState(70)
  const [targetPct, setTargetPct] = useState(50)
  const [targetSizeMB, setTargetSizeMB] = useState(10)
  const [targetResolution, setTargetResolution] = useState('720')
  const [targetBitrate, setTargetBitrate] = useState(2000)
  const [capResolution, setCapResolution] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [loadingEngine, setLoadingEngine] = useState(false)
  const [driveUrl, setDriveUrl] = useState('')
  const [isFetchingDrive, setIsFetchingDrive] = useState(false)
  const [driveProgress, setDriveProgress] = useState(0)
  const [driveError, setDriveError] = useState<string | null>(null)

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

  const fetchFromDrive = async () => {
    const trimmed = driveUrl.trim()
    if (!trimmed || isFetchingDrive) return

    setDriveError(null)
    setIsFetchingDrive(true)
    setDriveProgress(0)

    try {
      const res = await fetch(`/api/drive-fetch?url=${encodeURIComponent(trimmed)}`)
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Could not fetch that file from Google Drive.')
      }

      const contentLength = Number(res.headers.get('content-length') || 0)
      const reader = res.body.getReader()
      const chunks: Uint8Array[] = []
      let received = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
        received += value.length
        setDriveProgress(contentLength ? Math.min(1, received / contentLength) : 0)
      }

      const disposition = res.headers.get('content-disposition') || ''
      const nameMatch = disposition.match(/filename="?([^";]+)"?/)
      const filename = nameMatch ? nameMatch[1] : `drive-video-${Date.now()}.mp4`

      let type = res.headers.get('content-type') || ''
      if (!ACCEPTED_VIDEO_TYPES.includes(type)) {
        type = guessVideoTypeFromName(filename) || type
      }

      const blob = new Blob(chunks as BlobPart[], { type })
      const file = new File([blob], filename, { type })
      addFiles([file])
      setDriveUrl('')
    } catch (err) {
      setDriveError(err instanceof Error ? err.message : 'Could not fetch that file from Google Drive.')
    } finally {
      setIsFetchingDrive(false)
      setDriveProgress(0)
    }
  }

  const resetAll = () => {
    setItems([])
    setGlobalError(null)
  }

  const SPEED_CAP_HEIGHT = 720

  const buildVideoArgs = (item: VideoItem): string[] => {
    const duration = item.meta?.duration ?? 0
    const capArgs = capResolution ? ['-vf', `scale=-2:'min(ih,${SPEED_CAP_HEIGHT})'`] : []

    switch (method) {
      case 'percentage': {
        const targetBytes = item.file.size * (targetPct / 100)
        const kbps = videoBitrateForTargetSize(targetBytes, duration)
        return ['-c:v', 'libx264', '-b:v', `${kbps}k`, '-maxrate', `${kbps}k`, '-bufsize', `${kbps * 2}k`, '-preset', 'ultrafast', ...capArgs]
      }
      case 'sizeMB': {
        const targetBytes = targetSizeMB * 1024 * 1024
        const kbps = videoBitrateForTargetSize(targetBytes, duration)
        return ['-c:v', 'libx264', '-b:v', `${kbps}k`, '-maxrate', `${kbps}k`, '-bufsize', `${kbps * 2}k`, '-preset', 'ultrafast', ...capArgs]
      }
      case 'bitrate': {
        return ['-c:v', 'libx264', '-b:v', `${targetBitrate}k`, '-maxrate', `${targetBitrate}k`, '-bufsize', `${targetBitrate * 2}k`, '-preset', 'ultrafast', ...capArgs]
      }
      case 'resolution': {
        const preset = RESOLUTION_PRESETS.find((p) => p.value === targetResolution)
        const args = ['-c:v', 'libx264', '-crf', String(crfFromQuality(70)), '-preset', 'ultrafast']
        if (preset?.height) {
          args.push('-vf', `scale=-2:'min(ih,${preset.height})'`)
        }
        return args
      }
      case 'quality':
      default: {
        const crf = crfFromQuality(quality)
        return ['-c:v', 'libx264', '-crf', String(crf), '-preset', 'ultrafast', ...capArgs]
      }
    }
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
            ...buildVideoArgs(item),
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

      <div className={styles.urlDivider}>or</div>
      <div className={styles.urlRow}>
        <input
          type="text"
          className={styles.urlInput}
          placeholder="Paste a Google Drive share link"
          value={driveUrl}
          onChange={(e) => setDriveUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') fetchFromDrive()
          }}
          disabled={isFetchingDrive}
        />
        <button
          type="button"
          className={styles.btnOutline}
          onClick={fetchFromDrive}
          disabled={isFetchingDrive || !driveUrl.trim()}
        >
          {isFetchingDrive ? `Fetching… ${Math.round(driveProgress * 100)}%` : 'Fetch from Drive'}
        </button>
      </div>
      <p className={styles.hint}>File must be shared as &quot;Anyone with the link&quot;. It's pulled straight into your browser — the compressed result stays yours to download.</p>
      {driveError && <div className={styles.error}>{driveError}</div>}

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
          <div className={styles.selectRow}>
            <label className={styles.selectLabel}>Compression Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as CompressionMethod)}
              className={styles.select}
            >
              <option value="percentage">Target a file size (Percentage)</option>
              <option value="sizeMB">Target a file size (MB)</option>
              <option value="quality">Target a video quality</option>
              <option value="resolution">Target a video resolution</option>
              <option value="bitrate">Target a max bitrate</option>
            </select>
          </div>

          {method === 'percentage' && (
            <div className={styles.sliderRow}>
              <label className={styles.sliderLabel}>Select Target Size — {targetPct}%</label>
              <input
                type="range"
                min={10}
                max={90}
                value={targetPct}
                onChange={(e) => setTargetPct(Number(e.target.value))}
                className={styles.slider}
              />
              <p className={styles.hint}>Lower values compress more. For example, a 100 MB file would become {Math.round(100 * (targetPct / 100))} MB at {targetPct}%.</p>
            </div>
          )}

          {method === 'sizeMB' && (
            <div className={styles.sliderRow}>
              <label className={styles.sliderLabel}>Target file size (MB)</label>
              <input
                type="number"
                min={1}
                value={targetSizeMB}
                onChange={(e) => setTargetSizeMB(Math.max(1, Number(e.target.value)))}
                className={styles.dimInput}
              />
              <p className={styles.hint}>Pixora will aim to shrink each video to about this size. Actual results can vary slightly.</p>
            </div>
          )}

          {method === 'quality' && (
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
              <p className={styles.hint}>Lower quality means a smaller file. 70% is a good balance for most videos.</p>
            </div>
          )}

          {method === 'resolution' && (
            <div className={styles.selectRow}>
              <label className={styles.selectLabel}>Resolution</label>
              <select
                value={targetResolution}
                onChange={(e) => setTargetResolution(e.target.value)}
                className={styles.select}
              >
                {RESOLUTION_PRESETS.map((preset) => (
                  <option key={preset.value} value={preset.value}>{preset.label}</option>
                ))}
              </select>
            </div>
          )}

          {method === 'bitrate' && (
            <div className={styles.sliderRow}>
              <label className={styles.sliderLabel}>Max bitrate (kbps)</label>
              <input
                type="number"
                min={100}
                value={targetBitrate}
                onChange={(e) => setTargetBitrate(Math.max(100, Number(e.target.value)))}
                className={styles.dimInput}
              />
              <p className={styles.hint}>Caps the video bitrate at this value. Lower bitrate means a smaller file.</p>
            </div>
          )}

          {method !== 'resolution' && (
            <div className={styles.selectRow}>
              <label className={styles.selectLabel} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={capResolution}
                  onChange={(e) => setCapResolution(e.target.checked)}
                />
                Speed up (cap resolution at 720p)
              </label>
            </div>
          )}
          {method !== 'resolution' && capResolution && (
            <p className={styles.hint}>Encoding at a smaller frame size is the biggest speed lever in the browser — much bigger than preset or bitrate settings. Turn this off to keep the original resolution at the cost of a slower encode.</p>
          )}

          <p className={styles.hint}>Output is always MP4 (H.264).</p>

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
