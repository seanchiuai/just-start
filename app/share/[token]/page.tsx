"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { FileText, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PRDViewer } from "@/components/features/prd/prd-viewer";
import { mockPRD } from "@/lib/mocks/prd";

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;

  // Mock states - will be replaced with Convex query during integration
  const isLoading = false;
  const isExpired = false;
  const isInvalid = false;

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading PRD...</p>
        </div>
      </div>
    );
  }

  // Show expired state
  if (isExpired) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="rounded-full bg-warning/10 p-4 inline-block mb-4">
              <Clock className="h-8 w-8 text-warning" />
            </div>
            <h2 className="font-display text-xl font-semibold mb-2">
              Link Expired
            </h2>
            <p className="text-muted-foreground mb-6">
              This share link has expired. Share links are valid for 7 days
              after creation.
            </p>
            <Button asChild>
              <Link href="/">Create Your Own PRD</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show invalid state
  if (isInvalid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="rounded-full bg-destructive/10 p-4 inline-block mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="font-display text-xl font-semibold mb-2">
              Invalid Link
            </h2>
            <p className="text-muted-foreground mb-6">
              This share link is invalid or has been revoked.
            </p>
            <Button asChild>
              <Link href="/">Create Your Own PRD</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show PRD
  return (
    <div className="min-h-screen bg-background bg-dotgrid">
      {/* Minimal header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-display font-semibold">Just Start</span>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/">Create Your Own</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* PRD content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Shared indicator */}
          <div className="mb-6 text-center">
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
              <FileText className="h-3 w-3" />
              Shared PRD
            </span>
          </div>

          {/* PRD viewer */}
          <div className="bg-paper-warm rounded-lg border p-6 sm:p-8 shadow-sm">
            <PRDViewer prd={mockPRD} />
          </div>
        </div>
      </main>

      {/* Footer CTA */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4 text-center">
          <h3 className="font-display text-lg font-semibold mb-2">
            Want to create your own PRD?
          </h3>
          <p className="text-muted-foreground mb-4">
            Turn your app idea into a comprehensive product specification in
            minutes.
          </p>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/">Get Started Free</Link>
          </Button>
        </div>
      </footer>
    </div>
  );
}
