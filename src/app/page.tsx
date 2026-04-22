"use client";

import { useFileStore } from "@/store/useFileStore";
import { useConversion } from "@/hooks/useConversion";
import { useMounted } from "@/hooks/useMounted";
import { Header } from "@/components/header";
import { UploadZone } from "@/components/upload-zone";
import { FileCard } from "@/components/file-card";
import { Button } from "@/components/ui/button";
import {
  Download,
  Zap,
  Trash2,
  X,
  Archive,
  LayoutGrid,
  Loader2,
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
  const { convertAll, downloadAll } = useConversion();

  // Use empty queue on server/before hydration to avoid mismatch
  const activeQueue = mounted ? queue : [];
  const hasFiles = activeQueue.length > 0;
  const pendingCount = activeQueue.filter(
    (q) =>
      q.status === "idle" || q.status === "cancelled" || q.status === "error",
  ).length;
  const doneCount = activeQueue.filter((q) => q.status === "done").length;
  const processingCount = activeQueue.filter(
    (q) => q.status === "processing",
  ).length;

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
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {activeQueue.length} file{activeQueue.length !== 1 ? "s" : ""}
              </span>
              {processingCount > 0 && (
                <span className="flex items-center gap-1 text-xs text-primary">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Converting {processingCount}…
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {pendingCount > 0 && (
                <Button
                  size="sm"
                  onClick={convertAll}
                  disabled={isConverting}
                  className="gap-1.5 font-semibold"
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Converting…
                    </>
                  ) : (
                    <>
                      <Zap className="h-3.5 w-3.5" fill="currentColor" />
                      Convert {pendingCount} file{pendingCount !== 1 ? "s" : ""}
                    </>
                  )}
                </Button>
              )}
              {doneCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadAll}
                  className="gap-1.5"
                >
                  {doneCount > 1 ? (
                    <>
                      <Archive className="h-3.5 w-3.5" />
                      Download all as ZIP
                    </>
                  ) : (
                    <>
                      <Download className="h-3.5 w-3.5" />
                      Download result
                    </>
                  )}
                </Button>
              )}
              {doneCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearDone}
                  className="gap-1.5 text-xs h-8"
                >
                  <X className="h-3 w-3" />
                  Clear done
                </Button>
              )}
              {!isConverting && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearQueue}
                  className="gap-1.5 text-xs h-8 text-muted-foreground"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear all
                </Button>
              )}
            </div>
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
          Convertiqo— All conversions happen in your browser. No files are
          uploaded to any server.
        </p>
      </footer>
    </div>
  );
}
