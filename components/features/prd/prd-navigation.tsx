"use client";

import { cn } from "@/lib/utils";

interface PRDNavigationProps {
  sections: Array<{ id: string; label: string; number: string }>;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  variant?: "both" | "desktop" | "mobile";
  className?: string;
}

export function PRDNavigation({
  sections,
  activeSection,
  onNavigate,
  variant = "both",
  className,
}: PRDNavigationProps) {
  const showDesktop = variant !== "mobile";
  const showMobile = variant !== "desktop";

  return (
    <>
      {showDesktop && (
        <nav className={cn("hidden lg:block sticky top-24 w-48 shrink-0", className)}>
          <div className="space-y-1">
            {sections.map((section) => (
              <button
                type="button"
                key={section.id}
                onClick={() => onNavigate(section.id)}
                className={cn(
                  "flex items-center gap-3 w-full text-left px-3 py-2 rounded-md transition-colors text-sm",
                  activeSection === section.id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <span className="font-mono text-xs">{section.number}</span>
                <span>{section.label}</span>
                {activeSection === section.id && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Dotted connector line */}
          <div className="ml-4 mt-2 connector-dotted h-8" />
        </nav>
      )}

      {showMobile && (
        <div className={cn("lg:hidden overflow-x-auto -mx-4 px-4 pb-4 border-b", className)}>
          <div className="flex gap-2">
            {sections.map((section) => (
              <button
                type="button"
                key={section.id}
                onClick={() => onNavigate(section.id)}
                className={cn(
                  "whitespace-nowrap px-3 py-1.5 rounded-full text-sm transition-colors",
                  activeSection === section.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
