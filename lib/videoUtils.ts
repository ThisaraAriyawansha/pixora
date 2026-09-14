export const MAX_VIDEO_FILE_SIZE = 300 * 1024 * 1024
export const MAX_VIDEO_DURATION_SEC = 15 * 60
export const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska']

const EXT_BY_TYPE: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
  'video/x-matroska': 'mkv',
}

export function extFromVideoType(type: string) {
  return EXT_BY_TYPE[type] ?? 'mp4'
}

const TYPE_BY_EXT: Record<string, string> = {
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  mkv: 'video/x-matroska',
}

export function guessVideoTypeFromName(name: string): string | null {
  const ext = name.split('.').pop()?.toLowerCase()
  return ext ? TYPE_BY_EXT[ext] ?? null : null
}

export function labelFromVideoType(type: string) {
  return extFromVideoType(type).toUpperCase()
}

export function formatDuration(seconds: number) {
  const total = Math.round(seconds)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function validateVideoFile(file: File): string | null {
  if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
    const labels = ACCEPTED_VIDEO_TYPES.map(labelFromVideoType)
    const list = `${labels.slice(0, -1).join(', ')} or ${labels[labels.length - 1]}`
    return `Unsupported file type. Please use ${list}.`
  }
  if (file.size > MAX_VIDEO_FILE_SIZE) {
    return `File is too large. Max size is ${Math.round(MAX_VIDEO_FILE_SIZE / (1024 * 1024))} MB.`
  }
  return null
}

export type VideoMeta = { width: number; height: number; duration: number }

export function getVideoMeta(file: File): Promise<VideoMeta> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const url = URL.createObjectURL(file)
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      resolve({ width: video.videoWidth, height: video.videoHeight, duration: video.duration })
      URL.revokeObjectURL(url)
    }
    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read video metadata'))
    }
    video.src = url
  })
}

export function crfFromQuality(quality: number) {
  const crf = 32 - ((quality - 10) * (32 - 18)) / 90
  return Math.round(Math.min(32, Math.max(18, crf)))
}
