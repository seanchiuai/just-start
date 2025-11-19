import { CheckCircle, ArrowRight } from "lucide-react";

const benefits = [
  "Clarify your vision with AI-guided questions",
  "Get researched tech stack recommendations",
  "Validate compatibility before you code",
  "Generate professional PRD documents",
];

export function SolutionSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Just Start does the thinking for you
            </h2>
            <p className="text-lg text-muted-foreground">
              Transform your vague idea into an actionable development plan
            </p>
          </div>

          {/* Benefits list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
              >
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                <span className="font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Visual transformation */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 py-8">
            <div className="text-center">
              <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center mb-3">
                <span className="text-4xl">💡</span>
              </div>
              <span className="text-sm text-muted-foreground">Vague Idea</span>
            </div>

            <ArrowRight className="h-6 w-6 text-primary rotate-90 md:rotate-0" />

            <div className="text-center">
              <div className="w-32 h-32 rounded-lg bg-primary/10 border-2 border-primary flex items-center justify-center mb-3">
                <span className="text-4xl">📋</span>
              </div>
              <span className="text-sm font-medium text-primary">Production PRD</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
