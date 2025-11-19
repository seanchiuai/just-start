"use node";

import Anthropic from "@anthropic-ai/sdk";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Question generation types
export interface Question {
  id: number;
  question: string;
  options: string[];
  default: string;
  category: string;
}

// Tech recommendation types
export interface TechRecommendation {
  technology: string;
  reasoning: string;
  pros: string[];
  cons: string[];
  alternatives: string[];
}

export interface TechRecommendations {
  frontend: TechRecommendation;
  backend: TechRecommendation;
  database: TechRecommendation;
  auth: TechRecommendation;
  hosting: TechRecommendation;
}

// Compatibility types
export interface CompatibilityIssue {
  severity: "critical" | "moderate" | "low";
  component: string;
  issue: string;
  recommendation: string;
}

// PRD content type
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
  userPersonas: Array<{
    name: string;
    description: string;
    useCases: string[];
  }>;
  techStack: {
    frontend: { technology: string; reasoning: string; pros: string[]; cons: string[] };
    backend: { technology: string; reasoning: string; pros: string[]; cons: string[] };
    database: { technology: string; reasoning: string; pros: string[]; cons: string[] };
    auth: { technology: string; reasoning: string; pros: string[]; cons: string[] };
    hosting: { technology: string; reasoning: string; pros: string[]; cons: string[] };
  };
  features: {
    mvpFeatures: Array<{
      name: string;
      description: string;
      priority: string;
      acceptanceCriteria: string[];
    }>;
    niceToHaveFeatures: Array<{
      name: string;
      description: string;
      priority: string;
    }>;
    outOfScope: string[];
  };
  technicalArchitecture: {
    systemDesign: string;
    dataModels: Array<{
      modelName: string;
      fields: string[];
      relationships: string[];
    }>;
    apiStructure: string;
    thirdPartyIntegrations: string[];
  };
  uiUxConsiderations: {
    designApproach: string;
    keyUserFlows: string[];
    styleGuidelines: string;
  };
}

// Generate clarifying questions
export async function generateQuestions(
  appName: string,
  appDescription: string
): Promise<Question[]> {
  const prompt = `You are helping a user plan their app "${appName}".

Description: ${appDescription}

Generate 4-6 multiple-choice questions to clarify the most critical gaps in understanding.
Each question should:
- Address one specific aspect (features, audience, scale, workflow, or technical)
- Have 3-5 options that cover common choices
- Include a sensible default option
- Be written in clear, non-technical language

Focus on questions that will most impact tech stack and architecture decisions.

Return ONLY valid JSON (no markdown, no code blocks):
{
  "questions": [
    {
      "id": 1,
      "question": "...",
      "options": ["Option A", "Option B", "Option C"],
      "default": "Option A",
      "category": "features"
    }
  ]
}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  const parsed = JSON.parse(content.text);
  return parsed.questions;
}

// Generate tech stack recommendations
export async function generateRecommendations(
  appName: string,
  appDescription: string,
  answers: Record<string, string>,
  research: string
): Promise<TechRecommendations> {
  const formattedAnswers = Object.entries(answers)
    .map(([id, answer]) => `Q${id}: ${answer}`)
    .join("\n");

  const prompt = `You are a senior software architect helping plan "${appName}".

App Description: ${appDescription}

User Requirements:
${formattedAnswers}

Current Research:
${research}

Generate tech stack recommendations with:
1. Specific technology for each category (frontend, backend, database, auth, hosting)
2. Reasoning specific to THIS project (not generic)
3. 3-4 pros specific to their use case
4. 2-3 cons they should be aware of
5. 2 alternatives if they prefer different tradeoffs

Return ONLY valid JSON (no markdown, no code blocks):
{
  "frontend": {
    "technology": "Next.js 15",
    "reasoning": "...",
    "pros": ["...", "..."],
    "cons": ["...", "..."],
    "alternatives": ["React + Vite", "Remix"]
  },
  "backend": {...},
  "database": {...},
  "auth": {...},
  "hosting": {...}
}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  return JSON.parse(content.text);
}

// Analyze compatibility issues
export async function analyzeCompatibilityIssues(
  stack: {
    frontend: string;
    backend: string;
    database: string;
    auth: string;
    hosting: string;
  },
  research: string
): Promise<CompatibilityIssue[]> {
  const prompt = `Analyze this tech stack for compatibility issues:

Stack:
- Frontend: ${stack.frontend}
- Backend: ${stack.backend}
- Database: ${stack.database}
- Auth: ${stack.auth}
- Hosting: ${stack.hosting}

Research findings:
${research}

Identify:
1. Version compatibility issues
2. Integration challenges
3. Deprecated technologies
4. Production readiness concerns
5. Missing requirements

For each issue, provide:
- severity: "critical" | "moderate" | "low"
- component: affected technology
- issue: clear description
- recommendation: how to resolve

Critical issues should block PRD generation.
Moderate issues are warnings but can proceed.
Low issues are nice-to-know.

Return ONLY valid JSON array (no markdown, no code blocks):
[
  {
    "severity": "moderate",
    "component": "Next.js",
    "issue": "...",
    "recommendation": "..."
  }
]

If no issues found, return an empty array: []`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  return JSON.parse(content.text);
}

// Generate comprehensive PRD
export async function generatePRD(
  appName: string,
  appDescription: string,
  answers: Record<string, string>,
  techStack: {
    frontend: string;
    backend: string;
    database: string;
    auth: string;
    hosting: string;
  },
  techRecommendations: TechRecommendations,
  compatibilityNotes: string
): Promise<PRDContent> {
  const formattedAnswers = Object.entries(answers)
    .map(([id, answer]) => `Q${id}: ${answer}`)
    .join("\n");

  const prompt = `Generate a comprehensive Product Requirements Document for "${appName}".

## Context

### Original Description
${appDescription}

### Clarified Requirements
${formattedAnswers}

### Confirmed Tech Stack
- Frontend: ${techStack.frontend}
- Backend: ${techStack.backend}
- Database: ${techStack.database}
- Auth: ${techStack.auth}
- Hosting: ${techStack.hosting}

### Tech Stack Reasoning
Frontend: ${techRecommendations.frontend.reasoning}
Backend: ${techRecommendations.backend.reasoning}
Database: ${techRecommendations.database.reasoning}
Auth: ${techRecommendations.auth.reasoning}
Hosting: ${techRecommendations.hosting.reasoning}

### Compatibility Notes
${compatibilityNotes}

## Instructions

Create a production-ready PRD that a developer can immediately use to start building.

Include:
1. **Project Overview**: Refined product name, description, and target audience
2. **Purpose & Goals**: Clear problem statement, solution, and 5-7 key objectives
3. **User Personas**: 2-3 detailed personas with realistic use cases
4. **Tech Stack**: Full details with project-specific pros/cons
5. **MVP Features**: 8-12 features with descriptions, priorities, and acceptance criteria
6. **Nice-to-Have Features**: 4-6 features for post-MVP
7. **Out of Scope**: Clear boundaries
8. **Technical Architecture**:
   - System design overview
   - Data models with fields and relationships
   - API structure
   - Third-party integrations
9. **UI/UX Considerations**:
   - Design approach
   - Key user flows
   - Style guidelines

Make it:
- Actionable (developer can start immediately)
- Specific (no generic advice)
- Realistic (appropriate for the scale)
- Complete (nothing left ambiguous)

Return ONLY valid JSON matching this structure (no markdown, no code blocks):
{
  "projectOverview": {
    "productName": "...",
    "description": "...",
    "targetAudience": "..."
  },
  "purposeAndGoals": {
    "problemStatement": "...",
    "solution": "...",
    "keyObjectives": ["...", "..."]
  },
  "userPersonas": [
    {
      "name": "...",
      "description": "...",
      "useCases": ["...", "..."]
    }
  ],
  "techStack": {
    "frontend": { "technology": "...", "reasoning": "...", "pros": [...], "cons": [...] },
    "backend": {...},
    "database": {...},
    "auth": {...},
    "hosting": {...}
  },
  "features": {
    "mvpFeatures": [
      {
        "name": "...",
        "description": "...",
        "priority": "must-have",
        "acceptanceCriteria": ["...", "..."]
      }
    ],
    "niceToHaveFeatures": [
      {
        "name": "...",
        "description": "...",
        "priority": "nice-to-have"
      }
    ],
    "outOfScope": ["...", "..."]
  },
  "technicalArchitecture": {
    "systemDesign": "...",
    "dataModels": [
      {
        "modelName": "...",
        "fields": ["field1: type", "field2: type"],
        "relationships": ["..."]
      }
    ],
    "apiStructure": "...",
    "thirdPartyIntegrations": ["...", "..."]
  },
  "uiUxConsiderations": {
    "designApproach": "...",
    "keyUserFlows": ["...", "..."],
    "styleGuidelines": "..."
  }
}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514", // Using Sonnet for cost-effectiveness
    max_tokens: 8000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  return JSON.parse(content.text);
}
