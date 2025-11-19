// Shared types for PRD generation flow
// These types mirror the Convex schema for frontend use

import type { Doc } from "@/convex/_generated/dataModel";

// Re-export Convex types for convenience
export type PrdProject = Doc<"prdProjects">;
export type QuestionSet = Doc<"questionSets">;
export type TechStackRecommendations = Doc<"techStackRecommendations">;
export type CompatibilityCheck = Doc<"compatibilityChecks">;
export type PRD = Doc<"prds">;

// Project status type
export type ProjectStatus =
  | "draft"
  | "questions"
  | "research"
  | "confirmation"
  | "validation"
  | "completed";

// Question category type
export type QuestionCategory = "features" | "audience" | "scale" | "workflow" | "technical";

// Question structure
export interface Question {
  id: number;
  question: string;
  options: string[];
  default: string;
  category: QuestionCategory;
}

// Question category colors
export const categoryColors: Record<QuestionCategory, string> = {
  features: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  audience: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  scale: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  workflow: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  technical: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
};

// Question category labels
export const categoryLabels: Record<QuestionCategory, string> = {
  features: "FEATURES",
  audience: "AUDIENCE",
  scale: "SCALE",
  workflow: "WORKFLOW",
  technical: "TECHNICAL",
};

// Tech recommendation structure
export interface TechRecommendation {
  technology: string;
  reasoning: string;
  pros: string[];
  cons: string[];
  alternatives: string[];
}

// Tech stack selections
export interface TechStackSelections {
  frontend: string;
  backend: string;
  database: string;
  auth: string;
  hosting: string;
}

// Tech category type
export type TechCategory = keyof TechStackSelections;

// Validation issue severity
export type ValidationSeverity = "critical" | "moderate" | "low";

// Validation status type
export type ValidationStatus = "approved" | "warnings" | "critical";

// Validation issue structure
export interface ValidationIssue {
  severity: ValidationSeverity;
  component: string;
  issue: string;
  recommendation: string;
}

// User persona structure
export interface UserPersona {
  name: string;
  description: string;
  useCases: string[];
}

// Feature structure
export interface Feature {
  name: string;
  description: string;
  priority: "must-have" | "nice-to-have";
}

// PRD content structure (matches the UI component expectations)
export interface PRDContent {
  projectOverview: {
    productName: string;
    description: string;
    targetAudience: string;
  };
  purposeAndGoals: {
    problemStatement: string;
    solution: string;
    keyObjectives: string[];
  };
  userPersonas: UserPersona[];
  techStack: {
    frontend: string;
    backend: string;
    database: string;
    auth: string;
    hosting: string;
  };
  features: {
    mvpFeatures: Feature[];
    niceToHaveFeatures: Feature[];
    outOfScope: string[];
  };
  technicalArchitecture: {
    systemDesign: string;
    dataModels: Array<{
      modelName: string;
      fields: string[];
    }>;
  };
  uiUxConsiderations: {
    designApproach: string;
    keyUserFlows: string[];
  };
}

// Generation status for progress tracking
export interface GenerationStatus {
  stage: string;
  progress: number;
  message: string;
  updatedAt: number;
}

// UI helper mappings
export const statusColors: Record<ProjectStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  questions: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  research: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  confirmation: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  validation: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  completed: "bg-success/10 text-success",
};

// PRD sections for navigation
export const prdSections = [
  { id: "overview", label: "Overview", number: "01" },
  { id: "goals", label: "Goals", number: "02" },
  { id: "personas", label: "Personas", number: "03" },
  { id: "techstack", label: "Tech Stack", number: "04" },
  { id: "features", label: "Features", number: "05" },
  { id: "architecture", label: "Architecture", number: "06" },
  { id: "uiux", label: "UI/UX", number: "07" },
];

export const statusLabels: Record<ProjectStatus, string> = {
  draft: "Draft",
  questions: "Questions",
  research: "Research",
  confirmation: "Confirmation",
  validation: "Validation",
  completed: "Completed",
};

export const severityColors: Record<ValidationSeverity, string> = {
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  moderate: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
};

export const validationStatusConfig: Record<ValidationStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  approved: {
    label: "Approved",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  warnings: {
    label: "Warnings",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  critical: {
    label: "Critical Issues",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
};

// Category descriptions for tech stack
export const categoryDescriptions: Record<TechCategory, string> = {
  frontend: "User interface and client-side functionality",
  backend: "Server-side logic and data processing",
  database: "Data storage and retrieval",
  auth: "User authentication and authorization",
  hosting: "Deployment and infrastructure",
};
