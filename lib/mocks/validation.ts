export type ValidationSeverity = "info" | "warning" | "critical";
export type ValidationStatus = "approved" | "warnings" | "critical";

export interface ValidationIssue {
  severity: ValidationSeverity;
  component: string;
  issue: string;
  recommendation: string;
}

export interface CompatibilityCheck {
  status: ValidationStatus;
  issues: ValidationIssue[];
  summary: string;
}

export const mockValidationResult: CompatibilityCheck = {
  status: "warnings",
  issues: [
    {
      severity: "warning",
      component: "Database",
      issue: "Convex requires specific Node.js version",
      recommendation:
        "Ensure Node 18+ is configured in your production environment. Update your Vercel settings if needed.",
    },
    {
      severity: "info",
      component: "Auth",
      issue: "Clerk webhook needs configuration",
      recommendation:
        "Set up a webhook in your Clerk dashboard to sync user data with Convex. See documentation for setup guide.",
    },
    {
      severity: "info",
      component: "Hosting",
      issue: "Environment variables required",
      recommendation:
        "Make sure to configure CLERK_SECRET_KEY and CONVEX_DEPLOY_KEY in your Vercel project settings.",
    },
  ],
  summary:
    "Your tech stack is compatible with 2 recommendations for optimal setup.",
};

export const mockApprovedResult: CompatibilityCheck = {
  status: "approved",
  issues: [],
  summary:
    "All technologies are fully compatible. Your stack is optimized for your project requirements.",
};

export const mockCriticalResult: CompatibilityCheck = {
  status: "critical",
  issues: [
    {
      severity: "critical",
      component: "Frontend",
      issue: "Next.js 15 requires React 19",
      recommendation:
        "Upgrade React to version 19 or downgrade Next.js to version 14 for React 18 compatibility.",
    },
    {
      severity: "critical",
      component: "Backend",
      issue: "Selected database is not compatible with Convex",
      recommendation:
        "Convex includes its own integrated database. Either use Convex's database or select a different backend solution.",
    },
    {
      severity: "warning",
      component: "Auth",
      issue: "Auth0 requires additional Convex integration setup",
      recommendation:
        "Consider using Clerk which has first-class Convex support, or follow Auth0's custom integration guide.",
    },
  ],
  summary:
    "Critical compatibility issues found. Please resolve these before proceeding.",
};

export const severityColors: Record<ValidationSeverity, string> = {
  info: "bg-info/10 text-info border-info/30",
  warning: "bg-warning/10 text-warning border-warning/30",
  critical: "bg-critical/10 text-critical border-critical/30",
};

export const statusConfig: Record<
  ValidationStatus,
  {
    label: string;
    color: string;
    bgColor: string;
  }
> = {
  approved: {
    label: "Approved",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  warnings: {
    label: "Warnings",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  critical: {
    label: "Critical Issues",
    color: "text-critical",
    bgColor: "bg-critical/10",
  },
};
