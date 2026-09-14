const fs = require('fs')
const path = require('path')

const CORE_PKG_DIR = path.join(__dirname, '..', 'node_modules', '@ffmpeg', 'core')
const CORE_VERSION = JSON.parse(fs.readFileSync(path.join(CORE_PKG_DIR, 'package.json'), 'utf8')).version
const SRC_DIR = path.join(CORE_PKG_DIR, 'dist', 'umd')
const DEST_DIR = path.join(__dirname, '..', 'public', 'ffmpeg', CORE_VERSION)
const FILES = ['ffmpeg-core.js', 'ffmpeg-core.wasm']

if (!fs.existsSync(SRC_DIR)) {
  console.warn(`[copy-ffmpeg-core] Source dir not found, skipping: ${SRC_DIR}`)
  process.exit(0)
}

fs.mkdirSync(DEST_DIR, { recursive: true })

for (const file of FILES) {
  const src = path.join(SRC_DIR, file)
  if (!fs.existsSync(src)) {
    console.warn(`[copy-ffmpeg-core] Missing expected file, skipping: ${src}`)
    continue
  }
  fs.copyFileSync(src, path.join(DEST_DIR, file))
}

console.log(`[copy-ffmpeg-core] Copied ffmpeg-core ${CORE_VERSION} into public/ffmpeg/${CORE_VERSION}`)
