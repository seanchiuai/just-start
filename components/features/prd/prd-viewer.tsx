"use client";

import { useState, useEffect } from "react";
import { PRDNavigation } from "./prd-navigation";
import {
  OverviewSection,
  GoalsSection,
  PersonasSection,
  TechStackSection,
  FeaturesSection,
  ArchitectureSection,
  UIUXSection,
} from "./prd-sections";
import { PRDContent, prdSections } from "@/lib/mocks/prd";

interface PRDViewerProps {
  prd: PRDContent;
}

export function PRDViewer({ prd }: PRDViewerProps) {
  const [activeSection, setActiveSection] = useState("overview");

  // Track scroll position to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = prdSections.map((s) => document.getElementById(s.id));
      const scrollPosition = window.scrollY + 150;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(prdSections[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigate = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  return (
    <div className="flex gap-8">
      {/* Navigation */}
      <PRDNavigation
        sections={prdSections}
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-12">
        <OverviewSection prd={prd} />
        <GoalsSection prd={prd} />
        <PersonasSection prd={prd} />
        <TechStackSection prd={prd} />
        <FeaturesSection prd={prd} />
        <ArchitectureSection prd={prd} />
        <UIUXSection prd={prd} />
      </div>
    </div>
  );
}
