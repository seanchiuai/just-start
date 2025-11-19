// prd-generator.js
// Complete implementation of PRD Generator with structured outputs

require('dotenv').config();
const Ajv = require('ajv');

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    baseUrl: 'https://api.anthropic.com/v1',
    models: {
      sonnet: 'claude-sonnet-4-20250514',
      opus: 'claude-opus-4-20250514'
    },
    version: '2023-06-01',
    rateLimit: { maxRequests: 50, windowMs: 60000 }
  },
  perplexity: {
    apiKey: process.env.PERPLEXITY_API_KEY,
    baseUrl: 'https://api.perplexity.ai',
    model: 'llama-3.1-sonar-large-128k-online',
    rateLimit: { maxRequests: 20, windowMs: 60000 }
  }
};

// Validate required API keys
if (!CONFIG.anthropic.apiKey) {
  throw new Error('ANTHROPIC_API_KEY environment variable is required');
}
if (!CONFIG.perplexity.apiKey) {
  throw new Error('PERPLEXITY_API_KEY environment variable is required');
}

// ============================================
// SCHEMAS
// ============================================

const schemas = {
  questions: {
    type: 'object',
    required: ['questions'],
    properties: {
      questions: {
        type: 'array',
        minItems: 1,
        maxItems: 6,
        items: {
          type: 'object',
          required: ['id', 'question', 'options', 'default'],
          properties: {
            id: { type: 'integer', minimum: 1 },
            question: { type: 'string', minLength: 10 },
            options: {
              type: 'array',
              minItems: 3,
              maxItems: 5,
              items: { type: 'string', minLength: 5 }
            },
            default: { type: 'string', minLength: 5 }
          }
        }
      }
    }
  },
  
  queries: {
    type: 'object',
    required: ['queries', 'reasoning'],
    properties: {
      queries: {
        type: 'array',
        minItems: 3,
        maxItems: 5,
        items: { type: 'string', minLength: 10 }
      },
      reasoning: { type: 'string', minLength: 20, maxLength: 500 }
    }
  },
  
  compatibility: {
    type: 'object',
    required: ['status', 'issues', 'summary'],
    properties: {
      status: { type: 'string', enum: ['approved', 'warnings', 'critical'] },
      issues: {
        type: 'array',
        items: {
          type: 'object',
          required: ['severity', 'component', 'issue', 'recommendation'],
          properties: {
            severity: { type: 'string', enum: ['critical', 'moderate', 'low'] },
            component: { type: 'string', minLength: 2 },
            issue: { type: 'string', minLength: 10 },
            recommendation: { type: 'string', minLength: 10 }
          }
        }
      },
      summary: { type: 'string', minLength: 10 }
    }
  }
};

// ============================================
// UTILITY CLASSES
// ============================================

class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  async waitForSlot() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.windowMs - (now - oldestRequest) + 100;
      console.log(`Rate limit reached, waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.waitForSlot(); // Retry
    }

    this.requests.push(Date.now());
  }
}

class Validator {
  constructor() {
    this.ajv = new Ajv();
    this.validators = {};
    
    // Compile all schemas
    Object.keys(schemas).forEach(key => {
      this.validators[key] = this.ajv.compile(schemas[key]);
    });
  }

  validate(data, schemaName) {
    const validator = this.validators[schemaName];
    if (!validator) {
      throw new Error(`Unknown schema: ${schemaName}`);
    }

    const valid = validator(data);
    if (!valid) {
      console.error(`Validation errors for ${schemaName}:`, validator.errors);
      throw new Error(`Invalid ${schemaName}: ${JSON.stringify(validator.errors)}`);
    }

    return true;
  }

  parseAndValidate(text, schemaName) {
    // Strip markdown code fences
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let data;
    try {
      data = JSON.parse(cleaned);
    } catch (error) {
      throw new Error(`JSON parse error: ${error.message}\nContent: ${cleaned.substring(0, 200)}...`);
    }

    this.validate(data, schemaName);
    return data;
  }
}

// ============================================
// PRD GENERATOR
// ============================================

class PRDGenerator {
  constructor() {
    this.validator = new Validator();
    this.claudeLimiter = new RateLimiter(
      CONFIG.anthropic.rateLimit.maxRequests,
      CONFIG.anthropic.rateLimit.windowMs
    );
    this.perplexityLimiter = new RateLimiter(
      CONFIG.perplexity.rateLimit.maxRequests,
      CONFIG.perplexity.rateLimit.windowMs
    );
  }

  // ============================================
  // API CALLS
  // ============================================

  async callClaude(prompt, model = CONFIG.anthropic.models.sonnet, maxTokens = 4096) {
    await this.claudeLimiter.waitForSlot();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch(`${CONFIG.anthropic.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CONFIG.anthropic.apiKey,
          'anthropic-version': CONFIG.anthropic.version
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: prompt }]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Claude API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Claude API request timed out after 60 seconds');
      }
      throw error;
    }
  }

  async callPerplexity(prompt) {
    await this.perplexityLimiter.waitForSlot();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch(`${CONFIG.perplexity.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.perplexity.apiKey}`
        },
        body: JSON.stringify({
          model: CONFIG.perplexity.model,
          messages: [
            { role: 'system', content: 'You are a helpful tech architecture expert.' },
            { role: 'user', content: prompt }
          ]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Perplexity API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Perplexity API request timed out after 60 seconds');
      }
      throw error;
    }
  }

  // ============================================
  // PROMPT BUILDERS (Import from main doc)
  // ============================================

  buildPrompt1(appName, appDescription) {
    return `You are PRD requirements analyst. Generate clarification questions for app ideas. Focus on MVP essentials.

User provides app name + description. Your task:

1. **Analyze systematically** (wrap in \`<analysis>\` tags):
   - List clearly defined aspects
   - Identify missing/unclear info from:
     • Purpose & pain point
     • Core vs nice-to-have features
     • Feature requirements & functionality
     • Backend system design needs
     • Theme/style preferences
     • UI workflow
     • Target audience & interaction model
   - Rank missing elements by importance
   - Determine which 4-6 areas need questions (or 1 if mostly clear)

2. **Generate 4-6 questions** (or 1 if description is comprehensive):
   - Multiple-choice format
   - 3-5 options each
   - Clearly marked default answer
   - Address ONLY critical gaps
   - Order by importance (most critical first)
   - **FIRST QUESTION ALWAYS**: "What are the core features for MVP?"

3. **Special case**: If all essentials are clear, generate ONE question confirming/refining core features.

**CRITICAL: Your ENTIRE response must be ONLY valid JSON. No other text before or after.**

Return ONLY this JSON structure:
{
  "questions": [
    {
      "id": 1,
      "question": "What are the core features you want in MVP?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"],
      "default": "Option 1"
    }
  ]
}

**Rules:**
- Output MUST be parseable by JSON.parse()
- Do NOT include markdown code fences (no \`\`\`)
- Do NOT include explanatory text
- Do NOT include the <analysis> tags in final output (use them internally, then output only JSON)
- Each question MUST have: id (number), question (string), options (array of 3-5 strings), default (string matching one option)
- IDs must be sequential starting from 1

APP_NAME: ${appName}
APP_DESCRIPTION: ${appDescription}`;
  }

  buildPrompt2(appName, appDescription, userAnswers) {
    const answersText = Object.entries(userAnswers)
      .map(([q, a]) => `Q: ${q}\nA: ${a}`)
      .join('\n\n');

    return `You are tech research strategist. Generate Perplexity API search queries to find optimal tech stack and architecture for app.

Given app details + user answers, generate 3-5 targeted search queries for Perplexity.

**Think step-by-step:**

<thinking>
1. What core technologies needed? (frontend framework, backend, database)
2. What specialized features require specific tools? (payments, auth, real-time, ML)
3. What architectural patterns fit scale/complexity?
4. What proven solutions exist for similar apps?
5. What integration/compatibility considerations?
</thinking>

**Query construction rules:**
- Be specific: Include app type, features, scale
- Focus on: Best practices, comparisons, production-ready solutions
- Prioritize: Modern (2023-2025), widely-adopted, well-documented
- Include: "2024" or "2025" for current recommendations
- Format: Natural questions or search phrases

**CRITICAL: Your ENTIRE response must be ONLY valid JSON. No other text.**

Return ONLY this JSON structure:
{
  "queries": [
    "Query 1",
    "Query 2",
    "Query 3"
  ],
  "reasoning": "Brief explanation of query choices."
}

**Rules:**
- Output MUST be parseable by JSON.parse()
- Do NOT include markdown code fences (no \`\`\`)
- Do NOT include the <thinking> tags in final output (use internally only)
- Do NOT include explanatory text outside JSON
- queries must be array of 3-5 strings
- reasoning must be single string (1-2 sentences)

APP_NAME: ${appName}
APP_DESCRIPTION: ${appDescription}
USER_ANSWERS:
${answersText}`;
  }

  // Additional prompt builders would follow same pattern...
  // (Abbreviated for length - full versions in main doc)

  // ============================================
  // STEP METHODS
  // ============================================

  async step1_generateQuestions(appName, appDescription) {
    console.log('Step 1: Generating clarification questions...');
    const prompt = this.buildPrompt1(appName, appDescription);
    const response = await this.callClaude(prompt);
    const data = this.validator.parseAndValidate(response, 'questions');
    console.log(`✓ Generated ${data.questions.length} questions`);
    return data;
  }

  async step2_generateResearchQueries(appName, appDescription, userAnswers) {
    console.log('Step 2: Generating research queries...');
    const prompt = this.buildPrompt2(appName, appDescription, userAnswers);
    const response = await this.callClaude(prompt);
    const data = this.validator.parseAndValidate(response, 'queries');
    console.log(`✓ Generated ${data.queries.length} research queries`);
    return data;
  }

  async step3_researchTechStack(queries) {
    console.log('Step 3: Researching tech stack...');
    // Use Perplexity Prompt #1 here
    const prompt = `[Full Perplexity research prompt with queries: ${queries.join(', ')}]`;
    const research = await this.callPerplexity(prompt);
    console.log(`✓ Completed tech stack research`);
    return research;
  }

  async step4_presentTechStack(research, appName, userAnswers) {
    console.log('Step 4: Presenting tech stack recommendations...');
    // Use Claude Prompt #3 here
    const prompt = `[Full presentation prompt with research findings]`;
    const presentation = await this.callClaude(prompt, CONFIG.anthropic.models.sonnet, 4096);
    console.log(`✓ Tech stack presentation ready`);
    return presentation;
  }

  async step5_validateCompatibility(appName, confirmedStack) {
    console.log('Step 5: Validating tech stack compatibility...');
    // Use Perplexity Prompt #2 here
    const prompt = `[Full validation prompt with confirmed stack]`;
    const response = await this.callPerplexity(prompt);
    const data = this.validator.parseAndValidate(response, 'compatibility');
    console.log(`✓ Validation complete: ${data.status}`);
    return data;
  }

  async step6_generatePRD(appName, appDescription, userAnswers, techStack, validation) {
    console.log('Step 6: Generating comprehensive PRD...');
    // Use Claude Prompt #4 (Opus) here
    const prompt = `[Full PRD generation prompt with all data]`;
    const prd = await this.callClaude(prompt, CONFIG.anthropic.models.opus, 16384);
    console.log(`✓ PRD generated successfully`);
    return prd;
  }

  // ============================================
  // MAIN FLOW
  // ============================================

  async generate(appName, appDescription, getUserInput, retryCount = 0) {
    const MAX_RETRIES = 3;

    if (retryCount >= MAX_RETRIES) {
      throw new Error(`Maximum retry limit (${MAX_RETRIES}) exceeded for compatibility resolution`);
    }

    try {
      // Step 1: Generate questions
      const questionsData = await this.step1_generateQuestions(appName, appDescription);
      
      // Get user answers (via callback)
      const userAnswers = await getUserInput.getAnswers(questionsData.questions);

      // Step 2: Generate research queries
      const queriesData = await this.step2_generateResearchQueries(
        appName, 
        appDescription, 
        userAnswers
      );

      // Step 3: Research tech stack
      const research = await this.step3_researchTechStack(queriesData.queries);

      // Step 4: Present tech recommendations
      const techPresentation = await this.step4_presentTechStack(
        research,
        appName,
        userAnswers
      );

      // Get user confirmation of tech stack
      const confirmedStack = await getUserInput.confirmTechStack(techPresentation);

      // Step 5: Validate compatibility
      const validation = await this.step5_validateCompatibility(appName, confirmedStack);

      // Handle critical issues
      if (validation.status === 'critical') {
        console.error('Critical compatibility issues found:');
        validation.issues.forEach(issue => {
          console.error(`- ${issue.component}: ${issue.issue}`);
        });
        
        const shouldRetry = await getUserInput.handleCriticalIssues(validation.issues);
        if (shouldRetry) {
          // Recursive call with modified stack and incremented retry count
          return this.generate(appName, appDescription, getUserInput, retryCount + 1);
        } else {
          throw new Error('Critical compatibility issues unresolved');
        }
      }

      // Step 6: Generate final PRD
      const prd = await this.step6_generatePRD(
        appName,
        appDescription,
        userAnswers,
        confirmedStack,
        validation
      );

      return {
        success: true,
        prd,
        validation,
        metadata: {
          appName,
          appDescription,
          userAnswers,
          techStack: confirmedStack,
          generatedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('PRD generation failed:', error);
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }
}

// ============================================
// USAGE EXAMPLE
// ============================================

async function main() {
  const generator = new PRDGenerator();

  // Mock user input handler (replace with actual UI)
  const userInputHandler = {
    async getAnswers(questions) {
      // In real app, present questions to user via UI
      console.log('\nQuestions for user:');
      questions.forEach(q => {
        console.log(`${q.id}. ${q.question}`);
        console.log(`   Options: ${q.options.join(', ')}`);
        console.log(`   Default: ${q.default}\n`);
      });

      // For demo, return defaults
      const answers = {};
      questions.forEach(q => {
        answers[q.question] = q.default;
      });
      return answers;
    },

    async confirmTechStack(presentation) {
      // In real app, present tech stack to user for confirmation/modification
      console.log('\nTech Stack Presentation:');
      console.log(presentation);
      
      // For demo, return mock confirmed stack
      return {
        frontend: { framework: 'Next.js 14', styling: 'Tailwind CSS' },
        backend: { runtime: 'Node.js 20', framework: 'Express' },
        database: { primary: 'PostgreSQL 16' },
        authentication: { strategy: 'JWT', implementation: 'NextAuth.js' }
      };
    },

    async handleCriticalIssues(issues) {
      console.error('\nCritical issues detected. User must fix tech stack.');
      return false; // Don't retry in demo
    }
  };

  // Generate PRD
  const result = await generator.generate(
    'TaskFlow',
    'A project management tool for remote teams with real-time collaboration',
    userInputHandler
  );

  if (result.success) {
    console.log('\n========================================');
    console.log('PRD GENERATED SUCCESSFULLY');
    console.log('========================================\n');
    console.log(result.prd);
  } else {
    console.error('\nPRD generation failed:', result.error);
  }
}

// Export for use as module
module.exports = { PRDGenerator, schemas, Validator, RateLimiter };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
