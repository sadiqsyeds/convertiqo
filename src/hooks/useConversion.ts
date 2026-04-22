"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useFileStore } from "@/store/useFileStore";
import { runConversion } from "@/services/conversion-engine";
import { downloadBlob, downloadAllAsZip } from "@/services/download";
import type { QueueItem } from "@/types";

export function useConversion() {
  const {
    queue,
    setItemStatus,
    setItemProgress,
    setItemResult,
    registerAbortController,
    cancelItem,
    setIsConverting,
  } = useFileStore();

  const convertItem = useCallback(
    async (item: QueueItem) => {
      const ctrl = new AbortController();
      registerAbortController(item.id, ctrl);
      setItemStatus(item.id, "processing");
      setItemProgress(item.id, 0);

      try {
        const result = await runConversion(
          item,
          (progress) => setItemProgress(item.id, progress),
          ctrl.signal
        );

        setItemResult(item.id, result);

        toast.success(`Converted: ${result.filename}`, {
          description: `${(item.originalSize / 1024).toFixed(0)} KB → ${(result.outputSize / 1024).toFixed(0)} KB`,
        });
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Conversion failed";

        if (msg === "Cancelled") {
          setItemStatus(item.id, "cancelled");
          toast.info("Conversion cancelled");
        } else {
          setItemStatus(item.id, "error", msg);
          toast.error(`Failed: ${item.name}`, { description: msg });
        }
      }
    },
    [
      registerAbortController,
      setItemStatus,
      setItemProgress,
      setItemResult,
    ]
  );

  const convertAll = useCallback(async () => {
    const pending = queue.filter(
      (item) =>
        item.status === "idle" ||
        item.status === "cancelled" ||
        item.status === "error"
    );

    if (pending.length === 0) {
      toast.info("No files to convert");
      return;
    }

    setIsConverting(true);

    // Process sequentially to avoid overwhelming the browser
    for (const item of pending) {
      await convertItem(item);
    }

    setIsConverting(false);
    const doneCount = useFileStore
      .getState()
      .queue.filter((q) => q.status === "done").length;

    if (doneCount > 0) {
      toast.success(`${doneCount} file${doneCount > 1 ? "s" : ""} converted`, {
        description: "Click Download All to get your files",
        action: {
          label: "Download All",
          onClick: () => downloadAllAsZip(useFileStore.getState().queue),
        },
      });
    }
  }, [queue, convertItem, setIsConverting]);

  const downloadItem = useCallback((item: QueueItem) => {
    if (!item.result) return;
    downloadBlob(item.result.blob, item.result.filename);
    toast.success(`Downloading ${item.result.filename}`);
  }, []);

  const downloadAll = useCallback(async () => {
    await downloadAllAsZip(queue);
  }, [queue]);

  return {
    convertItem,
    convertAll,
    downloadItem,
    downloadAll,
    cancelItem,
  };
}
