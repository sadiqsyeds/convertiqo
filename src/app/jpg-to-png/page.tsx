import type { Metadata } from "next";
import { getToolPage, buildToolMetadata } from "@/lib/seo";
import { ToolPageLayout } from "@/components/seo/tool-page-layout";

const page = getToolPage("jpg-to-png")!;

export const metadata: Metadata = buildToolMetadata("jpg-to-png");

const faqs = [
  { q: "Why convert JPG to PNG?", a: "PNG is a lossless format that supports transparency. Convert JPG to PNG when you need to add a transparent background, prevent further quality loss from re-saves, or edit the image multiple times." },
  { q: "Will I lose quality converting JPG to PNG?", a: "No. PNG is lossless. Converting from JPG to PNG won't add any new compression artifacts. However, the original JPG compression is already baked in." },
  { q: "Does PNG support transparency?", a: "Yes. PNG supports an alpha channel for full or partial transparency. Note that your source JPG has no transparency — the converter gives you a PNG without transparency by default." },
  { q: "Why is my PNG file larger than the JPG?", a: "PNG is a lossless format so it stores more pixel data than JPG. A PNG is typically 3–5× larger than the equivalent JPG for photographs." },
  { q: "Can I convert multiple JPGs to PNG at once?", a: "Yes. Upload multiple JPG files and convert them all to PNG in one batch." },
  { q: "Is the conversion free?", a: "Yes, completely free with no watermarks or file limits per session." },
];

export default function JpgToPngPage() {
  return (
    <ToolPageLayout
      slug="jpg-to-png"
      h1={page.h1}
      description="Convert JPG and JPEG images to PNG format instantly in your browser. Lossless conversion with no quality degradation. Free, no upload, no watermarks."
      faqItems={faqs}
      ctaTitle="Convert JPG to PNG now"
      ctaDescription="Upload your JPG file and download a PNG instantly. No account needed."
    >
      <section>
        <h2 className="text-xl font-bold text-foreground mb-4">JPG vs PNG — When to Use Each</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-amber-200 dark:border-amber-900/30 bg-card p-4">
            <p className="text-sm font-semibold text-foreground mb-2">Use JPG when:</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Photos and complex color gradients</li>
              <li>• File size is more important than perfect quality</li>
              <li>• Sharing on social media or messaging apps</li>
              <li>• Images don&apos;t need transparency</li>
            </ul>
          </div>
          <div className="rounded-xl border border-blue-200 dark:border-blue-900/30 bg-card p-4">
            <p className="text-sm font-semibold text-foreground mb-2">Use PNG when:</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Logos, icons, or UI elements</li>
              <li>• Transparency or transparent background needed</li>
              <li>• Screenshots and text-heavy images</li>
              <li>• Images that will be edited multiple times</li>
            </ul>
          </div>
        </div>
      </section>
    </ToolPageLayout>
  );
}
