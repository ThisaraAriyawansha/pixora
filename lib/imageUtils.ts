export const MAX_FILE_SIZE = 50 * 1024 * 1024
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
export const SVG_TYPE = 'image/svg+xml'

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
}

export function extFromType(type: string) {
  return EXT_BY_TYPE[type] ?? 'img'
}

export function labelFromType(type: string) {
  return extFromType(type).toUpperCase()
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function validateImageFile(file: File, allowedTypes: string[] = ACCEPTED_TYPES): string | null {
  if (!allowedTypes.includes(file.type)) {
    const labels = allowedTypes.map(labelFromType)
    const list =
      labels.length > 1 ? `${labels.slice(0, -1).join(', ')} or ${labels[labels.length - 1]}` : labels[0]
    return `Unsupported file type. Please use ${list}.`
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File is too large (${formatBytes(file.size)}). Max size is ${formatBytes(MAX_FILE_SIZE)}.`
  }
  return null
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read image dimensions'))
    }
    img.src = url
  })
}
