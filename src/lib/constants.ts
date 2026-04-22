import type { FileCategory, FormatOption } from "@/types";

// ─── File Size Limits ──────────────────────────────────────────────────────────

export const MAX_FILE_SIZE_MB = 200;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const MAX_FILES_IN_QUEUE = 20;

// ─── MIME Type Maps ───────────────────────────────────────────────────────────

export const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "image/bmp": "bmp",
  "image/tiff": "tiff",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "video/x-matroska": "mkv",
  "video/avi": "avi",
  "video/x-msvideo": "avi",
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
};

export const EXTENSION_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  bmp: "image/bmp",
  tiff: "image/tiff",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  mkv: "video/x-matroska",
  avi: "video/x-msvideo",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

// ─── Accepted MIME Types ──────────────────────────────────────────────────────

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/bmp",
  "image/tiff",
  "image/svg+xml",
];

export const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  "video/avi",
  "video/x-msvideo",
];

export const ACCEPTED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const ALL_ACCEPTED_TYPES = [
  ...ACCEPTED_IMAGE_TYPES,
  ...ACCEPTED_VIDEO_TYPES,
  ...ACCEPTED_DOCUMENT_TYPES,
];

// ─── Category Detection ───────────────────────────────────────────────────────

export function detectCategory(file: File): FileCategory {
  const mime = file.type.toLowerCase();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (
    ACCEPTED_IMAGE_TYPES.includes(mime) ||
    ["jpg", "jpeg", "png", "webp", "avif", "gif", "bmp", "tiff", "svg"].includes(ext)
  ) {
    return "image";
  }
  if (
    ACCEPTED_VIDEO_TYPES.includes(mime) ||
    ["mp4", "webm", "mov", "mkv", "avi"].includes(ext)
  ) {
    return "video";
  }
  if (mime === "application/pdf" || ext === "pdf") {
    return "pdf";
  }
  if (
    ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(mime) ||
    ["doc", "docx"].includes(ext)
  ) {
    return "document";
  }
  return "unknown";
}

// ─── Available Output Formats ─────────────────────────────────────────────────

export const IMAGE_OUTPUT_FORMATS: FormatOption[] = [
  { format: "jpg", label: "JPG", description: "Best for photos" },
  { format: "png", label: "PNG", description: "Lossless with transparency" },
  { format: "webp", label: "WebP", description: "Modern web format" },
  { format: "avif", label: "AVIF", description: "Next-gen compression" },
  { format: "gif", label: "GIF", description: "Animated images" },
  { format: "bmp", label: "BMP", description: "Uncompressed bitmap" },
  { format: "tiff", label: "TIFF", description: "High quality print" },
];

export const VIDEO_OUTPUT_FORMATS: FormatOption[] = [
  { format: "mp4", label: "MP4", description: "Universal compatibility" },
  { format: "webm", label: "WebM", description: "Web-optimized" },
  { format: "gif", label: "GIF", description: "Animated (short clips)" },
];

export const PDF_OUTPUT_FORMATS: FormatOption[] = [
  { format: "jpg", label: "JPG", description: "Page as JPEG image" },
  { format: "png", label: "PNG", description: "Page as PNG image" },
  { format: "docx", label: "DOCX", description: "Word document (text extraction)" },
];

export const DOCUMENT_OUTPUT_FORMATS: FormatOption[] = [
  { format: "pdf", label: "PDF", description: "Portable Document Format" },
];

export function getAvailableFormats(category: FileCategory, currentExt: string): FormatOption[] {
  switch (category) {
    case "image":
      return IMAGE_OUTPUT_FORMATS.filter((f) => f.format !== currentExt);
    case "video":
      return VIDEO_OUTPUT_FORMATS.filter((f) => f.format !== currentExt);
    case "pdf":
      return PDF_OUTPUT_FORMATS;
    case "document":
      return DOCUMENT_OUTPUT_FORMATS;
    default:
      return [];
  }
}

export function getDefaultFormat(
  category: FileCategory,
  currentExt: string
): string {
  const formats = getAvailableFormats(category, currentExt);
  if (formats.length === 0) return currentExt;

  switch (category) {
    case "image":
      // Default to webp for most, jpg if source is svg
      if (currentExt === "svg") return "png";
      const webp = formats.find((f) => f.format === "webp");
      return webp ? "webp" : formats[0].format;
    case "video":
      const mp4 = formats.find((f) => f.format === "mp4");
      return mp4 ? "mp4" : formats[0].format;
    case "pdf":
      return "jpg";
    case "document":
      return "pdf";
    default:
      return formats[0]?.format ?? currentExt;
  }
}

// ─── Format Labels ────────────────────────────────────────────────────────────

export const FORMAT_COLORS: Record<string, string> = {
  jpg: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  jpeg: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  png: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  webp: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  avif: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  gif: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  bmp: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  tiff: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  svg: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  mp4: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  webm: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  mov: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  mkv: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  avi: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  pdf: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  docx: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  doc: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
};

// ─── Category Icons (lucide names) ────────────────────────────────────────────

export const CATEGORY_ICON: Record<FileCategory, string> = {
  image: "Image",
  video: "Video",
  pdf: "FileText",
  document: "FileType",
  unknown: "File",
};

// ─── Local Storage Keys ───────────────────────────────────────────────────────

export const HISTORY_STORAGE_KEY = "fileforge_history";
export const SETTINGS_STORAGE_KEY = "fileforge_settings";
