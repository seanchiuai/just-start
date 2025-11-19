export interface UserPersona {
  name: string;
  description: string;
  useCases: string[];
}

export interface Feature {
  name: string;
  description: string;
  priority: "must-have" | "nice-to-have";
}

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

export const mockPRD: PRDContent = {
  projectOverview: {
    productName: "TaskFlow",
    description:
      "A collaborative task management application designed for small development teams. TaskFlow helps teams organize sprints, track progress, and collaborate in real-time with an intuitive drag-and-drop interface.",
    targetAudience:
      "Small development teams (2-10 people) who need a lightweight, fast, and modern alternative to complex project management tools like Jira.",
  },
  purposeAndGoals: {
    problemStatement:
      "Small development teams often struggle with project management tools that are either too simple (lacking features) or too complex (overwhelming and slow). They need a middle-ground solution that provides essential task tracking without the overhead of enterprise tools.",
    solution:
      "TaskFlow provides a streamlined task management experience with real-time collaboration, customizable workflows, and a clean interface. It focuses on the core features teams actually use while eliminating unnecessary complexity.",
    keyObjectives: [
      "Enable real-time collaboration on task boards without page refreshes",
      "Reduce onboarding time to under 5 minutes for new team members",
      "Provide flexible sprint planning with drag-and-drop functionality",
      "Integrate with GitHub for automatic issue syncing",
      "Support custom workflows adaptable to any team process",
    ],
  },
  userPersonas: [
    {
      name: "Tech Lead (Primary)",
      description:
        "Sarah, a senior developer who leads a team of 5. She needs to plan sprints, assign tasks, and track progress without spending hours in meetings. Values efficiency and clear visibility into what everyone is working on.",
      useCases: [
        "Creates and assigns tasks during sprint planning",
        "Monitors team progress through dashboard views",
        "Reviews completed work and moves tasks through workflow stages",
        "Generates reports for stakeholder updates",
      ],
    },
    {
      name: "Developer (Secondary)",
      description:
        "Alex, a full-stack developer who prefers to focus on coding rather than process. Needs a simple way to see assigned tasks and update status without context switching.",
      useCases: [
        "Views personal task queue filtered by priority",
        "Updates task status with single click",
        "Adds comments and references pull requests",
        "Gets notifications for task assignments and mentions",
      ],
    },
  ],
  techStack: {
    frontend: "Next.js 15 with TypeScript and Tailwind CSS",
    backend: "Convex for real-time database and serverless functions",
    database: "Convex integrated NoSQL database",
    auth: "Clerk for authentication with team management",
    hosting: "Vercel for frontend, Convex Cloud for backend",
  },
  features: {
    mvpFeatures: [
      {
        name: "Task Board with Drag & Drop",
        description:
          "Kanban-style board with customizable columns. Tasks can be dragged between columns to update status. Real-time sync across all team members.",
        priority: "must-have",
      },
      {
        name: "Sprint Planning",
        description:
          "Create sprints with start/end dates. Move tasks from backlog to sprint. Track velocity and burndown. Archive completed sprints.",
        priority: "must-have",
      },
      {
        name: "Real-time Collaboration",
        description:
          "See team members' cursors and updates instantly. No refresh needed. Conflict resolution for simultaneous edits.",
        priority: "must-have",
      },
      {
        name: "Team Management",
        description:
          "Invite team members via email. Assign roles (admin, member, viewer). Team-based permissions for boards and tasks.",
        priority: "must-have",
      },
      {
        name: "Task Details & Comments",
        description:
          "Rich text descriptions, file attachments, checklists, due dates, labels, and threaded comments on each task.",
        priority: "must-have",
      },
    ],
    niceToHaveFeatures: [
      {
        name: "GitHub Integration",
        description:
          "Auto-create tasks from GitHub issues. Link pull requests to tasks. Update status when PR is merged.",
        priority: "nice-to-have",
      },
      {
        name: "Time Tracking",
        description:
          "Log time spent on tasks. Generate time reports by user, sprint, or project. Export for billing purposes.",
        priority: "nice-to-have",
      },
      {
        name: "Custom Fields",
        description:
          "Add custom fields to tasks (dropdown, number, date). Filter and sort by custom fields. Use in reports.",
        priority: "nice-to-have",
      },
    ],
    outOfScope: [
      "Mobile native apps (web-only for MVP)",
      "Resource management and capacity planning",
      "Advanced reporting and analytics",
      "Integrations beyond GitHub",
      "Offline mode",
    ],
  },
  technicalArchitecture: {
    systemDesign:
      "TaskFlow uses a real-time architecture with Convex as the backbone. The frontend subscribes to data changes through Convex queries, ensuring instant updates across all clients. Authentication flows through Clerk with JWT tokens passed to Convex for authorization. All business logic runs in Convex functions with role-based access control.",
    dataModels: [
      {
        modelName: "Team",
        fields: [
          "teamId: string",
          "name: string",
          "createdBy: string (userId)",
          "members: array of { userId, role, invitedAt }",
          "settings: object",
        ],
      },
      {
        modelName: "Board",
        fields: [
          "boardId: string",
          "teamId: string",
          "name: string",
          "columns: array of { id, name, order }",
          "isArchived: boolean",
        ],
      },
      {
        modelName: "Task",
        fields: [
          "taskId: string",
          "boardId: string",
          "columnId: string",
          "title: string",
          "description: string",
          "assigneeId: string",
          "priority: enum",
          "labels: string[]",
          "dueDate: timestamp",
          "order: number",
        ],
      },
    ],
  },
  uiUxConsiderations: {
    designApproach:
      "Clean, minimal interface with focus on content. Uses a light color scheme with accent colors for status and priority. Generous whitespace and clear typography. Responsive design optimized for desktop but functional on tablet. Keyboard shortcuts for power users.",
    keyUserFlows: [
      "New user signup → Create team → Invite members → Create first board → Add tasks",
      "Daily standup → Open board → Drag yesterday's tasks to Done → Review today's priorities",
      "Sprint planning → Create new sprint → Drag tasks from backlog → Set sprint goal → Start sprint",
      "Task completion → Open task → Update checklist → Add comment → Drag to Done column",
    ],
  },
};

export const prdSections = [
  { id: "overview", label: "Overview", number: "01" },
  { id: "goals", label: "Goals", number: "02" },
  { id: "personas", label: "Personas", number: "03" },
  { id: "techstack", label: "Tech Stack", number: "04" },
  { id: "features", label: "Features", number: "05" },
  { id: "architecture", label: "Architecture", number: "06" },
  { id: "uiux", label: "UI/UX", number: "07" },
];
