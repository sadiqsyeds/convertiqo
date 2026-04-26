/**
 * Server-side JSON-LD schema helpers.
 * This file has NO "use client" directive — it runs only on the server.
 */

export interface FAQItem {
  q: string;
  a: string;
}

export function buildFaqSchema(items: FAQItem[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  });
}
