export type ProjectStatus =
  | "draft"
  | "questions"
  | "research"
  | "confirmation"
  | "validation"
  | "completed";

export interface MockProject {
  _id: string;
  appName: string;
  appDescription: string;
  status: ProjectStatus;
  currentStep: number;
  createdAt: number;
  updatedAt: number;
  lastAccessedAt: number;
}

export const mockProjects: MockProject[] = [
  {
    _id: "1",
    appName: "TaskFlow",
    appDescription:
      "A collaborative task management application for small development teams with real-time sync and drag-and-drop kanban boards.",
    status: "completed",
    currentStep: 5,
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
    updatedAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    lastAccessedAt: Date.now() - 2 * 60 * 60 * 1000,
  },
  {
    _id: "2",
    appName: "FitTrack Pro",
    appDescription:
      "Fitness tracking app with workout planning, progress photos, and social features for gym enthusiasts.",
    status: "validation",
    currentStep: 4,
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
    updatedAt: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
    lastAccessedAt: Date.now() - 24 * 60 * 60 * 1000,
  },
  {
    _id: "3",
    appName: "Recipe Hub",
    appDescription:
      "Recipe management and meal planning app with grocery list generation and nutritional information.",
    status: "questions",
    currentStep: 2,
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    updatedAt: Date.now() - 4 * 60 * 60 * 1000, // 4 hours ago
    lastAccessedAt: Date.now() - 4 * 60 * 60 * 1000,
  },
  {
    _id: "4",
    appName: "CodeReview AI",
    appDescription:
      "AI-powered code review tool that provides instant feedback on code quality, security, and best practices.",
    status: "draft",
    currentStep: 1,
    createdAt: Date.now() - 30 * 60 * 1000, // 30 minutes ago
    updatedAt: Date.now() - 30 * 60 * 1000,
    lastAccessedAt: Date.now() - 30 * 60 * 1000,
  },
];

export const statusColors: Record<ProjectStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  questions: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  research: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  confirmation: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  validation: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  completed: "bg-success/10 text-success",
};

export const statusLabels: Record<ProjectStatus, string> = {
  draft: "Draft",
  questions: "Questions",
  research: "Research",
  confirmation: "Confirmation",
  validation: "Validation",
  completed: "Completed",
};

export const mockUserStats = {
  prdsGenerated: 12,
  subscription: {
    tier: "free",
    credits: 3,
  },
};
