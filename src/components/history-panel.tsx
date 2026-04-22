"use client";

import { History, Trash2, ArrowRight, Image, Video, FileText, File } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FORMAT_COLORS } from "@/lib/constants";
import { useFileStore } from "@/store/useFileStore";
import type { HistoryEntry } from "@/types";

function CategoryIcon({ category }: { category: string }) {
  switch (category) {
    case "image": return <Image className="h-4 w-4" />;
    case "video": return <Video className="h-4 w-4" />;
    case "pdf": return <FileText className="h-4 w-4" />;
    default: return <File className="h-4 w-4" />;
  }
}

function HistoryItem({ entry }: { entry: HistoryEntry }) {
  const sizeSaved = entry.originalSize - entry.outputSize;
  const pctSaved = Math.round((sizeSaved / entry.originalSize) * 100);
  const date = new Date(entry.convertedAt);
  const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <CategoryIcon category={entry.category} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold uppercase shrink-0", FORMAT_COLORS[entry.inputFormat] ?? "bg-secondary text-secondary-foreground")}>
            {entry.inputFormat}
          </span>
          <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold uppercase shrink-0", FORMAT_COLORS[entry.outputFormat] ?? "bg-secondary text-secondary-foreground")}>
            {entry.outputFormat}
          </span>
          <span className="text-xs text-foreground truncate ml-1">{entry.originalName}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-muted-foreground">{formatBytes(entry.originalSize)} → {formatBytes(entry.outputSize)}</span>
          {sizeSaved > 0 && (
            <span className="text-[11px] text-green-600 dark:text-green-400">−{pctSaved}%</span>
          )}
          <span className="text-[11px] text-muted-foreground ml-auto">{timeStr}</span>
        </div>
      </div>
    </div>
  );
}

export function HistoryPanel() {
  const history = useFileStore((s) => s.history);
  const clearHistory = useFileStore((s) => s.clearHistory);

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <History className="h-8 w-8 text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">No conversions yet</p>
        <p className="text-xs text-muted-foreground/60 mt-0.5">Your recent conversions will appear here</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground">{history.length} recent conversion{history.length !== 1 ? "s" : ""}</span>
        <Button size="icon-sm" variant="ghost" onClick={clearHistory} title="Clear history" className="text-muted-foreground hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="space-y-0 max-h-64 overflow-y-auto -mx-1 px-1">
        {history.map((entry) => (
          <HistoryItem key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
