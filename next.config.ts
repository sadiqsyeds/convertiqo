import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack config (Next.js 16+ uses Turbopack by default)
  turbopack: {
    resolveAlias: {
      // canvas is not available in browser (needed by pdfjs in some builds)
      canvas: "./src/lib/canvas-stub.ts",
    },
  },
};

export default nextConfig;
