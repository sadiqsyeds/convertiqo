/**
 * SEO configuration for Convertino.
 * Centralizes all site-wide SEO constants and per-page metadata.
 */

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://convertino.app";
export const SITE_NAME = "Convertino";
export const SITE_TAGLINE = "Convert anything. Instantly.";
export const SITE_DESCRIPTION =
  "Convert images, videos, PDFs, and documents instantly. Fast, secure, and free online file converter. No upload, no sign-up — everything runs in your browser.";

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";
export const GSC_VERIFICATION = process.env.NEXT_PUBLIC_GSC_VERIFICATION ?? "";

// ─── OG Image dimensions (required for rich previews) ────────────────────────
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

// ─── Tool Pages ───────────────────────────────────────────────────────────────

export interface ToolPage {
  slug: string;
  title: string;           // < 60 chars — used in <title>
  description: string;     // < 160 chars — used in meta description
  ogTitle: string;         // Short punchy title for OG cards
  ogDescription: string;   // Short description for OG cards (< 100 chars ideal)
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
    ogTitle: "Free Online Image Converter",
    ogDescription: "Convert JPG, PNG, WebP, AVIF, GIF, BMP & TIFF instantly. Free, private, browser-based.",
    h1: "Free Online Image Converter",
    keywords: ["image converter", "convert image online", "jpg to png", "webp converter", "avif converter"],
  },
  {
    slug: "video-converter",
    title: "Video Converter – Free Online | Convertino",
    description: "Convert MP4, WebM, MOV, AVI, MKV videos online for free. No watermarks, no account required. Fast browser-based conversion.",
    ogTitle: "Free Online Video Converter",
    ogDescription: "Convert MP4, WebM, MOV, AVI & MKV videos free. No watermark, no account needed.",
    h1: "Free Online Video Converter",
    keywords: ["video converter online", "mp4 converter", "convert video free", "webm converter", "mov to mp4"],
  },
  {
    slug: "pdf-converter",
    title: "PDF Converter – JPG, PNG, Word | Convertino",
    description: "Convert PDF to JPG, PNG, or Word DOCX online for free. Extract pages, set DPI, and download results instantly.",
    ogTitle: "Free PDF Converter",
    ogDescription: "Convert PDF to JPG, PNG or Word DOCX free online. Extract pages instantly.",
    h1: "Free Online PDF Converter",
    keywords: ["pdf converter", "pdf to jpg", "pdf to png", "pdf to word", "convert pdf online"],
  },
  {
    slug: "word-to-pdf",
    title: "Word to PDF Converter – Free Online | Convertino",
    description: "Convert DOCX and DOC files to PDF instantly in your browser. No upload, no account. Free Word to PDF conversion.",
    ogTitle: "Word to PDF – Free Converter",
    ogDescription: "Convert DOCX to PDF instantly in your browser. No upload, no account required.",
    h1: "Word to PDF Converter – Free & Instant",
    keywords: ["word to pdf", "docx to pdf", "convert word to pdf online", "doc to pdf free"],
    inputFormat: "DOCX",
    outputFormat: "PDF",
  },
  {
    slug: "pdf-to-word",
    title: "PDF to Word Converter – Free Online | Convertino",
    description: "Convert PDF files to editable Word DOCX documents free online. Extract text content from any PDF instantly.",
    ogTitle: "PDF to Word – Free Converter",
    ogDescription: "Convert PDF to editable Word DOCX free online. Extract text from any PDF instantly.",
    h1: "PDF to Word Converter – Free & Instant",
    keywords: ["pdf to word", "pdf to docx", "convert pdf to word online", "pdf to doc free"],
    inputFormat: "PDF",
    outputFormat: "DOCX",
  },
  {
    slug: "jpg-to-png",
    title: "JPG to PNG Converter – Free Online | Convertino",
    description: "Convert JPG images to PNG format free online. Lossless conversion with transparency support. Instant, no upload.",
    ogTitle: "JPG to PNG – Free Converter",
    ogDescription: "Convert JPG to PNG free online. Lossless quality, transparency support, instant results.",
    h1: "JPG to PNG Converter – Free & Lossless",
    keywords: ["jpg to png", "jpeg to png", "convert jpg to png online", "jpg png converter free"],
    inputFormat: "JPG",
    outputFormat: "PNG",
  },
  {
    slug: "png-to-webp",
    title: "PNG to WebP Converter – Free Online | Convertino",
    description: "Convert PNG images to WebP format for faster web loading. Free online PNG to WebP converter with quality control.",
    ogTitle: "PNG to WebP – Free Converter",
    ogDescription: "Convert PNG to WebP for faster web performance. Free, instant, quality control included.",
    h1: "PNG to WebP Converter – Optimize for Web",
    keywords: ["png to webp", "convert png to webp", "webp converter online", "optimize images webp"],
    inputFormat: "PNG",
    outputFormat: "WebP",
  },
  {
    slug: "compress-image",
    title: "Compress Images Online – Free | Convertino",
    description: "Compress JPG, PNG, WebP images online for free. Reduce file size while keeping quality. No upload, works in browser.",
    ogTitle: "Free Image Compressor",
    ogDescription: "Compress JPG, PNG & WebP images free online. Reduce file size without losing quality.",
    h1: "Image Compressor – Reduce File Size Free",
    keywords: ["compress image online", "reduce image file size", "image compressor free", "jpg compressor", "png compressor"],
  },
  {
    slug: "compress-video",
    title: "Compress Video Online – Free | Convertino",
    description: "Compress MP4, WebM, MOV videos online for free. Reduce video file size with quality control. Browser-based, private.",
    ogTitle: "Free Video Compressor",
    ogDescription: "Compress MP4, WebM & MOV videos free online. Reduce file size with quality control.",
    h1: "Video Compressor – Reduce Size Free Online",
    keywords: ["compress video online", "reduce video file size", "video compressor free", "mp4 compressor"],
  },
];

export function getToolPage(slug: string): ToolPage | undefined {
  return TOOL_PAGES.find((p) => p.slug === slug);
}

/**
 * Build complete OpenGraph metadata for a tool page.
 * Always uses absolute URLs — required by WhatsApp, Facebook, LinkedIn.
 */
export function buildToolMetadata(slug: string) {
  const page = getToolPage(slug);
  if (!page) return {};

  const url = `${SITE_URL}/${slug}`;
  const ogImageUrl = `${SITE_URL}/${slug}/opengraph-image`;

  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: page.ogTitle,
      description: page.ogDescription,
      url,
      type: "website" as const,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImageUrl,
          width: OG_WIDTH,
          height: OG_HEIGHT,
          alt: `${page.ogTitle} – ${SITE_NAME}`,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: page.ogTitle,
      description: page.ogDescription,
      images: [ogImageUrl],
    },
  };
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
