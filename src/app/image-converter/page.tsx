import type { Metadata } from "next";
import { getToolPage, SITE_URL } from "@/lib/seo";
import { ToolPageLayout } from "@/components/seo/tool-page-layout";

const page = getToolPage("image-converter")!;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  keywords: page.keywords,
  alternates: { canonical: `${SITE_URL}/image-converter` },
  openGraph: {
    title: page.title,
    description: page.description,
    url: `${SITE_URL}/image-converter`,
    type: "website",
  },
};

const faqs = [
  {
    q: "What image formats can I convert?",
    a: "Convertino supports JPG, JPEG, PNG, WebP, AVIF, GIF, BMP, TIFF, and SVG as input. You can convert to any of these formats (except SVG output). AVIF output requires Chrome 85+.",
  },
  {
    q: "Is the image converter free?",
    a: "Yes, completely free. There are no hidden fees, no subscription, and no watermarks on converted images.",
  },
  {
    q: "Are my images uploaded to a server?",
    a: "No. All image conversion happens entirely in your web browser using the Canvas API. Your files never leave your device.",
  },
  {
    q: "Can I convert multiple images at once?",
    a: "Yes. Convertino supports batch processing — upload multiple images at once and convert them all with a single click.",
  },
  {
    q: "What is the maximum image file size?",
    a: "The maximum file size is 200 MB per image. Very large images may be slower to process due to browser memory limits.",
  },
  {
    q: "Can I resize images when converting?",
    a: "Yes. In the Options panel for each image, you can set a custom width and height in pixels. Enable 'Preserve aspect ratio' to avoid stretching.",
  },
  {
    q: "What quality setting should I use?",
    a: "For JPG and WebP, quality 80–90% is the best balance of file size and visual quality. PNG is lossless so quality doesn't apply.",
  },
];

export default function ImageConverterPage() {
  return (
    <ToolPageLayout
      slug="image-converter"
      h1={page.h1}
      description="Convert images between JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, and SVG formats — free, instant, and 100% in your browser. No upload, no sign-up, no watermarks."
      faqItems={faqs}
      ctaTitle="Convert your images now"
      ctaDescription="Drag and drop any image to get started. Supports batch conversion of multiple files."
    >
      {/* Feature overview */}
      <section>
        <h2 className="text-xl font-bold text-foreground mb-6">Why Use Convertino for Image Conversion?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              title: "Works in your browser",
              body: "The Canvas API handles all encoding and decoding locally. Your images are never sent to any server.",
            },
            {
              title: "All major formats",
              body: "Convert between JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, and SVG. Convert SVG to raster formats for web use.",
            },
            {
              title: "Quality control",
              body: "Choose JPEG quality from 10–100%. Higher quality means larger files but better visual fidelity.",
            },
            {
              title: "Custom resolution",
              body: "Set exact pixel dimensions or max width/height. Keep the aspect ratio or stretch to exact dimensions.",
            },
            {
              title: "Batch conversion",
              body: "Upload and convert dozens of images at once. Select multiple files, set a format for all, and convert in one click.",
            },
            {
              title: "Free & unlimited",
              body: "No daily limits, no account needed, no watermarks. Completely free for personal and commercial use.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Format guide */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-foreground mb-4">Which Format Should You Choose?</h2>
        <div className="space-y-3">
          {[
            { format: "WebP", use: "Best for web images. 30% smaller than JPG at the same quality. Supported by all modern browsers." },
            { format: "PNG", use: "Use for images that need transparency (logos, icons, screenshots). Lossless — no quality loss." },
            { format: "JPG", use: "Best for photographs and images without transparency. Widely compatible with all devices." },
            { format: "AVIF", use: "Next-gen format with excellent compression. 50% smaller than JPG. Requires Chrome 85+." },
            { format: "GIF", use: "Use only for simple animations or images with few colors. WebP is better for static images." },
          ].map((f) => (
            <div key={f.format} className="flex gap-3 rounded-lg border border-border px-4 py-3">
              <span className="rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs font-bold uppercase shrink-0">{f.format}</span>
              <p className="text-sm text-muted-foreground">{f.use}</p>
            </div>
          ))}
        </div>
      </section>
    </ToolPageLayout>
  );
}
