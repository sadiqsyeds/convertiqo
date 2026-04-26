/**
 * SEO configuration for Convertino.
 * Centralizes all site-wide SEO constants and per-page metadata.
 */

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://convertino.app";
export const SITE_NAME = "Convertino";
export const SITE_TAGLINE = "Free Online File Converter – Images, Videos, PDFs";
export const SITE_DESCRIPTION =
  "Convert images, videos, and PDFs instantly in your browser. No upload, no sign-up. Free JPG to PNG, PDF to Word, MP4 to WebM, and 50+ more conversions.";

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";
export const GSC_VERIFICATION = process.env.NEXT_PUBLIC_GSC_VERIFICATION ?? "";

// ─── Tool Pages ───────────────────────────────────────────────────────────────

export interface ToolPage {
  slug: string;
  title: string;           // < 60 chars
  description: string;     // < 160 chars
  h1: string;
  keywords: string[];
  inputFormat?: string;
  outputFormat?: string;
}

export const TOOL_PAGES: ToolPage[] = [
  {
    slug: "image-converter",
    title: "Image Converter – Free Online | Convertino",
    description: "Convert images between JPG, PNG, WebP, AVIF, GIF, SVG, BMP and TIFF formats instantly. Free, private, no upload needed.",
    h1: "Free Online Image Converter",
    keywords: ["image converter", "convert image online", "jpg to png", "webp converter", "avif converter"],
  },
  {
    slug: "video-converter",
    title: "Video Converter – Free Online | Convertino",
    description: "Convert MP4, WebM, MOV, AVI, MKV videos online for free. No watermarks, no account required. Fast browser-based conversion.",
    h1: "Free Online Video Converter",
    keywords: ["video converter online", "mp4 converter", "convert video free", "webm converter", "mov to mp4"],
  },
  {
    slug: "pdf-converter",
    title: "PDF Converter – JPG, PNG, Word | Convertino",
    description: "Convert PDF to JPG, PNG, or Word DOCX online for free. Extract pages, set DPI, and download results instantly.",
    h1: "Free Online PDF Converter",
    keywords: ["pdf converter", "pdf to jpg", "pdf to png", "pdf to word", "convert pdf online"],
  },
  {
    slug: "word-to-pdf",
    title: "Word to PDF Converter – Free Online | Convertino",
    description: "Convert DOCX and DOC files to PDF instantly in your browser. No upload, no account. Free Word to PDF conversion.",
    h1: "Word to PDF Converter – Free & Instant",
    keywords: ["word to pdf", "docx to pdf", "convert word to pdf online", "doc to pdf free"],
    inputFormat: "DOCX",
    outputFormat: "PDF",
  },
  {
    slug: "pdf-to-word",
    title: "PDF to Word Converter – Free Online | Convertino",
    description: "Convert PDF files to editable Word DOCX documents free online. Extract text content from any PDF instantly.",
    h1: "PDF to Word Converter – Free & Instant",
    keywords: ["pdf to word", "pdf to docx", "convert pdf to word online", "pdf to doc free"],
    inputFormat: "PDF",
    outputFormat: "DOCX",
  },
  {
    slug: "jpg-to-png",
    title: "JPG to PNG Converter – Free Online | Convertino",
    description: "Convert JPG images to PNG format free online. Lossless conversion with transparency support. Instant, no upload.",
    h1: "JPG to PNG Converter – Free & Lossless",
    keywords: ["jpg to png", "jpeg to png", "convert jpg to png online", "jpg png converter free"],
    inputFormat: "JPG",
    outputFormat: "PNG",
  },
  {
    slug: "png-to-webp",
    title: "PNG to WebP Converter – Free Online | Convertino",
    description: "Convert PNG images to WebP format for faster web loading. Free online PNG to WebP converter with quality control.",
    h1: "PNG to WebP Converter – Optimize for Web",
    keywords: ["png to webp", "convert png to webp", "webp converter online", "optimize images webp"],
    inputFormat: "PNG",
    outputFormat: "WebP",
  },
  {
    slug: "compress-image",
    title: "Compress Images Online – Free | Convertino",
    description: "Compress JPG, PNG, WebP images online for free. Reduce file size while keeping quality. No upload, works in browser.",
    h1: "Image Compressor – Reduce File Size Free",
    keywords: ["compress image online", "reduce image file size", "image compressor free", "jpg compressor", "png compressor"],
  },
  {
    slug: "compress-video",
    title: "Compress Video Online – Free | Convertino",
    description: "Compress MP4, WebM, MOV videos online for free. Reduce video file size with quality control. Browser-based, private.",
    h1: "Video Compressor – Reduce Size Free Online",
    keywords: ["compress video online", "reduce video file size", "video compressor free", "mp4 compressor"],
  },
];

export function getToolPage(slug: string): ToolPage | undefined {
  return TOOL_PAGES.find((p) => p.slug === slug);
}

// ─── Related Tool Suggestions ─────────────────────────────────────────────────

export const RELATED_TOOLS: Record<string, string[]> = {
  "image-converter": ["jpg-to-png", "png-to-webp", "compress-image", "pdf-converter"],
  "video-converter": ["compress-video", "image-converter"],
  "pdf-converter": ["word-to-pdf", "pdf-to-word", "image-converter"],
  "word-to-pdf": ["pdf-to-word", "pdf-converter"],
  "pdf-to-word": ["word-to-pdf", "pdf-converter"],
  "jpg-to-png": ["png-to-webp", "compress-image", "image-converter"],
  "png-to-webp": ["jpg-to-png", "compress-image", "image-converter"],
  "compress-image": ["image-converter", "jpg-to-png", "png-to-webp"],
  "compress-video": ["video-converter"],
};
