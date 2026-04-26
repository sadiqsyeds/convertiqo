import type { Metadata } from "next";
import { getToolPage, SITE_URL } from "@/lib/seo";
import { ToolPageLayout } from "@/components/seo/tool-page-layout";

const page = getToolPage("word-to-pdf")!;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  keywords: page.keywords,
  alternates: { canonical: `${SITE_URL}/word-to-pdf` },
  openGraph: { title: page.title, description: page.description, url: `${SITE_URL}/word-to-pdf`, type: "website" },
};

const faqs = [
  { q: "How does Word to PDF conversion work in the browser?", a: "Convertino uses the Mammoth library to parse DOCX XML into HTML, then renders it with html2canvas and encodes it as a PDF using jsPDF. Everything happens locally." },
  { q: "Is the layout perfectly preserved?", a: "Basic formatting (headings, bold, italic, lists, paragraphs) is preserved. Complex layouts like multi-column text, tables with backgrounds, and custom fonts may be simplified." },
  { q: "Does it support DOC files (old Word format)?", a: "Convertino works best with DOCX (Word 2007+). Legacy DOC files may have limited support." },
  { q: "Is there a file size limit?", a: "The maximum file size is 200 MB. Very large documents with many images may take longer to render." },
  { q: "Is my Word document uploaded to a server?", a: "No. All processing happens in your browser. Your document never leaves your device." },
  { q: "Can I convert multiple Word files to PDF at once?", a: "Yes. Upload multiple DOCX files and convert them all together in one batch operation." },
];

export default function WordToPdfPage() {
  return (
    <ToolPageLayout
      slug="word-to-pdf"
      h1={page.h1}
      description="Convert Word DOCX files to PDF instantly in your browser. Preserves headings, bold, italic, lists, and paragraph formatting. Free, private, no upload."
      faqItems={faqs}
      ctaTitle="Convert Word to PDF now"
      ctaDescription="Upload your DOCX file and download a PDF in seconds. No cloud, no account."
    >
      <section>
        <h2 className="text-xl font-bold text-foreground mb-6">What Formatting is Preserved?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "✓ Preserved", items: ["Headings (H1–H6)", "Bold and italic text", "Bullet and numbered lists", "Paragraph spacing", "Basic hyperlinks"] },
            { label: "⚠ Simplified", items: ["Tables (basic support)", "Images within the document", "Custom fonts (falls back to Arial)", "Multi-column layouts", "Headers and footers"] },
          ].map((g) => (
            <div key={g.label} className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-semibold text-foreground mb-2">{g.label}</p>
              <ul className="space-y-1">
                {g.items.map((item) => (
                  <li key={item} className="text-xs text-muted-foreground">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-foreground mb-4">Best Practices for Word to PDF</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2"><span className="text-primary">•</span> Use standard fonts (Times New Roman, Arial, Calibri) for best compatibility.</li>
          <li className="flex gap-2"><span className="text-primary">•</span> Keep document structure simple for cleanest PDF output.</li>
          <li className="flex gap-2"><span className="text-primary">•</span> For complex layouts with images, consider using Word&apos;s built-in PDF export.</li>
          <li className="flex gap-2"><span className="text-primary">•</span> Multi-page documents will automatically split across pages in the output PDF.</li>
        </ul>
      </section>
    </ToolPageLayout>
  );
}
