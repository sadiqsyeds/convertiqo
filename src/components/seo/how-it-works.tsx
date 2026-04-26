interface Step {
  step: number;
  title: string;
  description: string;
}

interface HowItWorksProps {
  steps: Step[];
  title?: string;
}

export function HowItWorks({
  steps,
  title = "How It Works",
}: HowItWorksProps) {
  return (
    <section aria-labelledby="how-heading">
      <h2 id="how-heading" className="text-xl font-bold text-foreground mb-6">
        {title}
      </h2>
      <ol className="space-y-4">
        {steps.map((s) => (
          <li key={s.step} className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
              {s.step}
            </div>
            <div className="pt-0.5">
              <h3 className="text-sm font-semibold text-foreground mb-1">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

// Default steps for the generic converter
export const DEFAULT_HOW_IT_WORKS_STEPS: Step[] = [
  {
    step: 1,
    title: "Upload your file",
    description: "Click the upload area or drag and drop your file. Supports images, videos, PDFs, and Word documents up to 200 MB.",
  },
  {
    step: 2,
    title: "Choose output format",
    description: "Select the output format from the format chips shown below your file. Optionally adjust quality, resolution, or other settings.",
  },
  {
    step: 3,
    title: "Convert & download",
    description: "Click Convert. Your file is processed instantly in your browser — nothing is uploaded to any server. Download the result immediately.",
  },
];
