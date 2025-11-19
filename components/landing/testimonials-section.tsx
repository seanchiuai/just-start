import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Just Start saved me from building another app that would fail. The tech stack recommendations were spot-on for my SaaS project.",
    name: "Alex Chen",
    title: "Indie Developer",
    metric: "Saved 15+ hours",
  },
  {
    quote: "I handed the PRD directly to my freelance developer on Upwork. They said it was the clearest brief they'd ever received.",
    name: "Maria Santos",
    title: "Non-technical Founder",
    metric: "3x faster dev quotes",
  },
  {
    quote: "The compatibility validation caught a major issue with my auth provider. Would have wasted weeks if I'd started coding.",
    name: "Jordan Lee",
    title: "Full-stack Developer",
    metric: "Avoided 2 week refactor",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by developers
            </h2>
            <p className="text-lg text-muted-foreground">
              See what others are saying about Just Start
            </p>
          </div>

          {/* Testimonials grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 rounded-lg border border-border bg-card flex flex-col"
              >
                <Quote className="h-8 w-8 text-primary/20 mb-4" />

                <p className="text-foreground mb-6 flex-grow">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                <div className="pt-4 border-t border-border">
                  <div className="font-medium">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.title}
                  </div>
                  {testimonial.metric && (
                    <div className="mt-2 inline-flex px-2 py-1 rounded bg-primary/10 text-xs font-medium text-primary">
                      {testimonial.metric}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
