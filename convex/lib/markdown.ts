export function prdToMarkdown(prd: {
    projectOverview?: { productName?: string; description?: string; targetAudience?: string };
    purposeAndGoals?: { problemStatement?: string; solution?: string; keyObjectives?: string[] };
    userPersonas?: Array<{ name?: string; description?: string; useCases?: string[] }>;
    techStack?: Record<string, { technology?: string; reasoning?: string; pros?: string[]; cons?: string[] }>;
    features?: {
        mvpFeatures?: Array<{ name?: string; description?: string; priority?: string; acceptanceCriteria?: string[] }>;
        niceToHaveFeatures?: Array<{ name?: string; description?: string; priority?: string }>;
        outOfScope?: string[];
    };
    technicalArchitecture?: {
        systemDesign?: string;
        dataModels?: Array<{ modelName?: string; fields?: string[]; relationships?: string[] }>;
        apiStructure?: string;
        thirdPartyIntegrations?: string[];
    };
    uiUxConsiderations?: { designApproach?: string; keyUserFlows?: string[]; styleGuidelines?: string };
}): string {
    const sections: string[] = [];

    // Title
    sections.push(`# ${prd.projectOverview?.productName || "Product Requirements Document"}\n`);

    // Project Overview
    if (prd.projectOverview) {
        sections.push("## Project Overview\n");
        sections.push(`${prd.projectOverview.description || ""}\n`);
        if (prd.projectOverview.targetAudience) {
            sections.push(`**Target Audience:** ${prd.projectOverview.targetAudience}\n`);
        }
    }

    // Purpose & Goals
    if (prd.purposeAndGoals) {
        sections.push("## Purpose & Goals\n");
        if (prd.purposeAndGoals.problemStatement) {
            sections.push("### Problem Statement\n");
            sections.push(`${prd.purposeAndGoals.problemStatement}\n`);
        }
        if (prd.purposeAndGoals.solution) {
            sections.push("### Solution\n");
            sections.push(`${prd.purposeAndGoals.solution}\n`);
        }
        if (prd.purposeAndGoals.keyObjectives?.length) {
            sections.push("### Key Objectives\n");
            sections.push(prd.purposeAndGoals.keyObjectives.map((o) => `- ${o}`).join("\n") + "\n");
        }
    }

    // User Personas
    if (prd.userPersonas?.length) {
        sections.push("## User Personas\n");
        for (const persona of prd.userPersonas) {
            sections.push(`### ${persona.name || "Persona"}\n`);
            sections.push(`${persona.description || ""}\n`);
            if (persona.useCases?.length) {
                sections.push("**Use Cases:**\n");
                sections.push(persona.useCases.map((u) => `- ${u}`).join("\n") + "\n");
            }
        }
    }

    // Tech Stack
    if (prd.techStack) {
        sections.push("## Tech Stack\n");
        for (const [category, tech] of Object.entries(prd.techStack)) {
            if (tech && typeof tech === "object") {
                sections.push(`### ${category.charAt(0).toUpperCase() + category.slice(1)}\n`);
                sections.push(`**${tech.technology || "Unknown"}**\n`);
                if (tech.reasoning) {
                    sections.push(`${tech.reasoning}\n`);
                }
                if (tech.pros?.length) {
                    sections.push("**Pros:**\n");
                    sections.push(tech.pros.map((p) => `- ${p}`).join("\n") + "\n");
                }
                if (tech.cons?.length) {
                    sections.push("**Cons:**\n");
                    sections.push(tech.cons.map((c) => `- ${c}`).join("\n") + "\n");
                }
            }
        }
    }

    // Features
    if (prd.features) {
        sections.push("## Features\n");

        if (prd.features.mvpFeatures?.length) {
            sections.push("### MVP Features\n");
            for (const feature of prd.features.mvpFeatures) {
                sections.push(`#### ${feature.name || "Feature"}\n`);
                sections.push(`${feature.description || ""}\n`);
                if (feature.priority) {
                    sections.push(`**Priority:** ${feature.priority}\n`);
                }
                if (feature.acceptanceCriteria?.length) {
                    sections.push("**Acceptance Criteria:**\n");
                    sections.push(feature.acceptanceCriteria.map((a) => `- ${a}`).join("\n") + "\n");
                }
            }
        }

        if (prd.features.niceToHaveFeatures?.length) {
            sections.push("### Nice-to-Have Features\n");
            for (const feature of prd.features.niceToHaveFeatures) {
                sections.push(`- **${feature.name || "Feature"}**: ${feature.description || ""}\n`);
            }
        }

        if (prd.features.outOfScope?.length) {
            sections.push("### Out of Scope\n");
            sections.push(prd.features.outOfScope.map((o) => `- ${o}`).join("\n") + "\n");
        }
    }

    // Technical Architecture
    if (prd.technicalArchitecture) {
        sections.push("## Technical Architecture\n");

        if (prd.technicalArchitecture.systemDesign) {
            sections.push("### System Design\n");
            sections.push(`${prd.technicalArchitecture.systemDesign}\n`);
        }

        if (prd.technicalArchitecture.dataModels?.length) {
            sections.push("### Data Models\n");
            for (const model of prd.technicalArchitecture.dataModels) {
                sections.push(`#### ${model.modelName || "Model"}\n`);
                if (model.fields?.length) {
                    sections.push("**Fields:**\n");
                    sections.push(model.fields.map((f) => `- ${f}`).join("\n") + "\n");
                }
                if (model.relationships?.length) {
                    sections.push("**Relationships:**\n");
                    sections.push(model.relationships.map((r) => `- ${r}`).join("\n") + "\n");
                }
            }
        }

        if (prd.technicalArchitecture.apiStructure) {
            sections.push("### API Structure\n");
            sections.push(`${prd.technicalArchitecture.apiStructure}\n`);
        }

        if (prd.technicalArchitecture.thirdPartyIntegrations?.length) {
            sections.push("### Third-Party Integrations\n");
            sections.push(prd.technicalArchitecture.thirdPartyIntegrations.map((i) => `- ${i}`).join("\n") + "\n");
        }
    }

    // UI/UX Considerations
    if (prd.uiUxConsiderations) {
        sections.push("## UI/UX Considerations\n");

        if (prd.uiUxConsiderations.designApproach) {
            sections.push("### Design Approach\n");
            sections.push(`${prd.uiUxConsiderations.designApproach}\n`);
        }

        if (prd.uiUxConsiderations.keyUserFlows?.length) {
            sections.push("### Key User Flows\n");
            sections.push(prd.uiUxConsiderations.keyUserFlows.map((f, i) => `${i + 1}. ${f}`).join("\n") + "\n");
        }

        if (prd.uiUxConsiderations.styleGuidelines) {
            sections.push("### Style Guidelines\n");
            sections.push(`${prd.uiUxConsiderations.styleGuidelines}\n`);
        }
    }

    // Footer
    sections.push("\n---\n*Generated by Just Start*");

    return sections.join("\n");
}
