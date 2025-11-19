import type { Metadata } from "next";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import ClientBody from "@/components/ClientBody";

export const metadata: Metadata = {
  title: "Just Start - AI-Powered PRD Generator",
  description: "Transform your app idea into a production-ready Product Requirements Document. AI-guided questions, tech stack research, and comprehensive PRDs.",
  keywords: ["PRD generator", "product requirements", "app planning", "tech stack", "AI planning tool"],
  icons: {
    icon: "/convex.svg",
  },
  openGraph: {
    title: "Just Start - Stop Coding. Start Planning.",
    description: "Generate professional PRDs with AI guidance",
    images: ["/og-image.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Just Start - AI PRD Generator",
    description: "Transform ideas into actionable PRDs",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <ClientBody className="antialiased">
          <ClerkProvider
            dynamic
            appearance={{
              layout: {
                unsafe_disableDevelopmentModeWarnings: true,
              },
              elements: {
                card: "card-minimal",
                headerTitle: "text-foreground font-bold",
                headerSubtitle: "text-muted-foreground",
                socialButtonsBlockButton: "border border-border hover:border-primary/50 hover:bg-muted/20 transition-all rounded-lg",
                formButtonPrimary: "bg-primary text-primary-foreground hover:opacity-90 transition-all rounded-lg",
                formFieldInput: "bg-input border border-border text-foreground rounded-lg focus:border-primary transition-colors placeholder:text-muted-foreground",
                footerActionLink: "text-primary hover:opacity-80 transition-colors",
                formFieldLabel: "text-foreground font-medium",
                formFieldInputShowPasswordButton: "text-muted-foreground hover:text-foreground",
                dividerLine: "bg-border",
                dividerText: "text-muted-foreground text-xs",
                formHeaderTitle: "text-foreground",
                formHeaderSubtitle: "text-muted-foreground",
                socialButtonsBlockButtonText: "text-foreground",
                formFieldSuccessText: "text-accent",
                formFieldErrorText: "text-destructive",
                identityPreviewText: "text-foreground",
                identityPreviewEditButton: "text-primary hover:opacity-80",
              }
            }}
          >
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </ClerkProvider>
        </ClientBody>
      </body>
    </html>
  );
}
