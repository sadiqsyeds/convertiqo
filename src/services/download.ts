"use client";

import type { QueueItem } from "@/types";

/**
 * Download service – handles single file and batch ZIP downloads.
 */

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Short delay before revoking so the browser has time to start the download
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export async function downloadAllAsZip(items: QueueItem[]): Promise<void> {
  const doneItems = items.filter(
    (item) => item.status === "done" && item.result
  );
  if (doneItems.length === 0) return;

  // Single file — skip zip
  if (doneItems.length === 1) {
    const item = doneItems[0];
    if (item.result) {
      downloadBlob(item.result.blob, item.result.filename);
    }
    return;
  }

  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();

  // Track used filenames to avoid collisions
  const usedNames = new Map<string, number>();

  for (const item of doneItems) {
    if (!item.result) continue;

    let filename = item.result.filename;
    const count = usedNames.get(filename) ?? 0;
    if (count > 0) {
      const ext = filename.split(".").pop() ?? "";
      const base = filename.slice(0, filename.lastIndexOf("."));
      filename = `${base}_${count}.${ext}`;
    }
    usedNames.set(item.result.filename, count + 1);

    zip.file(filename, item.result.blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  downloadBlob(zipBlob, "fileforge_results.zip");
}
