import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

interface ToolCTAProps {
  title?: string;
  description?: string;
}

export function ToolCTA({
  title = "Ready to convert your files?",
  description = "Drag and drop your files — no sign-up, no upload, no waiting. Everything runs in your browser.",
}: ToolCTAProps) {
  return (
    <section className="rounded-2xl bg-primary/5 border border-primary/20 px-6 py-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <Zap className="h-6 w-6 text-primary-foreground" fill="currentColor" />
        </div>
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">{description}</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Open Converter
        <ArrowRight className="h-4 w-4" />
      </Link>
      <p className="mt-4 text-xs text-muted-foreground">
        100% free · No sign-up · Works in your browser · Files never leave your device
      </p>
    </section>
  );
}
