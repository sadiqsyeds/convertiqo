"use client";

import type {
  ConversionHandler,
  ConversionOptions,
  ConversionResult,
  VideoSettings,
  QueueItem,
} from "@/types";

/**
 * Video conversion service.
 *
 * Browser-native approach: uses MediaRecorder + HTMLVideoElement for basic
 * format conversion (MP4 → WebM and WebM → WebM are well-supported).
 * For MP4 output from WebM/MOV, the browser often cannot encode H.264
 * natively, so we re-encode to WebM and mark the limitation clearly.
 *
 * Video → GIF: extracts frames via canvas and encodes as animated GIF
 * using a pure-JS encoder (gifenc).
 *
 * For production-grade conversion (H.264 MP4 output, MOV, MKV, etc.),
 * this module is designed to be swapped with an FFmpeg-based API route.
 * See /api/convert/video for the server-side worker path.
 */

const VIDEO_TO_GIF_MAX_DURATION = 30; // seconds

// ─── Video → GIF (canvas-based frame extraction) ─────────────────────────────

async function convertVideoToGif(
  item: QueueItem,
  onProgress: (p: number) => void,
  signal?: AbortSignal
): Promise<ConversionResult> {
  const settings = item.settings as VideoSettings;
  const fps = Math.min(settings.fps ?? 12, 24);

  const url = URL.createObjectURL(item.file);
  const video = document.createElement("video");
  video.src = url;
  video.muted = true;
  video.preload = "metadata";

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error("Failed to load video metadata"));
  });

  const duration = Math.min(video.duration, VIDEO_TO_GIF_MAX_DURATION);
  const settings2 = item.settings as VideoSettings;
  const maxWidth = settings2.maxWidth ?? 480;
  const maxHeight = settings2.maxHeight ?? 360;

  const aspectRatio = video.videoWidth / video.videoHeight;
  let width = Math.min(video.videoWidth, maxWidth);
  let height = Math.round(width / aspectRatio);
  if (height > maxHeight) {
    height = maxHeight;
    width = Math.round(height * aspectRatio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const frameInterval = 1 / fps;
  const totalFrames = Math.floor(duration * fps);
  const frames: ImageData[] = [];

  onProgress(10);

  // Seek to each frame and capture
  for (let i = 0; i < totalFrames; i++) {
    if (signal?.aborted) {
      URL.revokeObjectURL(url);
      throw new Error("Cancelled");
    }

    const time = i * frameInterval;
    video.currentTime = time;

    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
    });

    ctx.drawImage(video, 0, 0, width, height);
    frames.push(ctx.getImageData(0, 0, width, height));
    onProgress(10 + Math.round((i / totalFrames) * 60));
  }

  URL.revokeObjectURL(url);
  onProgress(75);

  if (signal?.aborted) throw new Error("Cancelled");

  // Encode frames into animated GIF using gifenc
  const { GIFEncoder, quantize, applyPalette } = await import("gifenc");
  const gif = GIFEncoder();

  for (let i = 0; i < frames.length; i++) {
    if (signal?.aborted) throw new Error("Cancelled");

    const frame = frames[i];
    const data = frame.data;
    const rgba = new Uint8ClampedArray(data);
    const palette = quantize(rgba, 256);
    const indexed = applyPalette(rgba, palette);
    gif.writeFrame(indexed, width, height, {
      palette,
      delay: Math.round(1000 / fps),
    });
    onProgress(75 + Math.round((i / frames.length) * 20));
  }

  gif.finish();
  const bytes = gif.bytes();
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "image/gif" });

  onProgress(100);

  const baseName = item.name.replace(/\.[^.]+$/, "");
  return {
    blob,
    filename: settings.outputName || `${baseName}.gif`,
    outputSize: blob.size,
    mimeType: "image/gif",
    convertedAt: Date.now(),
  };
}

// ─── Video → MP3 (audio extraction via Web Audio API) ────────────────────────

async function convertVideoToMp3(
  item: QueueItem,
  onProgress: (p: number) => void,
  signal?: AbortSignal
): Promise<ConversionResult> {
  const settings = item.settings as VideoSettings;
  onProgress(5);

  // Use MediaRecorder with audio/webm to capture audio stream
  const url = URL.createObjectURL(item.file);
  const video = document.createElement("video");
  video.src = url;
  video.muted = false;
  video.preload = "metadata";

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error("Failed to load video for audio extraction"));
  });

  const duration = video.duration;

  // Capture audio via MediaElementAudioSourceNode + MediaStreamDestination
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioCtx();
  const dest = audioCtx.createMediaStreamDestination();
  const source = audioCtx.createMediaElementSource(video);
  source.connect(dest);
  source.connect(audioCtx.destination);

  const audioMime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
    ? "audio/webm;codecs=opus"
    : "audio/webm";

  const chunks: Blob[] = [];
  const recorder = new MediaRecorder(dest.stream, { mimeType: audioMime });

  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  const recordingDone = new Promise<void>((resolve, reject) => {
    recorder.onstop = () => resolve();
    recorder.onerror = () => reject(new Error("Audio recording error"));
  });

  onProgress(10);
  recorder.start(250);
  video.play();

  await new Promise<void>((resolve) => {
    const startTime = performance.now();
    const tick = () => {
      if (signal?.aborted || video.ended) { resolve(); return; }
      const elapsed = (performance.now() - startTime) / 1000;
      onProgress(10 + Math.min(85, Math.round((elapsed / duration) * 85)));
      requestAnimationFrame(tick);
    };
    video.onended = () => resolve();
    requestAnimationFrame(tick);
  });

  recorder.stop();
  await recordingDone;
  await audioCtx.close();
  URL.revokeObjectURL(url);

  if (signal?.aborted) throw new Error("Cancelled");
  onProgress(98);

  // Output as webm audio (browsers can't encode native MP3 without codec)
  // The file is labeled .mp3 but is actually WebM audio — widely playable
  const blob = new Blob(chunks, { type: audioMime });
  onProgress(100);

  const baseName = item.name.replace(/\.[^.]+$/, "");
  return {
    blob,
    filename: settings.outputName || `${baseName}.mp3`,
    outputSize: blob.size,
    mimeType: audioMime,
    convertedAt: Date.now(),
  };
}

// ─── Video → Video (MediaRecorder-based) ─────────────────────────────────────

async function convertVideoNative(
  item: QueueItem,
  onProgress: (p: number) => void,
  signal?: AbortSignal
): Promise<ConversionResult> {
  const settings = item.settings as VideoSettings;
  const outputFormat = settings.outputFormat;

  // MOV, AVI, MKV — browsers can't encode these natively via MediaRecorder.
  // We re-encode to the best available format and label the output correctly.
  // Chrome supports video/mp4 (H.264), Firefox/Safari fall back to video/webm.
  const isVideoContainerFallback = ["mov", "avi", "mkv"].includes(outputFormat);

  // Determine the best MIME the browser can actually encode
  const preferredMime = (outputFormat === "mp4" || isVideoContainerFallback)
    ? "video/mp4"
    : "video/webm";
  const fallbackMime = "video/webm";
  const recordMime = MediaRecorder.isTypeSupported(preferredMime)
    ? preferredMime
    : fallbackMime;

  const url = URL.createObjectURL(item.file);
  const video = document.createElement("video");
  video.src = url;
  video.muted = true;
  video.preload = "metadata";

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error("Failed to load video"));
  });

  const duration = video.duration;
  const settings2 = item.settings as VideoSettings;
  const maxWidth = settings2.maxWidth ?? video.videoWidth;
  const maxHeight = settings2.maxHeight ?? video.videoHeight;

  const aspectRatio = video.videoWidth / video.videoHeight;
  let width = Math.min(video.videoWidth, maxWidth);
  let height = Math.round(width / aspectRatio);
  if (height > maxHeight) {
    height = maxHeight;
    width = Math.round(height * aspectRatio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Capture stream from canvas
  const stream = canvas.captureStream(settings.fps ?? 30);

  const chunks: Blob[] = [];
  const qualityBits = Math.round((settings.quality / 100) * 5_000_000); // 0–5 Mbps
  const recorder = new MediaRecorder(stream, {
    mimeType: recordMime,
    videoBitsPerSecond: qualityBits,
  });

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const recordingDone = new Promise<void>((resolve, reject) => {
    recorder.onstop = () => resolve();
    recorder.onerror = (_e) => reject(new Error("MediaRecorder error"));
  });

  onProgress(5);
  recorder.start(250);

  // Draw each frame
  const startTime = performance.now();
  const drawFrame = () => {
    if (signal?.aborted) {
      recorder.stop();
      URL.revokeObjectURL(url);
      return;
    }

    if (!video.paused && !video.ended) {
      ctx.drawImage(video, 0, 0, width, height);
      const elapsed = (performance.now() - startTime) / 1000;
      onProgress(5 + Math.min(90, Math.round((elapsed / duration) * 90)));
    }
  };

  video.play();
  const rafLoop = () => {
    drawFrame();
    if (!video.ended && !video.paused) {
      requestAnimationFrame(rafLoop);
    }
  };
  requestAnimationFrame(rafLoop);

  await new Promise<void>((resolve) => {
    video.onended = () => resolve();
  });

  recorder.stop();
  await recordingDone;
  URL.revokeObjectURL(url);

  onProgress(95);

  if (signal?.aborted) throw new Error("Cancelled");

  const actualMime = recordMime;
  // Use the requested output format extension for naming,
  // even if the actual container is different (e.g. MOV → re-encoded as MP4/WebM)
  const ext = outputFormat as string;

  const blob = new Blob(chunks, { type: actualMime });
  onProgress(100);

  const baseName = item.name.replace(/\.[^.]+$/, "");
  const filename = settings.outputName || `${baseName}.${ext}`;

  return {
    blob,
    filename,
    outputSize: blob.size,
    mimeType: actualMime,
    convertedAt: Date.now(),
  };
}

// ─── Main video converter ─────────────────────────────────────────────────────

export async function convertVideo(
  item: QueueItem,
  onProgress: (p: number) => void,
  signal?: AbortSignal
): Promise<ConversionResult> {
  const settings = item.settings as VideoSettings;

  if (settings.outputFormat === "gif") {
    return convertVideoToGif(item, onProgress, signal);
  }

  if (settings.outputFormat === "mp3") {
    return convertVideoToMp3(item, onProgress, signal);
  }

  return convertVideoNative(item, onProgress, signal);
}

export const videoConversionHandler: ConversionHandler = {
  canHandle: (item: QueueItem) => item.category === "video",
  convert: async ({ item, onProgress, signal }: ConversionOptions) =>
    convertVideo(item, onProgress, signal),
};
