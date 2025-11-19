"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PRDViewer } from "@/components/features/prd/prd-viewer";
import { PRDActions } from "@/components/features/prd/prd-actions";
import { mockPRD } from "@/lib/mocks/prd";

export default function PRDPage() {
  // Mock project data - will be replaced with Convex query during integration
  const mockProject = {
    appName: "TaskFlow",
    currentStep: 5,
  };

  const handleExport = (format: "json" | "markdown") => {
    // Log for development - will be replaced with Convex action
    console.log(`Exporting PRD as ${format}`);
  };

  const handleShare = () => {
    // Log for development - will be replaced with share dialog
    console.log("Opening share dialog");
  };

  return (
    <div className="min-h-screen bg-background bg-dotgrid">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-foreground"
            >
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <h1 className="font-display text-xl font-semibold">
              {mockProject.appName} PRD
            </h1>
            <div className="w-24" /> {/* Spacer */}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-paper-warm rounded-lg border p-6 sm:p-8 shadow-sm">
            <PRDViewer prd={mockPRD} />
          </div>
        </div>
      </main>

      {/* Floating actions */}
      <PRDActions onExport={handleExport} onShare={handleShare} />
    </div>
  );
}
