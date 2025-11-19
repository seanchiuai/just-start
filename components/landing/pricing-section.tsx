import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignUpButton } from "@clerk/nextjs";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Perfect for trying out Just Start",
    features: [
      "3 PRD generations",
      "All features included",
      "Export to JSON & Markdown",
      "7-day share links",
      "No credit card required",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    description: "For serious builders and teams",
    features: [
      "Unlimited PRD generations",
      "Priority AI processing",
      "PDF export",
      "Extended share links (30 days)",
      "Version history",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: true,
    annualPrice: "$15/mo billed annually",
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Start free, upgrade when you need more
            </p>
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`p-8 rounded-lg border bg-card ${
                  plan.popular
                    ? "border-primary shadow-lg relative"
                    : "border-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground">/{plan.period}</span>
                    )}
                  </div>
                  {plan.annualPrice && (
                    <div className="text-sm text-primary mt-1">
                      {plan.annualPrice}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <SignUpButton mode="modal">
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </SignUpButton>
              </div>
            ))}
          </div>

          {/* FAQ note */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            Cancel anytime. No hidden fees.
          </p>
        </div>
      </div>
    </section>
  );
}
