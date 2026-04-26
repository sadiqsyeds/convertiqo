// ─── File Categories ──────────────────────────────────────────────────────────

export type FileCategory = "image" | "video" | "pdf" | "document" | "unknown";

// ─── Conversion Formats ───────────────────────────────────────────────────────

export type ImageFormat =
  | "jpg"
  | "jpeg"
  | "png"
  | "webp"
  | "avif"
  | "gif"
  | "bmp"
  | "tiff"
  | "svg";

export type VideoFormat = "mp4" | "webm" | "mov" | "mkv" | "avi" | "gif" | "mp3";

export type DocumentFormat = "pdf" | "docx" | "doc" | "png" | "jpg";

export type ConversionFormat = ImageFormat | VideoFormat | DocumentFormat;

// ─── Queue & Job Status ──────────────────────────────────────────────────────

export type JobStatus =
  | "idle"
  | "queued"
  | "processing"
  | "done"
  | "error"
  | "cancelled";

// ─── Conversion Settings ─────────────────────────────────────────────────────

export interface ImageSettings {
  quality: number; // 1–100
  outputFormat: ImageFormat;
  outputName?: string;
  maxWidth?: number;
  maxHeight?: number;
  preserveAspectRatio: boolean;
}

export interface VideoSettings {
  quality: number; // 1–51 (CRF) mapped to 0-100 UI
  outputFormat: VideoFormat;
  outputName?: string;
  maxWidth?: number;
  maxHeight?: number;
  fps?: number;
}

export interface PdfSettings {
  outputFormat: DocumentFormat;
  outputName?: string;
  pageRange?: string; // e.g. "1-3,5"
  quality?: number; // for image output
  dpi?: number; // for image output
}

export type ConversionSettings = ImageSettings | VideoSettings | PdfSettings;

// ─── Queue Item ───────────────────────────────────────────────────────────────

export interface FormatOption {
  format: ConversionFormat;
  label: string;
  description?: string;
}

export interface QueueItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  category: FileCategory;
  previewUrl?: string;
  status: JobStatus;
  progress: number; // 0–100
  settings: ConversionSettings;
  outputFormat: ConversionFormat;
  availableFormats: FormatOption[];
  result?: ConversionResult;
  error?: string;
  addedAt: number;
}

// ─── Conversion Result ────────────────────────────────────────────────────────

export interface ConversionResult {
  blob: Blob;
  filename: string;
  outputSize: number;
  mimeType: string;
  convertedAt: number;
}

// ─── History Entry ────────────────────────────────────────────────────────────

export interface HistoryEntry {
  id: string;
  originalName: string;
  outputName: string;
  originalSize: number;
  outputSize: number;
  category: FileCategory;
  inputFormat: string;
  outputFormat: string;
  convertedAt: number;
  downloadUrl?: string; // revoked after session
}

// ─── Validation ───────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ─── Conversion Engine ────────────────────────────────────────────────────────

export interface ConversionOptions {
  item: QueueItem;
  onProgress: (progress: number) => void;
  signal?: AbortSignal;
}

export interface ConversionHandler {
  canHandle: (item: QueueItem) => boolean;
  convert: (options: ConversionOptions) => Promise<ConversionResult>;
}
