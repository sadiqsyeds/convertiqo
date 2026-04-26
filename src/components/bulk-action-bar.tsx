"use client";

import { useState } from "react";
import { X, Trash2, Zap, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { FORMAT_COLORS } from "@/lib/constants";
import { useFileStore } from "@/store/useFileStore";
import { useConversion } from "@/hooks/useConversion";
import { cn } from "@/lib/utils";
import type { ConversionFormat } from "@/types";

/**
 * Floating bulk-action bar that appears when files are selected.
 * Shows the count, allows bulk format change, quality change, convert, and delete.
 */

export function BulkActionBar() {
  const selectedIds = useFileStore((s) => s.selectedIds);
  const queue = useFileStore((s) => s.queue);
  const clearSelection = useFileStore((s) => s.clearSelection);
  const selectAll = useFileStore((s) => s.selectAll);
  const bulkUpdateFormat = useFileStore((s) => s.bulkUpdateFormat);
  const bulkUpdateSettings = useFileStore((s) => s.bulkUpdateSettings);
  const bulkRemove = useFileStore((s) => s.bulkRemove);
  const { convertAll } = useConversion();

  const [showQuality, setShowQuality] = useState(false);
  const [quality, setQuality] = useState(100);

  const count = selectedIds.size;
  const total = queue.length;
  const allSelected = count === total && total > 0;

  if (count === 0) return null;

  // Collect all unique formats available across selected items
  const selectedItems = queue.filter((q) => selectedIds.has(q.id));
  const formatCounts = new Map<string, number>();
  for (const item of selectedItems) {
    for (const f of item.availableFormats) {
      formatCounts.set(f.format, (formatCounts.get(f.format) ?? 0) + 1);
    }
  }
  // Show formats available in at least 1 selected item, sorted by frequency
  const availableFormats = [...formatCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([format]) => format);

  const handleApplyQuality = () => {
    bulkUpdateSettings({ quality });
    setShowQuality(false);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-black/10 dark:shadow-black/40 backdrop-blur-sm">
        {/* Main row */}
        <div className="flex items-center gap-3 px-4 py-3 flex-wrap">
          {/* Selection info */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={allSelected ? clearSelection : selectAll}
              className="flex h-5 w-5 items-center justify-center rounded border-2 border-primary bg-primary text-primary-foreground transition-colors"
              title={allSelected ? "Deselect all" : "Select all"}
            >
              {allSelected ? (
                <X className="h-3 w-3" />
              ) : (
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3">
                  <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <span className="text-sm font-semibold text-foreground">
              {count} selected
            </span>
          </div>

          <div className="h-5 w-px bg-border shrink-0" />

          {/* Format chips */}
          <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
            <span className="text-xs text-muted-foreground shrink-0 self-center">Set format:</span>
            {availableFormats.slice(0, 8).map((format) => {
              const colorClass = FORMAT_COLORS[format] ?? "bg-secondary text-secondary-foreground";
              return (
                <button
                  key={format}
                  onClick={() => bulkUpdateFormat(format as ConversionFormat)}
                  className={cn(
                    "rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide transition-all hover:ring-2 hover:ring-primary hover:ring-offset-1",
                    colorClass
                  )}
                  title={`Set all selected to ${format.toUpperCase()}`}
                >
                  {format}
                </button>
              );
            })}
          </div>

          <div className="h-5 w-px bg-border shrink-0" />

          {/* Quality */}
          <button
            onClick={() => setShowQuality((p) => !p)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            Quality <ChevronDown className={cn("h-3 w-3 transition-transform", showQuality && "rotate-180")} />
          </button>

          <div className="h-5 w-px bg-border shrink-0" />

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={convertAll}
              className="gap-1.5 h-8 text-xs font-semibold"
            >
              <Zap className="h-3.5 w-3.5" fill="currentColor" />
              Convert {count}
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={bulkRemove}
              title="Remove selected"
              className="text-destructive hover:bg-destructive/10 h-8 w-8"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={clearSelection}
              title="Clear selection"
              className="h-8 w-8"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Quality panel (expandable) */}
        {showQuality && (
          <div className="border-t border-border px-4 py-3 flex items-center gap-4">
            <span className="text-xs text-muted-foreground shrink-0 w-14">Quality</span>
            <Slider
              min={10}
              max={100}
              step={5}
              value={[quality]}
              onValueChange={([v]) => setQuality(v)}
              className="flex-1"
            />
            <span className="text-xs font-mono w-10 text-right text-muted-foreground">{quality}%</span>
            <Button size="sm" onClick={handleApplyQuality} className="shrink-0 h-7 text-xs">
              Apply
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
