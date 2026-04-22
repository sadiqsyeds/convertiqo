"use client";

import type {
  ConversionHandler,
  ConversionOptions,
  ConversionResult,
  ImageSettings,
  QueueItem,
} from "@/types";
import { replaceExtension } from "@/lib/utils";
import { EXTENSION_TO_MIME } from "@/lib/constants";

/**
 * Browser-based image conversion using Canvas API.
 * Supports: jpg, png, webp, avif, gif, bmp, tiff → jpg, png, webp, avif, gif, bmp.
 * SVG is handled specially – rasterize via Image element.
 * AVIF output depends on browser support (Chrome 85+).
 */

function getMimeForFormat(format: string): string {
  return EXTENSION_TO_MIME[format] ?? "image/png";
}

async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

async function loadSvgAsImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const svgStr = e.target?.result as string;
      const blob = new Blob([svgStr], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load SVG"));
      };
      img.src = url;
    };
    reader.onerror = () => reject(new Error("Failed to read SVG file"));
    reader.readAsText(file);
  });
}

export async function convertImage(
  item: QueueItem,
  onProgress: (p: number) => void,
  signal?: AbortSignal
): Promise<ConversionResult> {
  const settings = item.settings as ImageSettings;
  const outputFormat = settings.outputFormat;
  const quality = settings.quality / 100; // Canvas expects 0–1

  onProgress(10);
  if (signal?.aborted) throw new Error("Cancelled");

  // Load image
  let img: HTMLImageElement;
  const ext = item.name.split(".").pop()?.toLowerCase() ?? "";

  if (ext === "svg" || item.file.type === "image/svg+xml") {
    img = await loadSvgAsImage(item.file);
  } else {
    img = await loadImageFromFile(item.file);
  }

  onProgress(40);
  if (signal?.aborted) throw new Error("Cancelled");

  // Compute output dimensions
  let { width, height } = img;
  const maxW = settings.maxWidth;
  const maxH = settings.maxHeight;

  if (maxW && maxH) {
    if (settings.preserveAspectRatio) {
      // Fit within the box, keeping aspect ratio
      const ratio = Math.min(maxW / width, maxH / height);
      if (ratio < 1) {
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
    } else {
      // Exact pixel dimensions — stretch/crop to fit
      width = maxW;
      height = maxH;
    }
  } else if (maxW && !maxH) {
    if (settings.preserveAspectRatio) {
      if (width > maxW) {
        height = Math.round((height * maxW) / width);
        width = maxW;
      }
    } else {
      width = maxW;
    }
  } else if (maxH && !maxW) {
    if (settings.preserveAspectRatio) {
      if (height > maxH) {
        width = Math.round((width * maxH) / height);
        height = maxH;
      }
    } else {
      height = maxH;
    }
  }

  onProgress(60);
  if (signal?.aborted) throw new Error("Cancelled");

  // Draw on canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");

  // Fill white background for formats that don't support transparency
  if (["jpg", "jpeg", "bmp"].includes(outputFormat)) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(img, 0, 0, width, height);

  onProgress(80);
  if (signal?.aborted) throw new Error("Cancelled");

  const mime = getMimeForFormat(outputFormat === "jpg" ? "jpeg" : outputFormat);

  // toBlob is async
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error(`Failed to encode as ${outputFormat}`));
      },
      mime,
      // quality only applies to lossy formats
      ["jpg", "jpeg", "webp", "avif"].includes(outputFormat) ? quality : undefined
    );
  });

  onProgress(100);

  const outputName =
    settings.outputName ||
    replaceExtension(item.name, outputFormat === "jpeg" ? "jpg" : outputFormat);

  return {
    blob,
    filename: outputName,
    outputSize: blob.size,
    mimeType: mime,
    convertedAt: Date.now(),
  };
}

export const imageConversionHandler: ConversionHandler = {
  canHandle: (item: QueueItem) => item.category === "image",
  convert: async ({ item, onProgress, signal }: ConversionOptions) =>
    convertImage(item, onProgress, signal),
};
