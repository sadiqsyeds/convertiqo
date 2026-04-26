import type { Metadata } from "next";
import { getToolPage, buildToolMetadata } from "@/lib/seo";
import { ToolPageLayout } from "@/components/seo/tool-page-layout";

const page = getToolPage("pdf-converter")!;

export const metadata: Metadata = buildToolMetadata("pdf-converter");

const faqs = [
  { q: "What can I convert a PDF to?", a: "You can convert PDF pages to JPG or PNG images, or to Word DOCX (text extraction). Multi-page PDFs are downloaded as a ZIP archive." },
  { q: "Can I convert specific pages of a PDF?", a: "Yes. In the Options panel, enter a page range like '1-3,5' to convert only those pages." },
  { q: "How do I control image quality when converting PDF to JPG?", a: "Open Options and adjust the Quality slider (50–100%) and DPI (72–300). Higher DPI produces sharper images but larger files." },
  { q: "Is my PDF file uploaded anywhere?", a: "No. PDF rendering uses PDF.js, which runs entirely in your browser. Your document never leaves your device." },
  { q: "Can I convert an image to PDF?", a: "Yes. Upload any JPG, PNG, WebP, or other image and select PDF as the output format to embed it in a PDF document." },
  { q: "What DPI should I use for PDF to image conversion?", a: "150 DPI is the default and works well for most uses. Use 300 DPI for print-quality output." },
];

export default function PdfConverterPage() {
  return (
    <ToolPageLayout
      slug="pdf-converter"
      h1={page.h1}
      description="Convert PDF pages to JPG or PNG images, extract text to Word DOCX, or embed images into PDF documents. Free, private, browser-based — no upload needed."
      faqItems={faqs}
      ctaTitle="Convert your PDF now"
      ctaDescription="Upload your PDF and select the output format. Results are ready instantly."
    >
      <section>
        <h2 className="text-xl font-bold text-foreground mb-6">PDF Conversion Options</h2>
        <div className="space-y-3">
          {[
            { output: "JPG", desc: "Convert each PDF page to a JPEG image. Best for sharing or embedding pages on the web." },
            { output: "PNG", desc: "Convert PDF pages to PNG with lossless quality. Ideal for high-fidelity document images." },
            { output: "DOCX", desc: "Extract readable text from the PDF into an editable Word document. Best for PDFs with selectable text." },
          ].map((o) => (
            <div key={o.output} className="flex gap-3 rounded-lg border border-border px-4 py-3">
              <span className="rounded-md bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-0.5 text-xs font-bold uppercase shrink-0">PDF → {o.output}</span>
              <p className="text-sm text-muted-foreground">{o.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-foreground mb-4">Image to PDF</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Upload any JPG, PNG, WebP, GIF, BMP, or TIFF image and select <strong className="text-foreground">PDF</strong> as the output format. Convertino embeds the image directly into a PDF page sized to the exact pixel dimensions of your image using pdf-lib. No quality loss for JPEG and PNG source files.
        </p>
      </section>
    </ToolPageLayout>
  );
}
