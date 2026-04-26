import type { Metadata } from "next";
import { getToolPage, buildToolMetadata } from "@/lib/seo";
import { ToolPageLayout } from "@/components/seo/tool-page-layout";

const page = getToolPage("video-converter")!;

export const metadata: Metadata = buildToolMetadata("video-converter");

const faqs = [
  { q: "What video formats does Convertino support?", a: "Input: MP4, WebM, MOV, MKV, AVI. Output: MP4, WebM, MOV, AVI, MKV, GIF, and MP3 (audio extraction)." },
  { q: "Is video conversion really free?", a: "Yes. No watermarks, no file limits per session, no account required. Completely free." },
  { q: "Are my videos uploaded to a server?", a: "No. Video conversion uses your browser's MediaRecorder API. Everything stays on your device." },
  { q: "Why does video conversion take time?", a: "Video is re-encoded in real-time at 1× playback speed. A 60-second video takes approximately 60 seconds to convert." },
  { q: "Can I convert video to GIF?", a: "Yes. Convertino can extract frames from short video clips (up to 30 seconds) and encode them as animated GIF." },
  { q: "Can I extract audio from a video?", a: "Yes. Select MP3 as the output format to extract the audio track from any video." },
  { q: "What quality setting should I use for video?", a: "For a good balance of quality and file size, use 70–80%. Higher values produce larger files with better quality." },
];

export default function VideoConverterPage() {
  return (
    <ToolPageLayout
      slug="video-converter"
      h1={page.h1}
      description="Convert MP4, WebM, MOV, AVI, and MKV videos online for free. Extract audio as MP3 or create animated GIFs. No upload, no account, no watermarks."
      faqItems={faqs}
      ctaTitle="Convert your video now"
      ctaDescription="Upload any video file and convert it to your preferred format instantly in your browser."
    >
      <section>
        <h2 className="text-xl font-bold text-foreground mb-6">Supported Video Conversions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { from: "MP4", to: "WebM", desc: "Convert MP4 to WebM for web streaming and HTML5 video players." },
            { from: "WebM", to: "MP4", desc: "Convert WebM to MP4 for wider device compatibility." },
            { from: "MOV", to: "MP4", desc: "Convert Apple QuickTime MOV files to universal MP4 format." },
            { from: "AVI", to: "MP4", desc: "Modernize old AVI files to compact, universally-supported MP4." },
            { from: "Video", to: "GIF", desc: "Turn short clips (up to 30s) into shareable animated GIFs." },
            { from: "Video", to: "MP3", desc: "Extract audio from any video file as a high-quality audio file." },
          ].map((c) => (
            <div key={c.from + c.to} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-md bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-0.5 text-xs font-bold uppercase">{c.from}</span>
                <span className="text-muted-foreground text-xs">→</span>
                <span className="rounded-md bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300 px-2 py-0.5 text-xs font-bold uppercase">{c.to}</span>
              </div>
              <p className="text-xs text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-foreground mb-4">Video Conversion Tips</h2>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span><strong className="text-foreground">MP4</strong> is the most compatible format — use it when you need the file to play on any device.</span></li>
          <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span><strong className="text-foreground">WebM</strong> is optimized for web — smaller file sizes for HTML5 video, supported by Chrome and Firefox.</span></li>
          <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span>For <strong className="text-foreground">GIF conversion</strong>, keep clips under 10 seconds for manageable file sizes.</span></li>
          <li className="flex gap-2"><span className="text-primary font-bold">•</span> <span>MP4 output encodes using H.264 on Chrome. Firefox and Safari may output WebM/VP8.</span></li>
        </ul>
      </section>
    </ToolPageLayout>
  );
}
