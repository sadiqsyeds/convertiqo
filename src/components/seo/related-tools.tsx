import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TOOL_PAGES, RELATED_TOOLS } from "@/lib/seo";

interface RelatedToolsProps {
  currentSlug: string;
}

export function RelatedTools({ currentSlug }: RelatedToolsProps) {
  const relatedSlugs = RELATED_TOOLS[currentSlug] ?? [];
  const relatedPages = relatedSlugs
    .map((slug) => TOOL_PAGES.find((p) => p.slug === slug))
    .filter(Boolean);

  if (relatedPages.length === 0) return null;

  return (
    <section aria-labelledby="related-heading">
      <h2 id="related-heading" className="text-xl font-bold text-foreground mb-4">
        Related Conversion Tools
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {relatedPages.map((page) => {
          if (!page) return null;
          return (
            <Link
              key={page.slug}
              href={`/${page.slug}`}
              className="group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 hover:border-primary/40 hover:bg-muted/50 transition-all"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{page.h1}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{page.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 ml-3 transition-colors" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
