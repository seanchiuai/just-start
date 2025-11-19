import {
  MessageSquareText,
  Search,
  ShieldCheck,
  FileText,
  Share2,
  Save,
} from "lucide-react";

const features = [
  {
    id: "ai-questions",
    icon: MessageSquareText,
    title: "AI-Generated Questions",
    description: "Smart questions that uncover what you haven't thought about yet",
  },
  {
    id: "tech-research",
    icon: Search,
    title: "Tech Stack Research",
    description: "Real-time research on current best practices and compatibility",
  },
  {
    id: "validation",
    icon: ShieldCheck,
    title: "Compatibility Validation",
    description: "Check for version conflicts and integration issues before coding",
  },
  {
    id: "prds",
    icon: FileText,
    title: "Professional PRDs",
    description: "Structured documents ready for developers to start building",
  },
  {
    id: "export",
    icon: Share2,
    title: "Export & Share",
    description: "Download as JSON, Markdown, or PDF. Share with your team",
  },
  {
    id: "save",
    icon: Save,
    title: "Save & Resume",
    description: "Your progress is saved automatically. Continue anytime",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to plan right
            </h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive tools to transform ideas into actionable plans
            </p>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.id}
                  className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all group"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
