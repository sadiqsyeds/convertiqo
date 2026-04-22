"use client";

import type {
  ConversionHandler,
  ConversionResult,
  QueueItem,
} from "@/types";
import { imageConversionHandler } from "./image-converter";
import { pdfConversionHandler } from "./pdf-converter";
import { videoConversionHandler } from "./video-converter";
import { documentConversionHandler } from "./document-converter";

/**
 * Central conversion engine.
 * Registers all handlers and dispatches conversion jobs to the right handler.
 * Adding a new file type = registering a new ConversionHandler here.
 */

const handlers: ConversionHandler[] = [
  documentConversionHandler,  // DOCX→PDF and PDF→DOCX — must come first to catch pdf→docx
  pdfConversionHandler,       // PDF→image; must come before imageConversionHandler for image→pdf
  imageConversionHandler,
  videoConversionHandler,
];

export async function runConversion(
  item: QueueItem,
  onProgress: (progress: number) => void,
  signal?: AbortSignal
): Promise<ConversionResult> {
  const handler = handlers.find((h) => h.canHandle(item));

  if (!handler) {
    throw new Error(
      `No conversion handler found for file type: ${item.category} → ${item.outputFormat}`
    );
  }

  return handler.convert({ item, onProgress, signal });
}

export function canConvert(item: QueueItem): boolean {
  return handlers.some((h) => h.canHandle(item));
}
