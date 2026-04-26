import type { Metadata } from "next";
import { getToolPage, buildToolMetadata } from "@/lib/seo";
import { ToolPageLayout } from "@/components/seo/tool-page-layout";

const page = getToolPage("compress-video")!;

export const metadata: Metadata = buildToolMetadata("compress-video");

const faqs = [
  { q: "How does video compression work in the browser?", a: "Convertino re-encodes the video through your browser's MediaRecorder API. The quality slider controls the video bitrate — lower quality means lower bitrate and smaller file size." },
  { q: "How much can I reduce video file size?", a: "Depending on the original bitrate and quality setting, you can reduce file size by 30–70%. Higher bitrate source videos see the largest reductions." },
  { q: "Will compressing a video reduce its resolution?", a: "No — the resolution stays the same by default. Only the bitrate (quality) is reduced. You can optionally set a max width to also scale down the resolution." },
  { q: "How long does video compression take?", a: "Video is processed in real-time at 1× playback speed. A 2-minute video takes approximately 2 minutes to compress." },
  { q: "Is my video uploaded to a server?", a: "No. All video processing happens in your browser. Your files never leave your device." },
  { q: "What output formats are available for compressed video?", a: "MP4 (H.264 on Chrome), WebM (VP8/VP9), or other formats. MP4 is recommended for the widest device compatibility." },
];

export default function CompressVideoPage() {
  return (
    <ToolPageLayout
      slug="compress-video"
      h1={page.h1}
      description="Reduce video file size online for free. Compress MP4, WebM, and MOV videos with quality control. Browser-based processing — no upload, no account."
      faqItems={faqs}
      ctaTitle="Compress your video now"
      ctaDescription="Upload your video, set the quality level, and download a smaller file instantly."
    >
      <section>
        <h2 className="text-xl font-bold text-foreground mb-6">Video Compression Quality Guide</h2>
        <div className="space-y-3">
          {[
            { level: "90–100%", label: "High quality", desc: "Minimal compression. Best for archiving or when quality is critical. File size reduction is small." },
            { level: "70–85%", label: "Balanced (recommended)", desc: "Good visual quality with significant file size reduction. Best for sharing and streaming." },
            { level: "40–65%", label: "Heavy compression", desc: "Noticeable quality loss. Suitable for drafts, previews, or low-bandwidth sharing." },
          ].map((s) => (
            <div key={s.level} className="flex gap-4 rounded-lg border border-border px-4 py-3">
              <span className="rounded-lg bg-primary/10 text-primary px-2 py-1 text-xs font-bold shrink-0 self-start">{s.level}</span>
              <div>
                <p className="text-sm font-medium text-foreground">{s.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-foreground mb-4">Tips for Best Results</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2"><span className="text-primary">•</span> Start at <strong className="text-foreground">75% quality</strong> for a good balance of size and quality.</li>
          <li className="flex gap-2"><span className="text-primary">•</span> <strong className="text-foreground">MP4</strong> output gives the widest compatibility across devices and platforms.</li>
          <li className="flex gap-2"><span className="text-primary">•</span> Reducing the FPS from 60 to 30 can significantly reduce file size for screen recordings.</li>
          <li className="flex gap-2"><span className="text-primary">•</span> Processing time equals video duration — a 5-minute video takes ~5 minutes to process.</li>
        </ul>
      </section>
    </ToolPageLayout>
  );
}
