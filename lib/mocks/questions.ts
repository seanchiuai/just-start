export interface Question {
  id: number;
  question: string;
  options: string[];
  default: string;
  category: "features" | "audience" | "scale" | "workflow" | "technical";
}

export const mockQuestions: Question[] = [
  {
    id: 1,
    question: "What is the primary purpose of your app?",
    options: [
      "Productivity & Task Management",
      "Social Networking & Community",
      "E-commerce & Marketplace",
      "Education & Learning",
      "Content Creation & Media",
    ],
    default: "Productivity & Task Management",
    category: "features",
  },
  {
    id: 2,
    question: "Who is your primary target audience?",
    options: [
      "Individual consumers (B2C)",
      "Small teams (2-10 people)",
      "Medium businesses (10-100 people)",
      "Enterprise organizations (100+)",
      "Developers & Technical users",
    ],
    default: "Small teams (2-10 people)",
    category: "audience",
  },
  {
    id: 3,
    question: "What scale do you expect in the first year?",
    options: [
      "Under 100 users",
      "100-1,000 users",
      "1,000-10,000 users",
      "10,000-100,000 users",
      "100,000+ users",
    ],
    default: "1,000-10,000 users",
    category: "scale",
  },
  {
    id: 4,
    question: "What is the core user workflow?",
    options: [
      "Create and manage content",
      "Collaborate with team members",
      "Browse and purchase items",
      "Track progress and metrics",
      "Learn and complete courses",
    ],
    default: "Collaborate with team members",
    category: "workflow",
  },
  {
    id: 5,
    question: "What technical features are most important?",
    options: [
      "Real-time collaboration",
      "Offline functionality",
      "Third-party integrations",
      "Advanced analytics",
      "AI-powered features",
    ],
    default: "Real-time collaboration",
    category: "technical",
  },
  {
    id: 6,
    question: "How will users primarily access your app?",
    options: [
      "Web browser (desktop-first)",
      "Web browser (mobile-first)",
      "Native mobile app",
      "Desktop application",
      "Multiple platforms equally",
    ],
    default: "Web browser (desktop-first)",
    category: "technical",
  },
];

export const mockAnswers: Record<string, string> = {
  "1": "Productivity & Task Management",
  "2": "Small teams (2-10 people)",
};

export const categoryColors: Record<Question["category"], string> = {
  features: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  audience: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  scale: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  workflow: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  technical: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
};

export const categoryLabels: Record<Question["category"], string> = {
  features: "FEATURES",
  audience: "AUDIENCE",
  scale: "SCALE",
  workflow: "WORKFLOW",
  technical: "TECHNICAL",
};
