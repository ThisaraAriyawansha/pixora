import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

const FFMPEG_CORE_VERSION = '0.12.10'

let ffmpegPromise: Promise<FFmpeg> | null = null
type ProgressHandler = (progress: number) => void
let progressHandler: ProgressHandler | null = null

export function setProgressHandler(handler: ProgressHandler | null) {
  progressHandler = handler
}

export function getFFmpeg(): Promise<FFmpeg> {
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      const ffmpeg = new FFmpeg()
      ffmpeg.on('progress', ({ progress }) => {
        progressHandler?.(Math.min(1, Math.max(0, progress)))
      })
      const base = `${window.location.origin}/ffmpeg/${FFMPEG_CORE_VERSION}`
      await ffmpeg.load({
        coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm'),
      })
      return ffmpeg
    })()
  }
  return ffmpegPromise
}
