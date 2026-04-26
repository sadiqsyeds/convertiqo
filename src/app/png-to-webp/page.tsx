import type { Metadata } from "next";
import { getToolPage, SITE_URL } from "@/lib/seo";
import { ToolPageLayout } from "@/components/seo/tool-page-layout";

const page = getToolPage("png-to-webp")!;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  keywords: page.keywords,
  alternates: { canonical: `${SITE_URL}/png-to-webp` },
  openGraph: { title: page.title, description: page.description, url: `${SITE_URL}/png-to-webp`, type: "website" },
};

const faqs = [
  { q: "Why should I convert PNG to WebP?", a: "WebP images are typically 25–34% smaller than PNG at equivalent quality. Smaller images mean faster page load times and better Core Web Vitals scores." },
  { q: "Does WebP support transparency like PNG?", a: "Yes. WebP supports an alpha channel, so transparent PNG images remain transparent after conversion to WebP." },
  { q: "Is WebP supported in all browsers?", a: "WebP is supported by Chrome, Firefox, Safari (14+), Edge, and Opera — covering over 97% of global web users." },
  { q: "Will I lose quality converting PNG to WebP?", a: "At quality 80–90%, WebP looks visually identical to PNG but is much smaller. At 100% quality, it's near-lossless." },
  { q: "Can I convert multiple PNGs to WebP at once?", a: "Yes. Upload multiple PNG files and select WebP as the target format to batch convert them all." },
  { q: "Is the PNG to WebP converter free?", a: "Yes, completely free. No watermarks, no daily limits, no account required." },
];

export default function PngToWebpPage() {
  return (
    <ToolPageLayout
      slug="png-to-webp"
      h1={page.h1}
      description="Convert PNG images to WebP format for faster web performance. Typically 25–34% smaller than PNG. Free, browser-based, no upload, no sign-up."
      faqItems={faqs}
      ctaTitle="Convert PNG to WebP now"
      ctaDescription="Upload your PNG and get a smaller WebP file instantly. Perfect for web optimization."
    >
      <section>
        <h2 className="text-xl font-bold text-foreground mb-4">PNG vs WebP File Size Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-xs font-semibold text-muted-foreground">Image type</th>
                <th className="text-left py-2 pr-4 text-xs font-semibold text-muted-foreground">PNG size</th>
                <th className="text-left py-2 text-xs font-semibold text-muted-foreground">WebP size (approx.)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { type: "Photo (1920×1080)", png: "~1.2 MB", webp: "~350 KB" },
                { type: "Icon (256×256)", png: "~45 KB", webp: "~15 KB" },
                { type: "Screenshot (2560×1440)", png: "~3.5 MB", webp: "~900 KB" },
              ].map((row) => (
                <tr key={row.type} className="border-b border-border/50">
                  <td className="py-2 pr-4 text-xs text-foreground">{row.type}</td>
                  <td className="py-2 pr-4 text-xs text-muted-foreground">{row.png}</td>
                  <td className="py-2 text-xs text-green-600 dark:text-green-400 font-medium">{row.webp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Sizes are approximate and vary by image content and quality setting.</p>
      </section>
    </ToolPageLayout>
  );
}
