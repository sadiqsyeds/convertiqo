"use client";

import type {
  ConversionHandler,
  ConversionOptions,
  ConversionResult,
  PdfSettings,
  QueueItem,
} from "@/types";

/**
 * PDF → Image conversion using PDF.js (client-side).
 * Renders each page to a canvas and outputs as JPG/PNG.
 * For single-page output, returns the first (or specified) page as an image.
 * For multi-page, returns a ZIP-like approach (handled by the engine).
 *
 * Document → PDF conversion uses pdf-lib for basic text wrapping.
 * Full DOCX→PDF requires a server-side worker (see API route).
 */

// ─── Parse Page Range ─────────────────────────────────────────────────────────

function parsePageRange(range: string, totalPages: number): number[] {
  const pages: number[] = [];
  const parts = range.split(",").map((s) => s.trim());
  for (const part of parts) {
    if (part.includes("-")) {
      const [start, end] = part.split("-").map(Number);
      for (let i = start; i <= Math.min(end, totalPages); i++) {
        if (i >= 1) pages.push(i);
      }
    } else {
      const n = Number(part);
      if (!isNaN(n) && n >= 1 && n <= totalPages) pages.push(n);
    }
  }
  return [...new Set(pages)].sort((a, b) => a - b);
}

// ─── PDF → Images ─────────────────────────────────────────────────────────────

export async function convertPdfToImages(
  item: QueueItem,
  onProgress: (p: number) => void,
  signal?: AbortSignal
): Promise<ConversionResult> {
  const settings = item.settings as PdfSettings;
  const outputFormat = (settings.outputFormat ?? "jpg") as "jpg" | "png";
  const quality = (settings.quality ?? 85) / 100;
  const dpi = settings.dpi ?? 150;
  const scale = dpi / 72; // PDF points → pixels

  onProgress(5);

  // Dynamically import PDF.js to avoid SSR issues
  const pdfjsLib = await import("pdfjs-dist");

  // Set worker source
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url
  ).toString();

  if (signal?.aborted) throw new Error("Cancelled");

  const arrayBuffer = await item.file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;

  onProgress(15);

  let pagesToRender: number[];
  if (settings.pageRange) {
    pagesToRender = parsePageRange(settings.pageRange, totalPages);
    if (pagesToRender.length === 0) {
      throw new Error(
        `Invalid page range: "${settings.pageRange}" (PDF has ${totalPages} pages)`
      );
    }
  } else {
    pagesToRender = Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (signal?.aborted) throw new Error("Cancelled");

  const mime = outputFormat === "png" ? "image/png" : "image/jpeg";
  const ext = outputFormat === "png" ? "png" : "jpg";

  // If only one page, return a single image
  if (pagesToRender.length === 1) {
    const page = await pdf.getPage(pagesToRender[0]);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;

    if (outputFormat === "jpg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    await page.render({ canvasContext: ctx as unknown as CanvasRenderingContext2D, canvas, viewport }).promise;
    onProgress(90);

    const blob = await new Promise<Blob>((res, rej) => {
      canvas.toBlob(
        (b) => (b ? res(b) : rej(new Error("Canvas encode failed"))),
        mime,
        quality
      );
    });

    onProgress(100);

    const baseName = item.name.replace(/\.pdf$/i, "");
    const filename = `${baseName}_page${pagesToRender[0]}.${ext}`;

    return {
      blob,
      filename:
        settings.outputName ||
        (settings.outputName ? `${settings.outputName}.${ext}` : filename),
      outputSize: blob.size,
      mimeType: mime,
      convertedAt: Date.now(),
    };
  }

  // Multiple pages → ZIP
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  const baseName = item.name.replace(/\.pdf$/i, "");

  for (let i = 0; i < pagesToRender.length; i++) {
    if (signal?.aborted) throw new Error("Cancelled");

    const pageNum = pagesToRender[i];
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;

    if (outputFormat === "jpg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    await page.render({ canvasContext: ctx as unknown as CanvasRenderingContext2D, canvas, viewport }).promise;

    const blob = await new Promise<Blob>((res, rej) => {
      canvas.toBlob(
        (b) => (b ? res(b) : rej(new Error("Canvas encode failed"))),
        mime,
        quality
      );
    });

    zip.file(`${baseName}_page${pageNum}.${ext}`, blob);
    onProgress(15 + Math.round((i / pagesToRender.length) * 80));
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  onProgress(100);

  return {
    blob: zipBlob,
    filename: settings.outputName
      ? `${settings.outputName}.zip`
      : `${baseName}_pages.zip`,
    outputSize: zipBlob.size,
    mimeType: "application/zip",
    convertedAt: Date.now(),
  };
}

// ─── Images → PDF ─────────────────────────────────────────────────────────────

export async function convertImagesToPdf(
  item: QueueItem,
  onProgress: (p: number) => void,
  signal?: AbortSignal
): Promise<ConversionResult> {
  const settings = item.settings as PdfSettings;
  onProgress(10);

  const { PDFDocument } = await import("pdf-lib");
  const pdfDoc = await PDFDocument.create();

  if (signal?.aborted) throw new Error("Cancelled");

  const arrayBuffer = await item.file.arrayBuffer();
  const mime = item.file.type;

  let pdfImage;
  if (mime === "image/jpeg" || mime === "image/jpg") {
    pdfImage = await pdfDoc.embedJpg(arrayBuffer);
  } else if (mime === "image/png") {
    pdfImage = await pdfDoc.embedPng(arrayBuffer);
  } else {
    // Convert to PNG first via canvas
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const url = URL.createObjectURL(item.file);
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image for PDF embedding"));
      };
      image.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);

    const pngBlob = await new Promise<Blob>((res, rej) => {
      canvas.toBlob(
        (b) => (b ? res(b) : rej(new Error("PNG encode failed"))),
        "image/png"
      );
    });
    const pngBuffer = await pngBlob.arrayBuffer();
    pdfImage = await pdfDoc.embedPng(pngBuffer);
  }

  onProgress(60);

  const { width, height } = pdfImage;
  const page = pdfDoc.addPage([width, height]);
  page.drawImage(pdfImage, { x: 0, y: 0, width, height });

  onProgress(80);

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });

  onProgress(100);

  const baseName = item.name.replace(/\.[^.]+$/, "");
  return {
    blob,
    filename: settings.outputName || `${baseName}.pdf`,
    outputSize: blob.size,
    mimeType: "application/pdf",
    convertedAt: Date.now(),
  };
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

export const pdfConversionHandler: ConversionHandler = {
  canHandle: (item: QueueItem) => {
    // PDF → image (jpg/png) — excludes docx which is handled by documentConversionHandler
    if (item.category === "pdf" && item.outputFormat !== "docx") return true;
    // image → PDF embedding
    if (item.category === "image" && item.outputFormat === "pdf") return true;
    return false;
  },
  convert: async ({ item, onProgress, signal }: ConversionOptions) => {
    if (item.category === "pdf") {
      return convertPdfToImages(item, onProgress, signal);
    }
    return convertImagesToPdf(item, onProgress, signal);
  },
};
