"use client";

import { useState } from "react";
import { useFileStore } from "@/store/useFileStore";
import { useConversion } from "@/hooks/useConversion";
import { useMounted } from "@/hooks/useMounted";
import { Header } from "@/components/header";
import { UploadZone } from "@/components/upload-zone";
import { FileCard } from "@/components/file-card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { FORMAT_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ConversionFormat } from "@/types";
import {
  Download,
  Zap,
  Trash2,
  X,
  Archive,
  LayoutGrid,
  Loader2,
  CheckSquare,
  Square,
  SlidersHorizontal,
} from "lucide-react";

function EmptyQueueState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <LayoutGrid className="h-7 w-7 text-muted-foreground/50" />
      </div>
      <p className="text-sm font-medium text-foreground mb-1">
        Your queue is empty
      </p>
      <p className="text-xs text-muted-foreground max-w-xs">
        Upload files above to get started. Supports images, videos, PDFs, and
        Word documents.
      </p>
    </div>
  );
}

export default function HomePage() {
  const mounted = useMounted();
  const queue = useFileStore((s) => s.queue);
  const isConverting = useFileStore((s) => s.isConverting);
  const clearQueue = useFileStore((s) => s.clearQueue);
  const clearDone = useFileStore((s) => s.clearDone);
  const selectedIds = useFileStore((s) => s.selectedIds);
  const selectAll = useFileStore((s) => s.selectAll);
  const clearSelection = useFileStore((s) => s.clearSelection);
  const bulkUpdateFormat = useFileStore((s) => s.bulkUpdateFormat);
  const bulkUpdateSettings = useFileStore((s) => s.bulkUpdateSettings);
  const bulkRemove = useFileStore((s) => s.bulkRemove);
  const { convertAll, downloadAll } = useConversion();

  const [showBulkQuality, setShowBulkQuality] = useState(false);
  const [bulkQuality, setBulkQuality] = useState(100);

  // Use empty queue on server/before hydration to avoid mismatch
  const activeQueue = mounted ? queue : [];
  const hasFiles = activeQueue.length > 0;
  const pendingCount = activeQueue.filter(
    (q) => q.status === "idle" || q.status === "cancelled" || q.status === "error",
  ).length;
  const doneCount = activeQueue.filter((q) => q.status === "done").length;
  const processingCount = activeQueue.filter((q) => q.status === "processing").length;
  const selectionCount = mounted ? selectedIds.size : 0;
  const allSelected = selectionCount === activeQueue.length && activeQueue.length > 0;
  const hasSelection = selectionCount > 0;
  const hasMultiSelection = selectionCount > 1;

  // Collect formats available across all selected items
  const selectedItems = activeQueue.filter((q) => selectedIds.has(q.id));
  const formatCounts = new Map<string, number>();
  for (const item of selectedItems) {
    for (const f of item.availableFormats) {
      formatCounts.set(f.format, (formatCounts.get(f.format) ?? 0) + 1);
    }
  }
  const bulkFormats = [...formatCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([format]) => format)
    .slice(0, 7);

  const handleApplyBulkQuality = () => {
    bulkUpdateSettings({ quality: bulkQuality });
    setShowBulkQuality(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        {/* Hero headline (shown only when queue is empty) */}
        {!hasFiles && (
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Convert any file, <span className="text-primary">instantly</span>
            </h1>
            <p className="mt-2 text-base text-muted-foreground max-w-lg mx-auto">
              Images, videos, PDFs — converted right in your browser. Private,
              fast, and free.
            </p>
          </div>
        )}

        {/* Upload Zone */}
        <div className="mb-6">
          {hasFiles ? <UploadZone compact /> : <UploadZone />}
        </div>

        {/* Queue toolbar */}
        {hasFiles && (
          <div className="rounded-xl border border-border bg-card px-4 py-3 mb-4 space-y-3">
            {/* Row 1: selection + file count + actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Select all toggle */}
              <button
                onClick={allSelected ? clearSelection : selectAll}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
                title={allSelected ? "Deselect all" : "Select all"}
              >
                {allSelected ? (
                  <CheckSquare className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <Square className="h-3.5 w-3.5" />
                )}
                <span>
                  {hasSelection ? `${selectionCount} selected` : "Select all"}
                </span>
              </button>

              {hasMultiSelection && (
                <>
                  <div className="h-4 w-px bg-border shrink-0" />
                  {/* Bulk format chips — takes all available space */}
                  <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
                    <span className="text-xs text-muted-foreground self-center shrink-0">Format:</span>
                    {bulkFormats.map((format) => {
                      const colorClass = FORMAT_COLORS[format] ?? "bg-secondary text-secondary-foreground";
                      return (
                        <button
                          key={format}
                          onClick={() => bulkUpdateFormat(format as ConversionFormat)}
                          className={cn(
                            "rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wide transition-all",
                            "hover:ring-2 hover:ring-primary hover:ring-offset-1 focus-visible:outline-none",
                            colorClass
                          )}
                          title={`Set all selected to ${format.toUpperCase()}`}
                        >
                          {format}
                        </button>
                      );
                    })}
                  </div>
                  {/* Quality + Remove + Clear — pushed to the right */}
                  <div className="flex items-center gap-2 shrink-0 ml-auto">
                    <button
                      onClick={() => setShowBulkQuality((p) => !p)}
                      className={cn(
                        "flex items-center gap-1 text-xs transition-colors",
                        showBulkQuality ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <SlidersHorizontal className="h-3 w-3" />
                      Quality
                    </button>
                    <div className="h-4 w-px bg-border" />
                    <button
                      onClick={bulkRemove}
                      className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors"
                      title="Remove selected"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </button>
                    <button
                      onClick={clearSelection}
                      className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
                      title="Clear selection"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              )}

              {/* No selection: spacer before file count */}
              {!hasMultiSelection && <div className="flex-1" />}

              {/* File count */}
              <span className="text-sm font-medium text-foreground shrink-0">
                {activeQueue.length} file{activeQueue.length !== 1 ? "s" : ""}
              </span>
              {processingCount > 0 && (
                <span className="flex items-center gap-1 text-xs text-primary shrink-0">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Converting {processingCount}…
                </span>
              )}

              {/* Main action buttons */}
              {pendingCount > 0 && (
                <Button
                  size="sm"
                  onClick={convertAll}
                  disabled={isConverting}
                  className="gap-1.5 font-semibold shrink-0"
                >
                  {isConverting ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" />Converting…</>
                  ) : (
                    <><Zap className="h-3.5 w-3.5" fill="currentColor" />Convert {pendingCount}</>
                  )}
                </Button>
              )}
              {doneCount > 0 && (
                <Button size="sm" variant="outline" onClick={downloadAll} className="gap-1.5 shrink-0">
                  {doneCount > 1 ? (
                    <><Archive className="h-3.5 w-3.5" />Download ZIP</>
                  ) : (
                    <><Download className="h-3.5 w-3.5" />Download</>
                  )}
                </Button>
              )}
              {doneCount > 0 && (
                <Button size="sm" variant="outline" onClick={clearDone} className="gap-1.5 text-xs shrink-0">
                  <X className="h-3 w-3" />Clear done
                </Button>
              )}
              {!isConverting && (
                <Button size="sm" variant="ghost" onClick={clearQueue} className="gap-1.5 text-xs text-muted-foreground shrink-0">
                  <Trash2 className="h-3 w-3" />Clear all
                </Button>
              )}
            </div>

            {/* Row 2: bulk quality slider (only when multi-selection and quality open) */}
            {hasMultiSelection && showBulkQuality && (
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground shrink-0 w-28">
                  Bulk quality ({selectionCount} files)
                </span>
                <Slider
                  min={10}
                  max={100}
                  step={5}
                  value={[bulkQuality]}
                  onValueChange={([v]) => setBulkQuality(v)}
                  className="flex-1"
                />
                <span className="text-xs font-mono w-10 text-right text-muted-foreground">{bulkQuality}%</span>
                <Button size="sm" onClick={handleApplyBulkQuality} className="shrink-0 h-7 text-xs">
                  Apply
                </Button>
                <button
                  onClick={() => setShowBulkQuality(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Queue items or empty state — full width */}
        {!hasFiles ? (
          <EmptyQueueState />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {activeQueue.map((item) => (
              <FileCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 px-6 text-center text-xs text-muted-foreground">
        <p>
          Convertiqo — All conversions happen in your browser. No files are
          uploaded to any server.
        </p>
      </footer>
    </div>
  );
}
