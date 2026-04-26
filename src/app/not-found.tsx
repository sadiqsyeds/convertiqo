import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Page Not Found – 404",
  description: "The page you are looking for does not exist. Go back to Convertino to convert images, videos, and PDFs for free.",
  robots: { index: false, follow: false },
  alternates: { canonical: `${SITE_URL}/404` },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="max-w-md">
        {/* Logo */}
        <Link href="/" className="mb-8 inline-flex items-center gap-2 font-bold text-xl text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <svg className="h-4 w-4 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          {SITE_NAME}
        </Link>

        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-3">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Head back to convert your files for free.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Go to Converter
          </Link>
          <Link
            href="/image-converter"
            className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            Image Converter
          </Link>
        </div>

        {/* Popular tool links */}
        <div className="mt-10 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground mb-4">Popular tools:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              ["JPG to PNG", "/jpg-to-png"],
              ["PDF to Word", "/pdf-to-word"],
              ["Word to PDF", "/word-to-pdf"],
              ["PNG to WebP", "/png-to-webp"],
              ["Video Converter", "/video-converter"],
              ["Compress Image", "/compress-image"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="rounded-md border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
