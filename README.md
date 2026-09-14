# Pixora

Fast and modern online image and video compressor, converter, and resizer built for seamless media optimization — all processing happens client-side in the browser.

## Features

- **Compress** — Reduce image and video file size while preserving quality
- **Convert** — Convert images between formats
- **Resize** — Resize images to custom dimensions

## Tech Stack

- [Next.js 14](https://nextjs.org/) (App Router) + React 18 + TypeScript
- [browser-image-compression](https://www.npmjs.com/package/browser-image-compression) for client-side image processing
- [FFmpeg (ffmpeg.wasm)](https://ffmpegwasm.netlify.app/) for client-side video compression

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |

## Project Structure

```
app/            Routes (home, convert, resize, video, about, contact, etc.)
components/     Reusable UI components (ImageCompressor, ImageConverter, ImageResizer, VideoCompressor, Navbar, Footer)
lib/            Shared utilities
public/         Static assets
```
