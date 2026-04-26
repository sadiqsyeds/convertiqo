# Convertiqo

> **Convert, compress, and transform files in one clean single-screen experience.**

Convertiqois a production-ready Next.js application that lets users convert images, compress videos, transform PDFs and documents — all directly in the browser. No file uploads to any server. No sign-up required. Everything happens locally.

---

## Features

### Core Conversions

| Category         | Input → Output                                                                   |
| ---------------- | -------------------------------------------------------------------------------- |
| **Images**       | JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, SVG → JPG, PNG, WebP, AVIF, GIF, BMP, TIFF |
| **Videos**       | MP4, WebM, MOV, MKV, AVI → MP4, WebM, GIF                                        |
| **PDFs**         | PDF → JPG or PNG (per page, with page range selection)                           |
| **Images → PDF** | Any image → embedded PDF                                                         |
| **Documents**    | DOCX/DOC → PDF                                                                   |

### UX & Interface

- **Single-screen layout** — Upload zone + file queue + results all on one page
- **Drag & drop** upload with click-to-browse fallback
- **Image previews** shown in the queue for image files
- **Format chip picker** — click a format badge to select output format
- **Quality sliders** for images and videos
- **DPI + page range** controls for PDFs
- **Per-file Convert button** + batch "Convert all" button
- **Per-file Download** + "Download all as ZIP"
- **Progress indicators** per file during conversion
- **Conversion history** persisted in localStorage (last 50 conversions)
- **Dark / Light / System** theme toggle
- **Toast notifications** for success, failure, and cancellation
- **Cancel in-progress** conversions per file
- **Retry failed** conversions with one click
- **Clear done / Clear all** queue management

---

## Tech Stack

| Layer               | Technology                            |
| ------------------- | ------------------------------------- |
| Framework           | Next.js 16 (App Router, Turbopack)    |
| Language            | TypeScript                            |
| Styling             | Tailwind CSS v4                       |
| UI Components       | Custom (using Radix UI primitives)    |
| State               | Zustand with localStorage persistence |
| Image conversion    | Canvas API (browser-native)           |
| PDF rendering       | PDF.js (pdfjs-dist)                   |
| PDF creation        | pdf-lib                               |
| GIF encoding        | gifenc                                |
| Video conversion    | MediaRecorder API (browser-native)    |
| ZIP packaging       | JSZip                                 |
| Toast notifications | Sonner                                |
| Theme               | next-themes                           |
| Drag & Drop         | react-dropzone                        |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
git clone https://github.com/yourname/convertiqo.git
cd convertiqo
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with ThemeProvider + Toaster
│   ├── page.tsx            # Main dashboard (single-screen)
│   └── globals.css         # Tailwind + CSS custom properties
├── components/
│   ├── ui/                 # Reusable primitives (Button, Progress, Slider, Badge)
│   ├── upload-zone.tsx     # Drag-and-drop + click-to-browse upload
│   ├── file-card.tsx       # Per-file card with format picker, settings, progress
│   ├── history-panel.tsx   # Recent conversions sidebar
│   └── header.tsx          # App header with logo + theme toggle
├── services/
│   ├── conversion-engine.ts  # Central dispatcher — routes jobs to handlers
│   ├── image-converter.ts    # Canvas-based image conversion
│   ├── pdf-converter.ts      # PDF.js rendering + pdf-lib embedding
│   ├── video-converter.ts    # MediaRecorder + gifenc for video/GIF
│   └── download.ts           # Single file + ZIP download helpers
├── store/
│   └── useFileStore.ts     # Zustand store — queue, history, settings
├── hooks/
│   └── useConversion.ts    # Conversion orchestration hook
├── lib/
│   ├── utils.ts            # cn(), formatBytes(), etc.
│   ├── constants.ts        # MIME maps, format definitions, category detection
│   └── canvas-stub.ts      # Browser stub for pdfjs canvas dependency
└── types/
    ├── index.ts            # All TypeScript types
    └── gifenc.d.ts         # Type declarations for gifenc
```

---

## Conversion Architecture

### Adding a New File Type

1. **Add types** to `src/types/index.ts` (new format union)
2. **Add constants** to `src/lib/constants.ts` (MIME map, accepted types, output formats)
3. **Create a converter** in `src/services/your-converter.ts` implementing `ConversionHandler`
4. **Register it** in `src/services/conversion-engine.ts`

The UI will automatically show the new format options for matching files.

### Conversion Handler Interface

```typescript
interface ConversionHandler {
  canHandle: (item: QueueItem) => boolean;
  convert: (options: ConversionOptions) => Promise<ConversionResult>;
}
```

---

## How Conversion Actually Works

All conversions in Convertiqo run **entirely in the browser** — no backend, no cloud service, no file upload. Here is a detailed technical breakdown of how each conversion pipeline works under the hood.

---

### Image Conversion (any format → JPG / PNG / WebP / AVIF / GIF / BMP / TIFF)

**Pipeline:** `File` → `HTMLImageElement` → `OffscreenCanvas` → `Blob`

1. The source file is loaded as an object URL and decoded by the browser's native image decoder into an `HTMLImageElement`.
2. SVG files are handled specially: the raw SVG text is re-encoded as a `Blob`, loaded into an `<img>` element, and rasterized.
3. The image is drawn onto an HTML5 `<canvas>` at the target resolution. If the user specified width/height, the canvas is sized accordingly; otherwise, the original dimensions are used.
4. For formats that don't support transparency (JPG, BMP), a white background is filled before drawing.
5. `canvas.toBlob(mime, quality)` is called with the target MIME type and quality factor (0–1). The browser's built-in codec encodes the pixel data.
   - JPG/WebP/AVIF use the `quality` parameter for lossy encoding.
   - PNG/GIF/BMP are lossless and ignore the quality value.
6. The resulting `Blob` is wrapped into a `ConversionResult` and made available for download.

**Key constraint:** AVIF encoding requires Chrome 85+. The browser's codec support determines which output formats work.

---

### Image → PDF Embedding

**Pipeline:** `File` → `ArrayBuffer` → `pdf-lib PDFDocument` → `Blob`

1. The image file is read as an `ArrayBuffer`.
2. If the file is JPEG or PNG, it is embedded directly using `pdf-lib`'s `embedJpg()` or `embedPng()` (these are lossless re-embed operations — the pixel data is not re-encoded).
3. For other formats (WebP, GIF, etc.), the image is first drawn to a canvas and exported as PNG, then that PNG buffer is embedded.
4. A PDF page is created with dimensions exactly matching the image's pixel dimensions (1px = 1pt), and the image is placed at (0,0) filling the page.
5. `PDFDocument.save()` outputs the PDF bytes as a `Uint8Array`, which is wrapped in a `Blob`.

---

### PDF → Image Extraction

**Pipeline:** `File` → `ArrayBuffer` → `PDF.js PDFDocumentProxy` → `canvas render` → `Blob(s)`

1. The PDF file is loaded into PDF.js (`pdfjs-dist`) as an `ArrayBuffer`. A Web Worker handles the parsing off the main thread.
2. The page range (e.g. `1-3,5`) is parsed to determine which pages to render.
3. Each page is rendered to an off-screen `<canvas>` at the requested DPI (default 150 DPI; scale factor = DPI / 72 since PDF points are 1/72 inch).
4. `canvas.toBlob()` encodes the rendered page as JPEG or PNG.
5. **Single page:** Returns a single image Blob.
6. **Multiple pages:** All page images are collected and zipped with JSZip, returning a `.zip` archive.

---

### PDF → DOCX (Text Extraction)

**Pipeline:** `File` → `pdfjs` text extraction → `docx` library → `Buffer` → `Blob`

1. PDF.js extracts the text content of each page via `page.getTextContent()`. This returns a flat list of text items with their positions.
2. Text items from each page are joined into a single string, then split into ~100-word chunks to form readable paragraphs.
3. The `docx` library assembles a Word document: a title paragraph, optional page-header separators, and body paragraphs for each chunk.
4. `Packer.toBuffer(doc)` serializes the DOCX XML structure into a binary Buffer using JSZip internally.
5. The buffer is wrapped in a Blob with the `application/vnd.openxmlformats-officedocument.wordprocessingml.document` MIME type.

**Key constraint:** PDF text extraction only captures selectable text. Scanned PDFs (image-only) produce empty documents.

---

### DOCX → PDF Rendering

**Pipeline:** `File` → `mammoth` HTML → `html2canvas` canvas → `jsPDF` PDF → `Blob`

1. `mammoth.convertToHtml({ arrayBuffer })` parses the DOCX's internal XML (Office Open XML format) and converts content to semantic HTML, preserving headings (`<h1>`–`<h6>`), bold, italic, lists, and paragraph structure.
2. The HTML is injected into a hidden off-screen `<div>` styled at A4 width (794px at 96 DPI) with print-appropriate fonts and line height.
3. `html2canvas` renders the entire DOM subtree to a `<canvas>` at 1.5× scale for sharpness, walking the CSS box model and painting each element.
4. The canvas is exported as a JPEG data URL at 92% quality.
5. `jsPDF` creates an A4 PDF document and tiles the canvas image across pages: if the rendered content is taller than one A4 page, additional pages are added automatically using a sliding `position` offset.
6. `pdf.output("arraybuffer")` produces the final PDF bytes.

**Key constraint:** Complex layouts (multi-column text, embedded images, tables with backgrounds, custom fonts) are simplified. The rendering is "what the browser can paint" not a 1:1 DOCX replica.

---

### Video Conversion (MP4 / WebM / MOV / AVI / MKV)

**Pipeline:** `File` → `HTMLVideoElement` → `canvas.captureStream()` → `MediaRecorder` → `Blob`

1. The source video is loaded via an object URL into a hidden `<video>` element. The browser's built-in video decoder handles all supported input formats.
2. A `<canvas>` is created at the target resolution (respecting `maxWidth`/`maxHeight` constraints while preserving aspect ratio).
3. `canvas.captureStream(fps)` creates a `MediaStream` from the canvas's live pixel output.
4. `MediaRecorder` is started on that stream. The target MIME type is negotiated:
   - `video/mp4` is attempted first (supported in Chrome via H.264).
   - If unsupported, falls back to `video/webm` (VP8/VP9, universally supported in modern browsers).
   - MOV/AVI/MKV requests use the same negotiation — the output container is MP4 or WebM; the file is named with the requested extension.
5. A `requestAnimationFrame` loop drives `ctx.drawImage(video, ...)` to paint each decoded video frame onto the canvas in real time.
6. `MediaRecorder.ondataavailable` collects encoded chunks as they are produced.
7. When `video.onended` fires, `MediaRecorder.stop()` is called, and all chunks are assembled into a single `Blob`.

**Key constraint:** Encoding happens in real-time (1× playback speed). A 60-second video takes ~60 seconds to convert. MP4/H.264 output is Chrome-only; Firefox and Safari produce WebM.

---

### Video → GIF

**Pipeline:** `File` → frame seeking → `canvas` pixel capture → `gifenc` palette quantization → `Blob`

1. The video is loaded and the total frame count is computed from `duration × fps` (capped at 24 fps and 30 seconds max).
2. For each frame, `video.currentTime` is set and the browser seeks to that exact timestamp. An `onseeked` promise resolves when the seek completes.
3. `ctx.drawImage(video, ...)` paints the frame, and `ctx.getImageData()` extracts the raw RGBA pixel array.
4. After all frames are captured, `gifenc.quantize(rgba, 256)` performs median-cut color quantization to reduce to a 256-color palette per frame.
5. `gifenc.applyPalette(rgba, palette)` maps each pixel to its nearest palette index.
6. `gif.writeFrame(indexed, width, height, { palette, delay })` encodes the frame into the GIF bitstream using LZW compression.
7. `gif.finish()` finalizes the GIF binary, and the byte array is wrapped in a `Blob` of type `image/gif`.

---

### Audio Extraction (Video → MP3)

**Pipeline:** `File` → `HTMLVideoElement` → `Web Audio API` → `MediaRecorder` → `Blob`

1. The video is loaded (unmuted) into a `<video>` element.
2. An `AudioContext` is created. `createMediaElementSource(video)` taps the video's decoded audio stream as a Web Audio `AudioNode`.
3. `createMediaStreamDestination()` creates a `MediaStream` that captures the audio output.
4. `MediaRecorder` records from that stream using `audio/webm;codecs=opus` (the best losslessly-streamable audio format available in browsers).
5. The video plays at normal speed; the audio is captured in real time.
6. The recorded chunks are assembled into a `Blob`. The file is named `.mp3` for user convenience, but the actual container is WebM/Opus — this is playable in all modern browsers and media players.

**Key constraint:** Browsers cannot encode native MP3 (MPEG Layer 3) because the codec is not exposed via `MediaRecorder`. The output is WebM/Opus, which is perceptually equivalent quality at similar bitrates.

---

### Conversion Engine Dispatch

```
User clicks Convert
       │
       ▼
useConversion.convertItem(item)
       │
       ▼
runConversion(item, onProgress, signal)   ← conversion-engine.ts
       │
       ├─ documentConversionHandler.canHandle(item)?  → DOCX→PDF or PDF→DOCX
       ├─ pdfConversionHandler.canHandle(item)?       → PDF→image or image→PDF
       ├─ imageConversionHandler.canHandle(item)?     → image→image
       └─ videoConversionHandler.canHandle(item)?     → video→video/GIF/MP3
                    │
                    ▼
            handler.convert({ item, onProgress, signal })
                    │
                    ▼
            ConversionResult { blob, filename, outputSize, mimeType }
                    │
                    ▼
            store.setItemResult(id, result)   ← Zustand updates UI
```

Each handler receives an `AbortSignal` — cancel requests propagate through the pipeline, and long-running loops check `signal.aborted` between frames/pages to stop cleanly.

---

## Known Limitations

### Video Conversion

- **MP4 output** on Chrome works well. Safari and Firefox may fall back to WebM because H.264 encoding via `MediaRecorder` is not universally supported.
- **MOV/MKV → MP4**: The browser cannot natively decode MOV/MKV in all cases. Files that the browser can play will be re-encoded; others will show an error.
- **For production-grade video conversion** (guaranteed H.264 MP4, MOV, MKV output), integrate an FFmpeg-based server worker. The service layer is architected for this — replace `videoConversionHandler` with an API-backed handler.

### DOCX → PDF

- Requires a server-side PDF rendering library (e.g. `libreoffice`, `puppeteer`, or a commercial API).
- The service layer is in place. To enable it, add a route handler at `/api/convert/document` and call it from `conversion-engine.ts`.
- Currently returns a friendly error message in the UI.

### AVIF Output

- Requires Chrome 85+ or another browser with AVIF `canvas.toBlob()` support.
- Unsupported browsers will show an error; fallback to WebP or PNG is recommended.

### File Size

- Maximum file size is 200 MB (configurable in `src/lib/constants.ts`).
- Very large images or long videos may be slow due to browser memory constraints.

---

## Environment Variables

No environment variables are required for the base app.

For future server-side integrations (e.g., video conversion API):

```env
# Optional: External video conversion API
NEXT_PUBLIC_VIDEO_API_URL=https://your-api.example.com
VIDEO_API_KEY=your-secret-key
```

---

## Privacy

All file processing happens entirely in the browser using Web APIs (Canvas, MediaRecorder, PDF.js). **No files are sent to any server.** Conversion history is stored only in your browser's localStorage.

---

## License

MIT
