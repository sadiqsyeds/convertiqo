"use client";

import type {
  ConversionHandler,
  ConversionOptions,
  ConversionResult,
  QueueItem,
} from "@/types";

/**
 * Document conversion service.
 *
 * DOCX → PDF: Uses mammoth to extract HTML from DOCX, then jsPDF to render it.
 * PDF → DOCX: Uses PDF.js to extract text from each page, then docx library to build a Word file.
 *
 * Both conversions are fully browser-side — no server required.
 * Layout fidelity notes:
 *   - DOCX → PDF preserves headings, bold, italic, lists, and paragraph structure.
 *     Complex layouts (tables, images, custom fonts) are simplified.
 *   - PDF → DOCX extracts text content; original formatting/layout is not preserved
 *     (this is a fundamental limitation of PDF text extraction without a full parser).
 */

// ─── DOCX → PDF ───────────────────────────────────────────────────────────────

async function convertDocxToPdf(
  item: QueueItem,
  onProgress: (p: number) => void,
  signal?: AbortSignal
): Promise<ConversionResult> {
  onProgress(5);

  // 1. Read file as ArrayBuffer
  const arrayBuffer = await item.file.arrayBuffer();
  if (signal?.aborted) throw new Error("Cancelled");
  onProgress(15);

  // 2. Extract HTML from DOCX using mammoth
  const mammoth = await import("mammoth");
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const html = result.value;
  if (signal?.aborted) throw new Error("Cancelled");
  onProgress(40);

  // 3. Create a hidden iframe to render the HTML so we can measure it
  const container = document.createElement("div");
  container.style.cssText = [
    "position:fixed", "left:-9999px", "top:0",
    "width:794px",   // A4 width at 96dpi ≈ 794px
    "font-family:Arial,sans-serif", "font-size:12pt",
    "line-height:1.5", "padding:40px", "background:#fff", "color:#000",
  ].join(";");
  container.innerHTML = html;
  document.body.appendChild(container);

  if (signal?.aborted) {
    document.body.removeChild(container);
    throw new Error("Cancelled");
  }
  onProgress(55);

  // 4. Render container to canvas using html2canvas
  const html2canvas = (await import("html2canvas")).default;
  const canvas = await html2canvas(container, {
    scale: 1.5,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
    windowWidth: 794,
  });
  document.body.removeChild(container);

  if (signal?.aborted) throw new Error("Cancelled");
  onProgress(80);

  // 5. Build PDF from canvas using jsPDF (A4 size)
  const { jsPDF } = await import("jspdf");
  const imgData = canvas.toDataURL("image/jpeg", 0.92);
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * pageWidth) / canvas.width;
  const margin = 0;

  // If content is taller than one page, split across multiple pages
  let heightLeft = imgHeight;
  let position = margin;

  pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  const pdfBytes = pdf.output("arraybuffer");
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  onProgress(100);

  const baseName = item.name.replace(/\.[^.]+$/, "");
  return {
    blob,
    filename: `${baseName}.pdf`,
    outputSize: blob.size,
    mimeType: "application/pdf",
    convertedAt: Date.now(),
  };
}

// ─── PDF → DOCX ───────────────────────────────────────────────────────────────

async function convertPdfToDocx(
  item: QueueItem,
  onProgress: (p: number) => void,
  signal?: AbortSignal
): Promise<ConversionResult> {
  onProgress(5);

  // 1. Load PDF using PDF.js
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url
  ).toString();

  const arrayBuffer = await item.file.arrayBuffer();
  if (signal?.aborted) throw new Error("Cancelled");
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;
  onProgress(15);

  // 2. Extract text from all pages
  const pageTexts: string[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (signal?.aborted) throw new Error("Cancelled");
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    pageTexts.push(pageText);
    onProgress(15 + Math.round((i / totalPages) * 40));
  }

  if (signal?.aborted) throw new Error("Cancelled");
  onProgress(60);

  // 3. Build DOCX using the docx library
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import("docx");

  const docxParagraphs = [];

  // Title paragraph
  const baseName = item.name.replace(/\.pdf$/i, "");
  docxParagraphs.push(
    new Paragraph({
      text: baseName,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Add a paragraph per page, with a page header
  for (let i = 0; i < pageTexts.length; i++) {
    if (totalPages > 1) {
      docxParagraphs.push(
        new Paragraph({
          children: [new TextRun({ text: `— Page ${i + 1} —`, bold: true, color: "888888" })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 300, after: 200 },
        })
      );
    }

    // Split text into ~100-word chunks to create readable paragraphs
    const words = pageTexts[i].split(" ").filter(Boolean);
    const chunks: string[] = [];
    for (let j = 0; j < words.length; j += 100) {
      chunks.push(words.slice(j, j + 100).join(" "));
    }

    for (const chunk of chunks) {
      if (chunk.trim()) {
        docxParagraphs.push(
          new Paragraph({
            children: [new TextRun({ text: chunk })],
            spacing: { after: 160 },
          })
        );
      }
    }

    if (i < pageTexts.length - 1 && totalPages > 1) {
      // Page break between PDF pages
      docxParagraphs.push(new Paragraph({ pageBreakBefore: true, text: "" }));
    }
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: docxParagraphs,
    }],
  });

  onProgress(85);

  const docxBuffer = await Packer.toBuffer(doc);
  const blob = new Blob([docxBuffer.buffer as ArrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  onProgress(100);

  return {
    blob,
    filename: `${baseName}.docx`,
    outputSize: blob.size,
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    convertedAt: Date.now(),
  };
}

// ─── Handler Export ───────────────────────────────────────────────────────────

export const documentConversionHandler: ConversionHandler = {
  canHandle: (item: QueueItem) =>
    item.category === "document" ||
    (item.category === "pdf" && item.outputFormat === "docx"),
  convert: async ({ item, onProgress, signal }: ConversionOptions): Promise<ConversionResult> => {
    // Route based on input category and output format
    if (item.category === "pdf" && item.outputFormat === "docx") {
      return convertPdfToDocx(item, onProgress, signal);
    }
    if (item.category === "document") {
      return convertDocxToPdf(item, onProgress, signal);
    }
    throw new Error(`Unsupported conversion: ${item.category} → ${item.outputFormat}`);
  },
};
