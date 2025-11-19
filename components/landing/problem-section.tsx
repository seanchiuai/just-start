import { XCircle } from "lucide-react";

const painPoints = [
  "Abandoned 3+ projects due to architecture issues",
  "Spent weeks building the wrong features",
  "Chose incompatible technologies",
  "Can't explain requirements to developers",
];

export function ProblemSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Section header */}
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Sound familiar?
          </h2>
          <p className="text-lg text-muted-foreground mb-12">
            Most developers rush into coding without proper planning. The result?
          </p>

          {/* Pain points grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {painPoints.map((point, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border text-left"
              >
                <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <span className="text-foreground">{point}</span>
              </div>
            ))}
          </div>

          {/* Impact statement */}
          <p className="mt-8 text-muted-foreground italic">
            The enthusiasm to &ldquo;just start coding&rdquo; leads to technical debt,
            scope creep, and abandoned projects.
          </p>
        </div>
      </div>
    </section>
  );
}
