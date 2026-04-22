"use client";

import { useState } from "react";
import {
  X, Download, RefreshCw, ChevronDown, ChevronUp,
  CheckCircle2, AlertCircle, Clock, Loader2, Ban,
  Image as ImageIcon, Video, FileText, File,
} from "lucide-react";
import { cn, formatBytes, getFileExtension } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { FORMAT_COLORS } from "@/lib/constants";
import { useFileStore } from "@/store/useFileStore";
import { useConversion } from "@/hooks/useConversion";
import type { QueueItem, ImageSettings, VideoSettings, PdfSettings } from "@/types";

function CategoryIcon({ category, className }: { category: string; className?: string }) {
  switch (category) {
    case "image": return <ImageIcon className={className} />;
    case "video": return <Video className={className} />;
    case "pdf": return <FileText className={className} />;
    default: return <File className={className} />;
  }
}

function StatusBadge({ status }: { status: QueueItem["status"] }) {
  if (status === "done")
    return <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400"><CheckCircle2 className="h-3.5 w-3.5" />Done</span>;
  if (status === "error")
    return <span className="flex items-center gap-1 text-xs font-medium text-destructive"><AlertCircle className="h-3.5 w-3.5" />Error</span>;
  if (status === "processing")
    return <span className="flex items-center gap-1 text-xs font-medium text-primary"><Loader2 className="h-3.5 w-3.5 animate-spin" />Converting</span>;
  if (status === "queued")
    return <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground"><Clock className="h-3.5 w-3.5" />Queued</span>;
  if (status === "cancelled")
    return <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground"><Ban className="h-3.5 w-3.5" />Cancelled</span>;
  return null;
}

export function FileCard({ item }: { item: QueueItem }) {
  const [showSettings, setShowSettings] = useState(false);
  const removeItem = useFileStore((s) => s.removeItem);
  const retryItem = useFileStore((s) => s.retryItem);
  const { convertItem, downloadItem, cancelItem } = useConversion();
  const ext = getFileExtension(item.name);
  const isProcessing = item.status === "processing";
  const isDone = item.status === "done";
  const isError = item.status === "error";
  const isIdle = item.status === "idle" || item.status === "cancelled";
  const hasSettings = item.category === "image" || item.category === "video" || item.category === "pdf";

  return (
    <div className={cn("group rounded-xl border border-border bg-card shadow-sm transition-all", isDone && "border-green-200 dark:border-green-900/50", isError && "border-destructive/30")}>
      <div className="flex items-start gap-3 p-4">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted flex items-center justify-center">
          {item.previewUrl
            ? <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
            : <CategoryIcon category={item.category} className="h-5 w-5 text-muted-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-foreground" title={item.name}>{item.name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className={cn("rounded px-1.5 py-0.5 text-xs font-semibold uppercase", FORMAT_COLORS[ext] ?? "bg-secondary text-secondary-foreground")}>{ext}</span>
            <span className="text-xs text-muted-foreground">{formatBytes(item.originalSize)}</span>
            {isDone && item.result && (
              <span className="text-xs text-muted-foreground">
                → {formatBytes(item.result.outputSize)}
                {item.result.outputSize < item.originalSize && (
                  <span className="ml-1 text-green-600 dark:text-green-400">(−{Math.round((1 - item.result.outputSize / item.originalSize) * 100)}%)</span>
                )}
              </span>
            )}
            <StatusBadge status={item.status} />
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {isDone && <Button size="icon-sm" variant="ghost" onClick={() => downloadItem(item)} title="Download" className="text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"><Download className="h-3.5 w-3.5" /></Button>}
          {isError && <Button size="icon-sm" variant="ghost" onClick={() => retryItem(item.id)} title="Retry"><RefreshCw className="h-3.5 w-3.5" /></Button>}
          {isProcessing && <Button size="icon-sm" variant="ghost" onClick={() => cancelItem(item.id)} title="Cancel"><Ban className="h-3.5 w-3.5" /></Button>}
          {!isProcessing && <Button size="icon-sm" variant="ghost" onClick={() => removeItem(item.id)} title="Remove" className="opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3.5 w-3.5" /></Button>}
        </div>
      </div>
      {isProcessing && (
        <div className="px-4 pb-3">
          <Progress value={item.progress} className="h-1" />
          <p className="mt-1 text-right text-xs text-muted-foreground">{item.progress}%</p>
        </div>
      )}
      {isError && item.error && (
        <div className="mx-4 mb-3 rounded-lg bg-destructive/5 border border-destructive/20 px-3 py-2">
          <p className="text-xs text-destructive">{item.error}</p>
        </div>
      )}
      {(isIdle || isError) && item.availableFormats.length > 0 && (
        <div className="border-t border-border px-4 py-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground font-medium">Convert to</span>
            {hasSettings && (
              <button onClick={() => setShowSettings((p) => !p)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                Options {showSettings ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            )}
          </div>
          <FormatPicker item={item} />
          {showSettings && hasSettings && <div className="pt-1 border-t border-border/50"><SettingsPanel item={item} /></div>}
          <Button size="sm" onClick={() => convertItem(item)} className="w-full">Convert</Button>
        </div>
      )}
      {isDone && item.result && (
        <div className="border-t border-green-200 dark:border-green-900/50 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground truncate flex-1" title={item.result.filename}>{item.result.filename}</p>
            <Button size="sm" onClick={() => downloadItem(item)} className="shrink-0 gap-1.5 bg-green-600 hover:bg-green-700 text-white">
              <Download className="h-3.5 w-3.5" />Download
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function FormatPicker({ item }: { item: QueueItem }) {
  const updateOutputFormat = useFileStore((s) => s.updateOutputFormat);
  return (
    <div className="flex flex-wrap gap-1.5">
      {item.availableFormats.map((f) => {
        const isSelected = item.outputFormat === f.format;
        const colorClass = FORMAT_COLORS[f.format] ?? "bg-secondary text-secondary-foreground";
        return (
          <button
            key={f.format}
            onClick={() => updateOutputFormat(item.id, f.format)}
            disabled={item.status === "processing"}
            title={f.description}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wide transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              isSelected
                ? "ring-2 ring-primary ring-offset-1 ring-offset-background " + colorClass
                : colorClass + " opacity-60 hover:opacity-100"
            )}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}

function SettingsPanel({ item }: { item: QueueItem }) {
  const updateSettings = useFileStore((s) => s.updateSettings);
  const disabled = item.status === "processing";
  if (item.category === "image") {
    const s = item.settings as ImageSettings;
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <label className="text-xs text-muted-foreground w-16 shrink-0">Quality</label>
          <Slider min={10} max={100} step={5} value={[s.quality]} onValueChange={([v]) => updateSettings(item.id, { quality: v })} disabled={disabled} className="flex-1" />
          <span className="text-xs font-mono w-8 text-right text-muted-foreground">{s.quality}%</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-muted-foreground w-16 shrink-0">Width</label>
          <input
            type="number"
            placeholder="Auto"
            min={1}
            max={16000}
            value={s.maxWidth ?? ""}
            onChange={(e) => updateSettings(item.id, { maxWidth: e.target.value ? Number(e.target.value) : undefined })}
            disabled={disabled}
            className="flex-1 h-7 rounded-md border border-border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-40"
          />
          <span className="text-xs text-muted-foreground w-6">px</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-muted-foreground w-16 shrink-0">Height</label>
          <input
            type="number"
            placeholder="Auto"
            min={1}
            max={16000}
            value={s.maxHeight ?? ""}
            onChange={(e) => updateSettings(item.id, { maxHeight: e.target.value ? Number(e.target.value) : undefined })}
            disabled={disabled}
            className="flex-1 h-7 rounded-md border border-border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-40"
          />
          <span className="text-xs text-muted-foreground w-6">px</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`aspect-${item.id}`}
            checked={s.preserveAspectRatio}
            onChange={(e) => updateSettings(item.id, { preserveAspectRatio: e.target.checked })}
            disabled={disabled}
            className="h-3.5 w-3.5 rounded border-border accent-primary"
          />
          <label htmlFor={`aspect-${item.id}`} className="text-xs text-muted-foreground cursor-pointer select-none">
            Preserve aspect ratio
          </label>
        </div>
      </div>
    );
  }
  if (item.category === "video") {
    const s = item.settings as VideoSettings;
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <label className="text-xs text-muted-foreground w-16 shrink-0">Quality</label>
          <Slider min={10} max={100} step={5} value={[s.quality]} onValueChange={([v]) => updateSettings(item.id, { quality: v })} disabled={disabled} className="flex-1" />
          <span className="text-xs font-mono w-8 text-right text-muted-foreground">{s.quality}%</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-muted-foreground w-16 shrink-0">FPS</label>
          <Slider min={1} max={60} step={1} value={[s.fps ?? 30]} onValueChange={([v]) => updateSettings(item.id, { fps: v })} disabled={disabled} className="flex-1" />
          <span className="text-xs font-mono w-8 text-right text-muted-foreground">{s.fps ?? 30}</span>
        </div>
      </div>
    );
  }
  if (item.category === "pdf") {
    const s = item.settings as PdfSettings;
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <label className="text-xs text-muted-foreground w-16 shrink-0">Quality</label>
          <Slider min={50} max={100} step={5} value={[s.quality ?? 100]} onValueChange={([v]) => updateSettings(item.id, { quality: v })} disabled={disabled} className="flex-1" />
          <span className="text-xs font-mono w-8 text-right text-muted-foreground">{s.quality ?? 100}%</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-muted-foreground w-16 shrink-0">DPI</label>
          <Slider min={72} max={300} step={12} value={[s.dpi ?? 150]} onValueChange={([v]) => updateSettings(item.id, { dpi: v })} disabled={disabled} className="flex-1" />
          <span className="text-xs font-mono w-8 text-right text-muted-foreground">{s.dpi ?? 150}</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-muted-foreground w-16 shrink-0">Pages</label>
          <input type="text" placeholder="All (e.g. 1-3,5)" value={s.pageRange ?? ""} onChange={(e) => updateSettings(item.id, { pageRange: e.target.value || undefined })} disabled={disabled} className="flex-1 h-7 rounded-md border border-border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-40" />
        </div>
      </div>
    );
  }
  return null;
}
