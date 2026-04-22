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
git clone https://github.com/yourname/fileforge.git
cd fileforge
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
