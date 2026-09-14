import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_VIDEO_FILE_SIZE = 300 * 1024 * 1024

function extractDriveFileId(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  const patterns = [/\/file\/d\/([a-zA-Z0-9_-]{10,})/, /[?&]id=([a-zA-Z0-9_-]{10,})/, /\/d\/([a-zA-Z0-9_-]{10,})/]
  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match) return match[1]
  }

  if (!trimmed.includes('/') && !trimmed.includes(' ') && /^[a-zA-Z0-9_-]{10,}$/.test(trimmed)) {
    return trimmed
  }

  return null
}

function filenameFromContentDisposition(header: string | null): string | null {
  if (!header) return null
  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match) {
    try {
      return decodeURIComponent(utf8Match[1])
    } catch {
      return utf8Match[1]
    }
  }
  const plainMatch = header.match(/filename="?([^";]+)"?/i)
  return plainMatch ? plainMatch[1] : null
}

async function fetchDriveFile(fileId: string): Promise<Response> {
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`
  let res = await fetch(downloadUrl, { redirect: 'follow' })

  const cookie = res.headers.get('set-cookie') ?? undefined
  const contentType = res.headers.get('content-type') ?? ''

  if (contentType.includes('text/html')) {
    const html = await res.text()
    const confirmMatch = html.match(/confirm=([0-9A-Za-z_-]+)/)
    const uuidMatch = html.match(/name="uuid"\s+value="([0-9A-Za-z-]+)"/)

    if (!confirmMatch) {
      const isAccessDenied = /you need access|request access|sign in/i.test(html)
      throw new Error(
        isAccessDenied
          ? 'This file is private. In Google Drive, set sharing to "Anyone with the link" and try again.'
          : 'Could not fetch that file from Google Drive.'
      )
    }

    let confirmedUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=${confirmMatch[1]}`
    if (uuidMatch) confirmedUrl += `&uuid=${uuidMatch[1]}`

    res = await fetch(confirmedUrl, {
      redirect: 'follow',
      headers: cookie ? { Cookie: cookie } : undefined,
    })
  }

  return res
}

function limitStream(stream: ReadableStream<Uint8Array>, maxBytes: number) {
  let total = 0
  const transform = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      total += chunk.byteLength
      if (total > maxBytes) {
        controller.error(new Error('File exceeds the maximum allowed size.'))
        return
      }
      controller.enqueue(chunk)
    },
  })
  return stream.pipeThrough(transform)
}

export async function GET(req: NextRequest) {
  const input = req.nextUrl.searchParams.get('url')
  if (!input) {
    return Response.json({ error: 'Missing Google Drive link.' }, { status: 400 })
  }

  const fileId = extractDriveFileId(input)
  if (!fileId) {
    return Response.json({ error: 'Could not find a Google Drive file ID in that link.' }, { status: 400 })
  }

  let driveRes: Response
  try {
    driveRes = await fetchDriveFile(fileId)
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to reach Google Drive.' },
      { status: 502 }
    )
  }

  if (!driveRes.ok || !driveRes.body) {
    return Response.json(
      { error: 'Could not download that file. Make sure it is shared as "Anyone with the link".' },
      { status: 404 }
    )
  }

  const contentType = driveRes.headers.get('content-type') ?? 'application/octet-stream'
  if (contentType.includes('text/html')) {
    return Response.json(
      { error: 'This file is private. In Google Drive, set sharing to "Anyone with the link" and try again.' },
      { status: 403 }
    )
  }

  const contentLength = Number(driveRes.headers.get('content-length') ?? 0)
  if (contentLength && contentLength > MAX_VIDEO_FILE_SIZE) {
    return Response.json(
      { error: `File is too large. Max size is ${Math.round(MAX_VIDEO_FILE_SIZE / (1024 * 1024))} MB.` },
      { status: 413 }
    )
  }

  const filename = filenameFromContentDisposition(driveRes.headers.get('content-disposition')) || `drive-video-${fileId}.mp4`

  const headers = new Headers()
  headers.set('Content-Type', contentType)
  headers.set('Content-Disposition', `inline; filename="${filename.replace(/"/g, '')}"`)
  if (contentLength) headers.set('Content-Length', String(contentLength))
  headers.set('Cache-Control', 'no-store')

  return new Response(limitStream(driveRes.body, MAX_VIDEO_FILE_SIZE), { status: 200, headers })
}
