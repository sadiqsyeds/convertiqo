"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FAQItem {
  q: string;
  a: string;
}

interface FAQProps {
  items: FAQItem[];
  title?: string;
  schema?: string; // Pre-serialized JSON-LD passed from a Server Component
}

export function FAQ({ items, title = "Frequently Asked Questions", schema }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section aria-labelledby="faq-heading">
      {/* JSON-LD injected as dangerouslySetInnerHTML is fine only in Server Components.
          For client components we use suppressHydrationWarning to avoid mismatch,
          and the schema is pre-rendered by the server wrapper (FAQSchema). */}
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
          suppressHydrationWarning
        />
      )}

      <h2 id="faq-heading" className="text-xl font-bold text-foreground mb-6">
        {title}
      </h2>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
              aria-expanded={openIndex === i}
            >
              <span>{item.q}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                  openIndex === i && "rotate-180"
                )}
              />
            </button>
            {openIndex === i && (
              <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-3">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

