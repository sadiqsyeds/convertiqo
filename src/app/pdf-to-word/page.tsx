import type { Metadata } from "next";
import { getToolPage, SITE_URL } from "@/lib/seo";
import { ToolPageLayout } from "@/components/seo/tool-page-layout";

const page = getToolPage("pdf-to-word")!;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  keywords: page.keywords,
  alternates: { canonical: `${SITE_URL}/pdf-to-word` },
  openGraph: { title: page.title, description: page.description, url: `${SITE_URL}/pdf-to-word`, type: "website" },
};

const faqs = [
  { q: "How does PDF to Word conversion work?", a: "PDF.js extracts the selectable text from each page. The text is then structured into paragraphs and assembled into a DOCX file using the docx library. All processing happens in your browser." },
  { q: "Will the formatting be preserved?", a: "Text content is extracted and placed into clean paragraphs. Original visual layout, fonts, images, and column structure are not preserved — this is a fundamental limitation of PDF text extraction." },
  { q: "What if my PDF is a scanned document?", a: "Scanned PDFs contain only images, not selectable text. PDF.js cannot extract text from them. The result will be an empty document. Use OCR software for scanned documents." },
  { q: "Is my PDF uploaded to a server?", a: "No. PDF text extraction runs entirely in your browser using PDF.js with a Web Worker. Nothing is sent to any server." },
  { q: "Can I choose which pages to extract?", a: "Currently, the PDF to Word conversion extracts all pages. Use the page range option in the PDF Converter tool to extract specific pages first." },
  { q: "What is the file size limit for PDF to Word?", a: "Up to 200 MB. Large PDFs with many pages may take longer to process." },
];

export default function PdfToWordPage() {
  return (
    <ToolPageLayout
      slug="pdf-to-word"
      h1={page.h1}
      description="Extract text content from PDF files into editable Word DOCX documents. Free, browser-based, no upload. Best for PDFs with selectable text."
      faqItems={faqs}
      ctaTitle="Convert PDF to Word now"
      ctaDescription="Upload your PDF and get an editable Word document with all text content extracted."
    >
      <section>
        <h2 className="text-xl font-bold text-foreground mb-4">When to Use PDF to Word</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-green-200 dark:border-green-900/30 bg-green-50 dark:bg-green-900/10 p-4">
            <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2">Works well for:</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• PDFs created from Word or other word processors</li>
              <li>• PDFs with selectable, copyable text</li>
              <li>• Text-heavy documents like reports and articles</li>
              <li>• Extracting content for editing or repurposing</li>
            </ul>
          </div>
          <div className="rounded-xl border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/10 p-4">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2">Limited support for:</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Scanned PDFs (images only, no text)</li>
              <li>• PDFs with complex layouts or tables</li>
              <li>• Password-protected PDFs</li>
              <li>• PDFs with embedded fonts using encoding tricks</li>
            </ul>
          </div>
        </div>
      </section>
    </ToolPageLayout>
  );
}
