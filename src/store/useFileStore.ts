"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  QueueItem,
  HistoryEntry,
  ConversionResult,
  JobStatus,
  ConversionSettings,
  ConversionFormat,
} from "@/types";
import { generateId, getFileExtension } from "@/lib/utils";
import {
  detectCategory,
  getAvailableFormats,
  getDefaultFormat,
  HISTORY_STORAGE_KEY,
} from "@/lib/constants";

// ─── Default settings per category ───────────────────────────────────────────

function buildDefaultSettings(
  category: string,
  outputFormat: string
): ConversionSettings {
  switch (category) {
    case "image":
      return {
        quality: 100,
        outputFormat: outputFormat as never,
        preserveAspectRatio: true,
      };
    case "video":
      return {
        quality: 100,
        outputFormat: outputFormat as never,
        fps: 30,
      };
    case "pdf":
      return {
        outputFormat: outputFormat as never,
        quality: 100,
        dpi: 150,
      };
    case "document":
      return {
        outputFormat: outputFormat as never,
      };
    default:
      return {
        quality: 100,
        outputFormat: outputFormat as never,
        preserveAspectRatio: true,
      };
  }
}

// ─── Store Shape ──────────────────────────────────────────────────────────────

interface FileStoreState {
  queue: QueueItem[];
  history: HistoryEntry[];
  isConverting: boolean;
  abortControllers: Map<string, AbortController>;
  selectedIds: Set<string>;

  // Queue actions
  addFiles: (files: File[]) => void;
  removeItem: (id: string) => void;
  clearQueue: () => void;
  clearDone: () => void;
  reorderQueue: (from: number, to: number) => void;

  // Selection
  toggleSelect: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  bulkUpdateFormat: (format: ConversionFormat) => void;
  bulkUpdateSettings: (partial: Record<string, unknown>) => void;
  bulkRemove: () => void;

  // Per-item settings
  updateOutputFormat: (id: string, format: ConversionFormat) => void;
  updateSettings: (id: string, settings: Record<string, unknown>) => void;

  // Conversion lifecycle
  setItemStatus: (id: string, status: JobStatus, error?: string) => void;
  setItemProgress: (id: string, progress: number) => void;
  setItemResult: (id: string, result: ConversionResult) => void;

  // Abort / retry
  registerAbortController: (id: string, ctrl: AbortController) => void;
  cancelItem: (id: string) => void;
  retryItem: (id: string) => void;

  // History
  addHistoryEntry: (entry: HistoryEntry) => void;
  clearHistory: () => void;

  // Batch status
  setIsConverting: (val: boolean) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useFileStore = create<FileStoreState>()(
  persist(
    (set, get) => ({
      queue: [],
      history: [],
      isConverting: false,
      abortControllers: new Map(),
      selectedIds: new Set<string>(),

      // ─── Add Files ───────────────────────────────────────────────────────────

      addFiles: (files: File[]) => {
        const existing = get().queue;
        const newItems: QueueItem[] = [];

        for (const file of files) {
          // Deduplicate by name + size
          const isDuplicate = existing.some(
            (q) => q.name === file.name && q.originalSize === file.size
          );
          if (isDuplicate) continue;

          const category = detectCategory(file);
          const ext = getFileExtension(file.name);
          const availableFormats = getAvailableFormats(category, ext);
          const defaultFormat = getDefaultFormat(category, ext);
          const defaultSettings = buildDefaultSettings(category, defaultFormat);

          // Generate preview URL for images
          let previewUrl: string | undefined;
          if (category === "image") {
            previewUrl = URL.createObjectURL(file);
          }

          const item: QueueItem = {
            id: generateId(),
            file,
            name: file.name,
            originalSize: file.size,
            category,
            previewUrl,
            status: "idle",
            progress: 0,
            settings: defaultSettings,
            outputFormat: defaultFormat as ConversionFormat,
            availableFormats,
            addedAt: Date.now(),
          };

          newItems.push(item);
        }

        if (newItems.length > 0) {
          set((state) => ({ queue: [...state.queue, ...newItems] }));
        }
      },

      // ─── Remove ──────────────────────────────────────────────────────────────

      removeItem: (id: string) => {
        const item = get().queue.find((q) => q.id === id);
        if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
        if (item?.result) URL.revokeObjectURL(
          URL.createObjectURL(item.result.blob) // revoke any cached
        );

        const ctrl = get().abortControllers.get(id);
        if (ctrl) ctrl.abort();

        set((state) => {
          const controllers = new Map(state.abortControllers);
          controllers.delete(id);
          return {
            queue: state.queue.filter((q) => q.id !== id),
            abortControllers: controllers,
          };
        });
      },

      clearQueue: () => {
        const { queue } = get();
        queue.forEach((item) => {
          if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        });
        set({ queue: [], abortControllers: new Map() });
      },

      clearDone: () => {
        set((state) => ({
          queue: state.queue.filter(
            (item) => item.status !== "done" && item.status !== "error"
          ),
        }));
      },

      // ─── Reorder ─────────────────────────────────────────────────────────────

      reorderQueue: (from: number, to: number) => {
        set((state) => {
          const next = [...state.queue];
          const [moved] = next.splice(from, 1);
          next.splice(to, 0, moved);
          return { queue: next };
        });
      },

      // ─── Settings ────────────────────────────────────────────────────────────

      updateOutputFormat: (id: string, format: ConversionFormat) => {
        set((state) => ({
          queue: state.queue.map((item) => {
            if (item.id !== id) return item;
            const newSettings = buildDefaultSettings(item.category, format);
            return {
              ...item,
              outputFormat: format,
              settings: { ...newSettings, outputFormat: format as never },
              status: "idle",
              progress: 0,
              result: undefined,
              error: undefined,
            };
          }),
        }));
      },

      updateSettings: (id: string, partial: Record<string, unknown>) => {
        set((state) => ({
          queue: state.queue.map((item) =>
            item.id === id
              ? { ...item, settings: { ...item.settings, ...partial } as ConversionSettings }
              : item
          ),
        }));
      },

      // ─── Conversion Lifecycle ─────────────────────────────────────────────

      setItemStatus: (id: string, status: JobStatus, error?: string) => {
        set((state) => ({
          queue: state.queue.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status,
                  error: error ?? item.error,
                  progress: status === "error" ? 0 : item.progress,
                }
              : item
          ),
        }));
      },

      setItemProgress: (id: string, progress: number) => {
        set((state) => ({
          queue: state.queue.map((item) =>
            item.id === id ? { ...item, progress } : item
          ),
        }));
      },

      setItemResult: (id: string, result: ConversionResult) => {
        set((state) => ({
          queue: state.queue.map((item) =>
            item.id === id
              ? { ...item, status: "done", progress: 100, result }
              : item
          ),
        }));
      },

      // ─── Abort / Retry ───────────────────────────────────────────────────────

      registerAbortController: (id: string, ctrl: AbortController) => {
        set((state) => {
          const controllers = new Map(state.abortControllers);
          controllers.set(id, ctrl);
          return { abortControllers: controllers };
        });
      },

      cancelItem: (id: string) => {
        const ctrl = get().abortControllers.get(id);
        if (ctrl) ctrl.abort();
        set((state) => {
          const controllers = new Map(state.abortControllers);
          controllers.delete(id);
          return {
            queue: state.queue.map((item) =>
              item.id === id
                ? { ...item, status: "cancelled", progress: 0 }
                : item
            ),
            abortControllers: controllers,
          };
        });
      },

      retryItem: (id: string) => {
        set((state) => ({
          queue: state.queue.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: "idle",
                  progress: 0,
                  result: undefined,
                  error: undefined,
                }
              : item
          ),
        }));
      },

      // ─── History ─────────────────────────────────────────────────────────────

      addHistoryEntry: (entry: HistoryEntry) => {
        set((state) => ({
          history: [entry, ...state.history].slice(0, 50), // keep last 50
        }));
      },

      clearHistory: () => set({ history: [] }),

      // ─── Selection ────────────────────────────────────────────────────────────

      toggleSelect: (id: string) => {
        set((state) => {
          const next = new Set(state.selectedIds);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return { selectedIds: next };
        });
      },

      selectAll: () => {
        const ids = get().queue.map((q) => q.id);
        set({ selectedIds: new Set(ids) });
      },

      clearSelection: () => set({ selectedIds: new Set<string>() }),

      bulkUpdateFormat: (format: ConversionFormat) => {
        const { selectedIds } = get();
        set((state) => ({
          queue: state.queue.map((item) => {
            if (!selectedIds.has(item.id)) return item;
            // Only update if the format is available for this item's category
            const isAvailable = item.availableFormats.some((f) => f.format === format);
            if (!isAvailable) return item;
            const newSettings = buildDefaultSettings(item.category, format);
            return {
              ...item,
              outputFormat: format,
              settings: { ...newSettings, outputFormat: format as never },
              status: "idle",
              progress: 0,
              result: undefined,
              error: undefined,
            };
          }),
        }));
      },

      bulkUpdateSettings: (partial: Record<string, unknown>) => {
        const { selectedIds } = get();
        set((state) => ({
          queue: state.queue.map((item) =>
            selectedIds.has(item.id)
              ? { ...item, settings: { ...item.settings, ...partial } as ConversionSettings }
              : item
          ),
        }));
      },

      bulkRemove: () => {
        const { selectedIds, queue } = get();
        queue.forEach((item) => {
          if (!selectedIds.has(item.id)) return;
          if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        });
        set((state) => ({
          queue: state.queue.filter((item) => !selectedIds.has(item.id)),
          selectedIds: new Set<string>(),
        }));
      },

      // ─── Batch ───────────────────────────────────────────────────────────────

      setIsConverting: (val: boolean) => set({ isConverting: val }),
    }),
    {
      name: HISTORY_STORAGE_KEY,
      // Only persist history — queue and abort controllers are session-only
      partialize: (state) => ({ history: state.history }),
    }
  )
);
