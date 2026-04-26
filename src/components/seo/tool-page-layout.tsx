import Link from "next/link";
import { Zap } from "lucide-react";
import { SITE_NAME, TOOL_PAGES } from "@/lib/seo";
import { Breadcrumb } from "./breadcrumb";
import { RelatedTools } from "./related-tools";
import { ToolCTA } from "./tool-cta";
import type { FAQItem } from "./faq";
import { FAQ } from "./faq";
import { buildFaqSchema } from "@/lib/schema";
import { HowItWorks, DEFAULT_HOW_IT_WORKS_STEPS } from "./how-it-works";

interface ToolPageLayoutProps {
  slug: string;
  h1: string;
  description: string;
  children: React.ReactNode;           // The main content section
  faqItems: FAQItem[];
  howItWorksSteps?: typeof DEFAULT_HOW_IT_WORKS_STEPS;
  ctaTitle?: string;
  ctaDescription?: string;
}

export function ToolPageLayout({
  slug,
  h1,
  description,
  children,
  faqItems,
  howItWorksSteps = DEFAULT_HOW_IT_WORKS_STEPS,
  ctaTitle,
  ctaDescription,
}: ToolPageLayoutProps) {
  const page = TOOL_PAGES.find((p) => p.slug === slug);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-3.5 w-3.5 text-primary-foreground" fill="currentColor" />
            </div>
            {SITE_NAME}
          </Link>
          <nav className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/image-converter" className="hover:text-foreground transition-colors">Images</Link>
            <Link href="/video-converter" className="hover:text-foreground transition-colors">Videos</Link>
            <Link href="/pdf-converter" className="hover:text-foreground transition-colors">PDF</Link>
            <Link href="/" className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
              Open Tool
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: h1 }]} />

        {/* H1 + Description */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            {h1}
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>

        {/* CTA to the converter */}
        <div className="mb-12">
          <ToolCTA title={ctaTitle} description={ctaDescription} />
        </div>

        {/* Main content (unique per page) */}
        <div className="mb-12">{children}</div>

        {/* How It Works */}
        <div className="mb-12">
          <HowItWorks steps={howItWorksSteps} />
        </div>

        {/* FAQ — schema is pre-serialized here (Server Component context) and passed as string */}
        <div className="mb-12">
          <FAQ items={faqItems} schema={buildFaqSchema(faqItems)} />
        </div>

        {/* Related Tools */}
        <div className="mb-12">
          <RelatedTools currentSlug={slug} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 bg-muted/20">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">Images</p>
              <ul className="space-y-2">
                {[
                  ["Image Converter", "/image-converter"],
                  ["JPG to PNG", "/jpg-to-png"],
                  ["PNG to WebP", "/png-to-webp"],
                  ["Compress Image", "/compress-image"],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">Videos</p>
              <ul className="space-y-2">
                {[
                  ["Video Converter", "/video-converter"],
                  ["Compress Video", "/compress-video"],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">PDFs</p>
              <ul className="space-y-2">
                {[
                  ["PDF Converter", "/pdf-converter"],
                  ["PDF to Word", "/pdf-to-word"],
                  ["Word to PDF", "/word-to-pdf"],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">Company</p>
              <ul className="space-y-2">
                {[
                  ["Home", "/"],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} {SITE_NAME}. All conversions run in your browser. No files uploaded.
            </p>
            <p className="text-xs text-muted-foreground">Free · Private · No sign-up required</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
