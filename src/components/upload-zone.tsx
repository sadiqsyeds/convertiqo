"use client";

import { useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, CloudUpload, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ALL_ACCEPTED_TYPES,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  MAX_FILES_IN_QUEUE,
} from "@/lib/constants";
import { useFileStore } from "@/store/useFileStore";
import { toast } from "sonner";

interface UploadZoneProps {
  className?: string;
  compact?: boolean;
}

export function UploadZone({ className, compact = false }: UploadZoneProps) {
  const addFiles = useFileStore((s) => s.addFiles);
  const queueLength = useFileStore((s) => s.queue.length);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: File[]) => {
      if (queueLength >= MAX_FILES_IN_QUEUE) {
        toast.error(
          `Queue is full. Maximum ${MAX_FILES_IN_QUEUE} files allowed at once.`
        );
        return;
      }

      const validFiles: File[] = [];
      const errors: string[] = [];

      for (const file of files) {
        if (file.size > MAX_FILE_SIZE_BYTES) {
          errors.push(
            `${file.name}: exceeds ${MAX_FILE_SIZE_MB} MB size limit`
          );
          continue;
        }

        const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
        const isValidType =
          ALL_ACCEPTED_TYPES.includes(file.type) ||
          [
            "jpg", "jpeg", "png", "webp", "avif", "gif", "bmp", "tiff", "svg",
            "mp4", "webm", "mov", "mkv", "avi",
            "pdf", "doc", "docx",
          ].includes(ext);

        if (!isValidType) {
          errors.push(`${file.name}: unsupported file type`);
          continue;
        }

        validFiles.push(file);
      }

      if (errors.length > 0) {
        errors.forEach((e) => toast.error(e));
      }

      if (validFiles.length > 0) {
        addFiles(validFiles);
        if (validFiles.length > 0) {
          toast.success(
            `${validFiles.length} file${validFiles.length > 1 ? "s" : ""} added`
          );
        }
      }
    },
    [addFiles, queueLength]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop: handleFiles,
      accept: {
        "image/*": [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".bmp", ".tiff", ".svg"],
        "video/*": [".mp4", ".webm", ".mov", ".mkv", ".avi"],
        "application/pdf": [".pdf"],
        "application/msword": [".doc"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      },
      maxSize: MAX_FILE_SIZE_BYTES,
      multiple: true,
      noClick: true, // We handle click via button
    });

  if (compact) {
    return (
      <div
        {...getRootProps()}
        className={cn(
          "flex items-center gap-3 rounded-xl border-2 border-dashed border-border px-4 py-3 transition-all duration-200",
          isDragActive && !isDragReject && "border-primary bg-primary/5",
          isDragReject && "border-destructive bg-destructive/5",
          className
        )}
      >
        <input {...getInputProps()} ref={inputRef} />
        <CloudUpload className="h-5 w-5 shrink-0 text-muted-foreground" />
        <span className="flex-1 text-sm text-muted-foreground">
          {isDragActive ? "Drop files here…" : "Drop more files or"}
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          <FolderOpen className="h-3.5 w-3.5" />
          Browse
        </Button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 px-6 py-12 text-center transition-all duration-200 cursor-default",
        "hover:border-primary/50 hover:bg-muted/50",
        isDragActive && !isDragReject && "border-primary bg-primary/5 scale-[1.01]",
        isDragReject && "border-destructive bg-destructive/5",
        className
      )}
    >
      <input {...getInputProps()} ref={inputRef} />

      {/* Icon */}
      <div
        className={cn(
          "mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-background shadow-sm border border-border transition-all duration-200",
          isDragActive && !isDragReject && "border-primary bg-primary/5 scale-110",
          isDragReject && "border-destructive"
        )}
      >
        <Upload
          className={cn(
            "h-7 w-7 text-muted-foreground transition-colors",
            isDragActive && !isDragReject && "text-primary",
            isDragReject && "text-destructive"
          )}
        />
      </div>

      {/* Copy */}
      {isDragReject ? (
        <p className="text-sm font-medium text-destructive">
          Some files are not supported
        </p>
      ) : isDragActive ? (
        <p className="text-sm font-semibold text-primary">
          Release to add files
        </p>
      ) : (
        <>
          <p className="text-base font-semibold text-foreground mb-1">
            Drag & drop files here
          </p>
          <p className="text-sm text-muted-foreground mb-5">
            Images, Videos, PDFs, Word documents — up to {MAX_FILE_SIZE_MB} MB each
          </p>
        </>
      )}

      {/* Click-to-upload */}
      {!isDragActive && (
        <Button
          onClick={() => inputRef.current?.click()}
          type="button"
          variant="outline"
          className="gap-2"
        >
          <FolderOpen className="h-4 w-4" />
          Choose files
        </Button>
      )}

      {/* Supported formats hint */}
      {!isDragActive && (
        <p className="mt-4 text-xs text-muted-foreground">
          JPG · PNG · WebP · AVIF · GIF · SVG · BMP · TIFF · MP4 · WebM · MOV · PDF · DOCX
        </p>
      )}
    </div>
  );
}
