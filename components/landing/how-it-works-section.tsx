import { FileText, MessageSquare, Cpu, FileOutput } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Describe your app",
    description: "Enter your app name and describe your idea in a few sentences",
  },
  {
    icon: MessageSquare,
    title: "Answer clarifying questions",
    description: "AI generates smart questions to understand your needs",
  },
  {
    icon: Cpu,
    title: "Review tech recommendations",
    description: "Get researched tech stack suggestions with pros/cons",
  },
  {
    icon: FileOutput,
    title: "Get your PRD",
    description: "Receive a comprehensive, developer-ready PRD document",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-lg text-muted-foreground">
              From idea to PRD in four simple steps
            </p>
          </div>

          {/* Steps */}
          <div className="relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="relative text-center">
                    {/* Step number */}
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-card border-2 border-primary mb-4 relative z-10">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>

                    {/* Step content */}
                    <h3 className="font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time estimate */}
          <div className="text-center mt-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium">
              <span className="text-lg">⏱</span>
              5 minutes total
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
