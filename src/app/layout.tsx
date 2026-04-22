import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Convertiqo– Convert, Compress & Transform Files",
  description:
    "Convert images, compress videos, transform PDFs and more — all in one clean, fast, single-screen experience. No sign-up required.",
  keywords: [
    "file converter",
    "image converter",
    "video converter",
    "PDF to image",
    "image to PDF",
    "compress image",
    "webp converter",
    "online converter",
  ],
  authors: [{ name: "Convertiqo" }],
  creator: "Convertiqo",
  openGraph: {
    title: "Convertiqo– Convert & Transform Files",
    description:
      "Convert images, videos, and PDFs in one clean screen. Fast, free, private.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f14" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body
        className="min-h-screen bg-background text-foreground antialiased"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            toastOptions={{
              duration: 4000,
              classNames: {
                toast: "font-sans text-sm shadow-lg border border-border",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
