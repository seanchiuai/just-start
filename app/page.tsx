"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  HeroSection,
  ProblemSection,
  SolutionSection,
  HowItWorksSection,
  FeaturesSection,
  PRDPreviewSection,
  TestimonialsSection,
  PricingSection,
  CTASection,
  Footer,
} from "@/components/landing";

export default function Home() {
  return (
    <>
      <Authenticated>
        <RedirectToDashboard />
      </Authenticated>
      <Unauthenticated>
        <LandingPage />
      </Unauthenticated>
    </>
  );
}

function RedirectToDashboard() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="inline-block px-6 py-2 rounded-lg border border-border mb-4">
          <span className="text-sm font-medium text-foreground tracking-wide">Just Start</span>
        </div>
        <p className="text-muted-foreground mt-2">Taking you to your dashboard...</p>
      </div>
    </div>
  );
}

function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Just Start",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Web",
            "description": "AI-powered PRD generator that transforms app ideas into production-ready Product Requirements Documents",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "127"
            }
          })
        }}
      />

      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <FeaturesSection />
      <PRDPreviewSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}
