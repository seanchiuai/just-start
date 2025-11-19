export interface TechRecommendation {
  technology: string;
  reasoning: string;
  pros: string[];
  cons: string[];
  alternatives: string[];
}

export interface TechStackRecommendations {
  frontend: TechRecommendation;
  backend: TechRecommendation;
  database: TechRecommendation;
  auth: TechRecommendation;
  hosting: TechRecommendation;
}

export type TechCategory = keyof TechStackRecommendations;

export const mockRecommendations: TechStackRecommendations = {
  frontend: {
    technology: "Next.js 15",
    reasoning:
      "Best choice for SEO-optimized React apps with server-side rendering. The App Router provides excellent developer experience with React Server Components for optimal performance.",
    pros: [
      "Server Components reduce JavaScript bundle size",
      "Streaming and Suspense for progressive loading",
      "Built-in SEO optimizations",
      "Excellent TypeScript support",
      "Vercel deployment integration",
    ],
    cons: [
      "Learning curve for App Router patterns",
      "Some third-party library compatibility issues",
      "Server Components require mental shift",
    ],
    alternatives: ["Remix", "Nuxt.js", "SvelteKit"],
  },
  backend: {
    technology: "Convex",
    reasoning:
      "Real-time database with serverless functions, perfect for TypeScript apps. Eliminates need for separate API layer and provides end-to-end type safety.",
    pros: [
      "Real-time reactivity out of the box",
      "TypeScript-first design",
      "No REST/GraphQL APIs needed",
      "Built-in Clerk integration",
      "Automatic scaling",
    ],
    cons: [
      "Smaller ecosystem than Firebase",
      "Vendor lock-in concerns",
      "NoSQL only - no SQL joins",
    ],
    alternatives: ["Supabase", "Firebase", "PlanetScale + tRPC"],
  },
  database: {
    technology: "Convex (Integrated)",
    reasoning:
      "Document database optimized for real-time apps. Schema defined in TypeScript for type safety. No separate database to configure.",
    pros: [
      "No separate setup required",
      "Document model fits PRD structure",
      "Schema validation built-in",
      "Real-time subscriptions",
      "Strongly consistent reads/writes",
    ],
    cons: [
      "No SQL queries",
      "Limited analytics capabilities",
      "Vendor lock-in",
    ],
    alternatives: ["PostgreSQL", "MongoDB Atlas", "PlanetScale"],
  },
  auth: {
    technology: "Clerk",
    reasoning:
      "Best authentication solution for modern Next.js apps. Drop-in components, handles all security, and has native Convex integration.",
    pros: [
      "Pre-built UI components",
      "Native Next.js 15 support",
      "First-class Convex integration",
      "Social logins with one click",
      "Free tier covers 10K MAU",
    ],
    cons: [
      "Some vendor lock-in",
      "Costs scale with users",
      "Limited UI customization",
    ],
    alternatives: ["Auth.js", "Supabase Auth", "Firebase Auth"],
  },
  hosting: {
    technology: "Vercel + Convex Cloud",
    reasoning:
      "Vercel is built by Next.js team for optimal deployment. Zero-config, automatic HTTPS, edge functions. Convex Cloud included with Convex.",
    pros: [
      "30-second deployments",
      "Preview URLs for every PR",
      "Global edge network",
      "Free SSL certificates",
      "Built-in analytics",
    ],
    cons: [
      "Bandwidth limits on free tier",
      "Costs can scale unpredictably",
      "Cold starts on serverless",
    ],
    alternatives: ["Netlify", "Railway", "AWS Amplify"],
  },
};

export const categoryDescriptions: Record<TechCategory, string> = {
  frontend: "User interface and client-side rendering",
  backend: "Server-side logic and API endpoints",
  database: "Data storage and retrieval",
  auth: "User authentication and authorization",
  hosting: "Deployment and infrastructure",
};

export const categoryIcons: Record<TechCategory, string> = {
  frontend: "Layout",
  backend: "Server",
  database: "Database",
  auth: "Shield",
  hosting: "Cloud",
};
