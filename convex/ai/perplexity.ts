"use node";

// Perplexity API wrapper with retry logic

interface PerplexityResponse {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<PerplexityResponse> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "");
        const error = new Error(
          `Perplexity API error ${response.status}: ${response.statusText}. ${errorBody}`
        );

        // Retry on 5xx errors or rate limits
        if (response.status >= 500 || response.status === 429) {
          if (attempt < maxRetries - 1) {
            const delay = Math.pow(2, attempt) * 1000;
            console.warn(`Retrying Perplexity request in ${delay}ms...`);
            await new Promise((r) => setTimeout(r, delay));
            continue;
          }
        }
        throw error;
      }

      return (await response.json()) as PerplexityResponse;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        const timeoutError = new Error(
          "Perplexity API request timed out after 30s"
        );
        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        throw timeoutError;
      }

      // Retry on network errors
      if (
        attempt < maxRetries - 1 &&
        error instanceof Error &&
        error.message.includes("fetch")
      ) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      throw error;
    }
  }

  throw new Error("Max retries exceeded");
}

// Research tech stack using Perplexity
export async function researchTechStack(
  appName: string,
  description: string,
  answers: Record<string, string>
): Promise<{ queries: string[]; results: string }> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error("PERPLEXITY_API_KEY not configured");
  }

  // Generate research queries based on app context
  const queries = generateResearchQueries(appName, description, answers);

  const results: string[] = [];

  for (const query of queries) {
    try {
      const response = await fetchWithRetry(
        "https://api.perplexity.ai/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "sonar-pro",
            messages: [{ role: "user", content: query }],
          }),
        }
      );

      const content = response.choices[0]?.message?.content;
      if (content) {
        results.push(`### ${query}\n${content}`);
      }
    } catch (error) {
      console.error(`Research query failed: ${query}`, error);
      // Continue with other queries even if one fails
      results.push(`### ${query}\nResearch failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  return {
    queries,
    results: results.join("\n\n---\n\n"),
  };
}

// Validate tech stack compatibility
export async function validateCompatibility(
  stack: {
    frontend: string;
    backend: string;
    database: string;
    auth: string;
    hosting: string;
  }
): Promise<string> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error("PERPLEXITY_API_KEY not configured");
  }

  const queries = [
    `${stack.frontend} compatibility with ${stack.backend} 2025`,
    `${stack.auth} integration with ${stack.backend}`,
    `${stack.database} best practices with ${stack.frontend}`,
    `${stack.hosting} deployment requirements for ${stack.frontend}`,
    `Common issues with ${stack.frontend} ${stack.backend} ${stack.database} stack`,
  ];

  const results: string[] = [];

  for (const query of queries) {
    try {
      const response = await fetchWithRetry(
        "https://api.perplexity.ai/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "sonar-pro",
            messages: [{ role: "user", content: query }],
          }),
        }
      );

      const content = response.choices[0]?.message?.content;
      if (content) {
        results.push(`### ${query}\n${content}`);
      }
    } catch (error) {
      console.error(`Validation query failed: ${query}`, error);
      results.push(`### ${query}\nValidation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  return results.join("\n\n---\n\n");
}

// Generate research queries based on app context
function generateResearchQueries(
  appName: string,
  description: string,
  answers: Record<string, string>
): string[] {
  // Analyze answers to determine app characteristics
  const appType = getAppType(answers, description);
  const scaleRequirements = getScaleRequirements(answers);
  const dataRequirements = getDataRequirements(answers);
  const authRequirements = getAuthRequirements(answers);
  const deploymentRequirements = getDeploymentRequirements(answers);

  return [
    `Best frontend framework for ${appType} applications in 2025`,
    `Recommended backend for ${scaleRequirements} scale applications`,
    `Database comparison for ${dataRequirements} data requirements`,
    `Authentication solutions for ${authRequirements}`,
    `Deployment and hosting options for ${deploymentRequirements}`,
  ];
}

function getAppType(answers: Record<string, string>, description: string): string {
  // Simple heuristic based on common patterns
  const desc = description.toLowerCase();
  if (desc.includes("real-time") || desc.includes("chat") || desc.includes("collaboration")) {
    return "real-time";
  }
  if (desc.includes("e-commerce") || desc.includes("shop") || desc.includes("marketplace")) {
    return "e-commerce";
  }
  if (desc.includes("dashboard") || desc.includes("analytics") || desc.includes("admin")) {
    return "data-intensive dashboard";
  }
  if (desc.includes("social") || desc.includes("community") || desc.includes("forum")) {
    return "social/community";
  }
  if (desc.includes("mobile") || desc.includes("app")) {
    return "mobile-first";
  }
  return "web application";
}

function getScaleRequirements(answers: Record<string, string>): string {
  // Check for scale-related answers
  for (const answer of Object.values(answers)) {
    const lower = answer.toLowerCase();
    if (lower.includes("thousands") || lower.includes("high traffic") || lower.includes("large scale")) {
      return "high";
    }
    if (lower.includes("hundreds") || lower.includes("medium")) {
      return "medium";
    }
  }
  return "small to medium";
}

function getDataRequirements(answers: Record<string, string>): string {
  for (const answer of Object.values(answers)) {
    const lower = answer.toLowerCase();
    if (lower.includes("relational") || lower.includes("complex queries") || lower.includes("sql")) {
      return "relational/SQL";
    }
    if (lower.includes("document") || lower.includes("flexible") || lower.includes("nosql")) {
      return "document/NoSQL";
    }
    if (lower.includes("real-time") || lower.includes("sync")) {
      return "real-time sync";
    }
  }
  return "general purpose";
}

function getAuthRequirements(answers: Record<string, string>): string {
  for (const answer of Object.values(answers)) {
    const lower = answer.toLowerCase();
    if (lower.includes("social") || lower.includes("oauth") || lower.includes("google") || lower.includes("github")) {
      return "social logins";
    }
    if (lower.includes("enterprise") || lower.includes("sso") || lower.includes("saml")) {
      return "enterprise SSO";
    }
    if (lower.includes("passwordless") || lower.includes("magic link")) {
      return "passwordless";
    }
  }
  return "email/password with optional social";
}

function getDeploymentRequirements(answers: Record<string, string>): string {
  for (const answer of Object.values(answers)) {
    const lower = answer.toLowerCase();
    if (lower.includes("serverless") || lower.includes("low maintenance")) {
      return "serverless/managed";
    }
    if (lower.includes("container") || lower.includes("docker") || lower.includes("kubernetes")) {
      return "containerized";
    }
    if (lower.includes("self-hosted") || lower.includes("on-premise")) {
      return "self-hosted";
    }
  }
  return "serverless/platform-as-a-service";
}
