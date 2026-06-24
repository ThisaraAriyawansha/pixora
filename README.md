# Pixora

Fast and modern online image compressor, converter, and resizer built for seamless image optimization — all processing happens client-side in the browser.

## Features

- **Compress** — Reduce image file size while preserving quality
- **Convert** — Convert images between formats
- **Resize** — Resize images to custom dimensions

## Tech Stack

- [Next.js 14](https://nextjs.org/) (App Router) + React 18 + TypeScript
- [browser-image-compression](https://www.npmjs.com/package/browser-image-compression) for client-side image processing

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
app/            Routes (home, convert, resize, about, contact, etc.)
components/     Reusable UI components (ImageCompressor, ImageConverter, ImageResizer, Navbar, Footer)
lib/            Shared utilities
public/         Static assets
```
