import type { Metadata } from "next";
import { getToolPage, SITE_URL } from "@/lib/seo";
import { ToolPageLayout } from "@/components/seo/tool-page-layout";

const page = getToolPage("compress-image")!;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  keywords: page.keywords,
  alternates: { canonical: `${SITE_URL}/compress-image` },
  openGraph: { title: page.title, description: page.description, url: `${SITE_URL}/compress-image`, type: "website" },
};

const faqs = [
  { q: "How do I compress an image without losing quality?", a: "Set the quality slider to 80–85%. At this level, most images look identical to the original but are 40–60% smaller. WebP format gives the best size reduction." },
  { q: "Which format gives the smallest file size?", a: "WebP is the most efficient format for most images. AVIF is even better but requires Chrome 85+. For photos, JPG at quality 80 is also a great choice." },
  { q: "Can I compress PNG images?", a: "PNG is lossless, so the quality slider doesn't reduce PNG file sizes. To compress a PNG image, convert it to WebP or JPG instead." },
  { q: "How much can I reduce image file size?", a: "Depending on the image and settings, you can reduce file size by 40–80%. WebP at quality 80 typically produces files 50–70% smaller than the original JPG or PNG." },
  { q: "Is my image uploaded to a server?", a: "No. All compression happens in your browser using the Canvas API. Your files never leave your device." },
  { q: "Can I compress multiple images at once?", a: "Yes. Upload multiple images and set the quality for all using the bulk quality control in the toolbar." },
];

export default function CompressImagePage() {
  return (
    <ToolPageLayout
      slug="compress-image"
      h1={page.h1}
      description="Compress JPG, PNG, WebP, and GIF images online for free. Reduce file size by up to 80% with quality control. Browser-based, private, no upload needed."
      faqItems={faqs}
      ctaTitle="Compress your images now"
      ctaDescription="Upload any image and reduce its file size instantly. Adjust quality with a slider."
    >
      <section>
        <h2 className="text-xl font-bold text-foreground mb-6">Recommended Compression Settings</h2>
        <div className="space-y-3">
          {[
            { q: "80–85%", label: "Recommended for web", desc: "Visually identical to the original. Best balance of quality and file size for web images." },
            { q: "60–75%", label: "Aggressive compression", desc: "Noticeable quality reduction on close inspection. Good for thumbnails or low-priority images." },
            { q: "90–100%", label: "Near-lossless", desc: "Minimal compression. Use when image quality is critical, like product photography or print assets." },
          ].map((s) => (
            <div key={s.q} className="flex gap-4 rounded-lg border border-border px-4 py-3">
              <span className="rounded-lg bg-primary/10 text-primary px-2 py-1 text-xs font-bold shrink-0 self-start">{s.q}</span>
              <div>
                <p className="text-sm font-medium text-foreground">{s.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-foreground mb-4">Best Format for Image Compression</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          For the smallest file size, convert your image to <strong className="text-foreground">WebP</strong> at 80% quality. WebP achieves the same visual quality as JPG at roughly half the file size. For maximum compatibility with older devices, JPG at 80% is an excellent choice.
        </p>
      </section>
    </ToolPageLayout>
  );
}
