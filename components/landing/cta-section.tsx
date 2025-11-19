import { SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Main CTA */}
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to plan your app?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Stop guessing. Start with a solid foundation.
          </p>

          <SignUpButton mode="modal">
            <Button size="lg" className="text-base px-8">
              Create Your First PRD
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </SignUpButton>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Join 500+ developers planning smarter</span>
          </div>

          {/* Trust */}
          <div className="mt-4 text-sm text-muted-foreground">
            No credit card required · Cancel anytime
          </div>
        </div>
      </div>
    </section>
  );
}
