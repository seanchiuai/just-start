# PRD Generator: Complete Prompt Suite

## CLAUDE PROMPT #1: Initial Question Generation

### System Context
You are PRD requirements analyst. Generate clarification questions for app ideas. Focus on MVP essentials.

### Instructions
User provides app name + description. Your task:

1. **Analyze systematically** (wrap in `<analysis>` tags):
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

### Output Format

**CRITICAL: Your ENTIRE response must be ONLY valid JSON. No other text before or after.**

Return ONLY this JSON structure:
```json
{
  "questions": [
    {
      "id": 1,
      "question": "What are the core features you want in MVP?",
      "options": [
        "User auth, task mgmt, notifications",
        "Social sharing, real-time collab, chat", 
        "Payment processing, inventory, analytics",
        "User profiles, preferences, recommendations",
        "Project planning, milestones, team messaging"
      ],
      "default": "User auth, task mgmt, notifications"
    }
  ]
}
```

**Rules:**
- Output MUST be parseable by `JSON.parse()`
- Do NOT include markdown code fences (no ```)
- Do NOT include explanatory text
- Do NOT include the `<analysis>` tags in final output (use them internally, then output only JSON)
- Each question MUST have: `id` (number), `question` (string), `options` (array of 3-5 strings), `default` (string matching one option)
- IDs must be sequential starting from 1

### Input Variables
- `APP_NAME`: {app_name}
- `APP_DESCRIPTION`: {app_description}

### Constraints
- Focus on core functionality understanding
- Skip technical implementation details
- Skip marketing/minor preferences
- Avoid redundancy with clear aspects

---

## CLAUDE PROMPT #2: Research Query Generation

### System Context
You are tech research strategist. Generate Perplexity API search queries to find optimal tech stack and architecture for app.

### Instructions
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

### Output Format

**CRITICAL: Your ENTIRE response must be ONLY valid JSON. No other text.**

Return ONLY this JSON structure:
```json
{
  "queries": [
    "Best React vs Next.js for real-time chat app 2024",
    "PostgreSQL vs MongoDB for social media platform architecture",
    "Implementing secure payment processing Stripe vs Square comparison",
    "Scalable WebSocket architecture Node.js production setup",
    "Authentication best practices OAuth JWT 2024"
  ],
  "reasoning": "Queries cover frontend framework decision, database selection for social features, payment integration options, real-time infrastructure, and modern auth patterns."
}
```

**Rules:**
- Output MUST be parseable by `JSON.parse()`
- Do NOT include markdown code fences (no ```)
- Do NOT include the `<thinking>` tags in final output (use internally only)
- Do NOT include explanatory text outside JSON
- `queries` must be array of 3-5 strings
- `reasoning` must be single string (1-2 sentences)

### Input Variables
- `APP_NAME`: {app_name}
- `APP_DESCRIPTION`: {app_description}
- `USER_ANSWERS`: {user_answers}

### Output Structure
- 3-5 queries
- Brief reasoning explanation
- Valid JSON

---

## PERPLEXITY PROMPT #1: Tech Research

### System Instructions
You are expert tech architect. Research and recommend production-ready tech stack.

### Query Context
App: {app_name}
Description: {app_description}
Requirements: {user_answers}

Research queries: {generated_queries}

### Research Objectives
For EACH query, provide:

1. **Direct answers** with specific recommendations
2. **Comparative analysis** (when applicable)
3. **Production considerations** (scalability, maintenance, ecosystem)
4. **Current trends** (2024-2025)
5. **Integration compatibility** across stack

### Output Requirements
Structure findings clearly:
- **Frontend**: Framework, state management, styling
- **Backend**: Runtime/framework, API architecture
- **Database**: Primary DB, caching layer if needed
- **Authentication**: Auth strategy & tools
- **Infrastructure**: Hosting, CDN, serverless considerations
- **Key integrations**: Payment, storage, real-time, etc.

Prioritize:
- Battle-tested solutions
- Strong ecosystem/community
- Clear documentation
- Good developer experience
- Cost-effective at scale

Avoid:
- Bleeding-edge/experimental tech
- Deprecated tools
- Niche solutions without community

Format: Clear sections with rationale for each choice.

---

## CLAUDE PROMPT #3: Tech Stack Presentation

### System Context
You are technical consultant. Present Perplexity research findings in clear, decision-ready format.

### Instructions
Transform research into user-friendly tech stack recommendation.

**Process:**

<analysis>
1. Extract key recommendations from research
2. Identify primary choices vs alternatives
3. Note compatibility considerations
4. Highlight trade-offs
5. Prepare decision points for user confirmation
</analysis>

### Output Structure

#### 1. Executive Summary
Brief overview of recommended stack with key rationale (2-3 sentences).

#### 2. Recommended Tech Stack

**Frontend:**
- Primary: [Framework] - [1-line rationale]
- Alternative: [Framework] - [when to choose]

**Backend:**
- Primary: [Technology] - [1-line rationale]
- Alternative: [Technology] - [when to choose]

**Database:**
- Primary: [Database] - [1-line rationale]
- Alternative: [Database] - [when to choose]

**Authentication:**
- Recommended: [Solution] - [1-line rationale]

**Infrastructure:**
- Hosting: [Platform] - [1-line rationale]
- Additional: [CDN/Serverless/etc.]

**Key Integrations:**
- [Service 1]: [Purpose]
- [Service 2]: [Purpose]

#### 3. Architecture Overview
Brief description of how components work together (3-4 sentences).

#### 4. Next Steps
"Review recommendations above. Modify if needed, then confirm to generate PRD."

### Tone
- Clear & confident
- Non-technical language where possible
- Explain trade-offs simply
- Focus on "why" not just "what"

### Input Variables
- `PERPLEXITY_RESEARCH`: {research_output}
- `APP_NAME`: {app_name}
- `APP_REQUIREMENTS`: {user_answers}

---

## PERPLEXITY PROMPT #2: Compatibility Validation

### System Instructions
You are tech compatibility auditor. Validate selected tech stack for conflicts, deprecated tech, and integration issues.

### Validation Context
App: {app_name}
Selected Stack: {user_confirmed_stack}

### Validation Checks

#### 1. Version Compatibility
- Are selected versions compatible?
- Any known breaking changes between versions?
- Current LTS/stable versions available?

#### 2. Integration Issues
- Do selected technologies work well together?
- Known friction points?
- Additional middleware/adapters needed?

#### 3. Deprecation Status
- Any deprecated technologies selected?
- Sunset dates approaching?
- Migration paths if needed?

#### 4. Production Readiness
- Are selections production-ready?
- Known stability issues?
- Scalability concerns?

#### 5. Ecosystem Health
- Active maintenance?
- Community support strong?
- Recent security issues?

### Output Format

**CRITICAL: Your ENTIRE response must be ONLY valid JSON. No other text.**

Return ONLY this JSON structure:
```json
{
  "status": "approved|warnings|critical",
  "issues": [
    {
      "severity": "critical|moderate|low",
      "component": "[Technology name]",
      "issue": "[Clear description]",
      "recommendation": "[Specific action]"
    }
  ],
  "summary": "[Overall assessment]"
}
```

**Rules:**
- Output MUST be parseable by `JSON.parse()`
- Do NOT include markdown code fences (no ```)
- Do NOT include explanatory text outside JSON
- `status` must be exactly one of: "approved", "warnings", "critical"
- `issues` must be array (empty array `[]` if no issues)
- Each issue must have all 4 fields: `severity`, `component`, `issue`, `recommendation`
- `severity` must be exactly one of: "critical", "moderate", "low"
- `summary` must be single string

### Severity Definitions
- **Critical**: Blocks PRD generation, requires reselection
- **Moderate**: Proceed with caution, note in PRD
- **Low**: Minor consideration, can proceed

### Response Rules
- Only return issues if found
- Be specific with component names
- Provide actionable recommendations
- If no issues: `{"status": "approved", "issues": [], "summary": "Stack validated. No compatibility issues found."}`

---

## CLAUDE PROMPT #4: PRD Generation (Opus)

### System Context
You are expert product manager & technical architect. Generate comprehensive, production-ready PRD.

### Instructions
Create detailed PRD using all gathered information. Be thorough, specific, and actionable.

### PRD Structure

```markdown
# Product Requirements Document: {APP_NAME}

## 1. Executive Summary
### 1.1 Product Vision
[2-3 paragraph overview: What, why, who]

### 1.2 Success Metrics
- [Metric 1 with target]
- [Metric 2 with target]
- [Metric 3 with target]

## 2. Product Overview
### 2.1 Problem Statement
[Detailed pain point description]

### 2.2 Target Audience
[User personas, demographics, use cases]

### 2.3 Value Proposition
[Clear differentiation & benefits]

## 3. Core Features (MVP)
### Feature 1: [Name]
**Description:** [Detailed explanation]

**User Stories:**
- As a [user type], I want [action] so that [benefit]
- As a [user type], I want [action] so that [benefit]

**Acceptance Criteria:**
- [ ] [Specific, testable criterion]
- [ ] [Specific, testable criterion]
- [ ] [Specific, testable criterion]

**Technical Requirements:**
- [Backend needs]
- [Frontend needs]
- [Data model considerations]
- [API endpoints needed]

**Priority:** [Must-Have | Should-Have | Nice-to-Have]

[Repeat for each core feature]

## 4. Technical Architecture
### 4.1 Tech Stack
**Frontend:**
- Framework: [Choice with version]
- State Management: [Solution]
- Styling: [Approach]
- Key Libraries: [List]

**Backend:**
- Runtime: [Choice with version]
- Framework: [Choice with version]
- API Style: [REST/GraphQL/etc.]
- Key Libraries: [List]

**Database:**
- Primary: [DB with version]
- Caching: [Solution if applicable]
- ORM/Query Builder: [Tool]

**Authentication:**
- Strategy: [Approach]
- Implementation: [Tool/service]

**Infrastructure:**
- Hosting: [Platform]
- CDN: [Service]
- Monitoring: [Tools]
- CI/CD: [Pipeline approach]

**Third-Party Services:**
- [Service]: [Purpose]
- [Service]: [Purpose]

### 4.2 System Architecture
[Detailed component interaction description]

```
[ASCII diagram of architecture]
```

### 4.3 Data Model
**Key Entities:**

#### Entity 1: [Name]
```
{
  field1: type,
  field2: type,
  relationships: [...]
}
```

[Repeat for core entities]

### 4.4 API Design
**Core Endpoints:**

```
POST /api/v1/[resource]
GET /api/v1/[resource]/:id
PUT /api/v1/[resource]/:id
DELETE /api/v1/[resource]/:id
```

[Detail key endpoints with request/response schemas]

## 5. User Interface Design
### 5.1 Key Screens
- **Screen 1:** [Description, purpose, key interactions]
- **Screen 2:** [Description, purpose, key interactions]
- **Screen 3:** [Description, purpose, key interactions]

### 5.2 User Flows
**Flow 1: [Primary Action]**
1. [Step with UI element]
2. [Step with UI element]
3. [Step with UI element]
Result: [Outcome]

[Repeat for key flows]

### 5.3 UI Requirements
- Responsive design (mobile-first)
- Accessibility standards (WCAG 2.1 AA)
- Loading states & error handling
- Consistent design system

## 6. Security & Compliance
### 6.1 Authentication & Authorization
- [Auth mechanism]
- [Role-based access details]
- [Session management]

### 6.2 Data Security
- [Encryption approach]
- [Secure transmission]
- [Data retention policies]

### 6.3 Privacy
- [Privacy considerations]
- [GDPR/CCPA compliance if applicable]

## 7. Performance Requirements
- Page load: [Target time]
- API response: [Target time]
- Concurrent users: [Target capacity]
- Uptime: [Target SLA]

## 8. Development Phases
### Phase 1: MVP (Weeks 1-X)
**Features:**
- [Feature 1]
- [Feature 2]
- [Feature 3]

**Deliverables:**
- [Working prototype]
- [Core workflows functional]

### Phase 2: Enhancement (Weeks X-Y)
**Features:**
- [Feature 4]
- [Feature 5]

**Deliverables:**
- [Polish & optimization]

### Phase 3: Scale (Weeks Y-Z)
**Features:**
- [Advanced features]
- [Performance optimization]

**Deliverables:**
- [Production-ready app]

## 9. Testing Strategy
### 9.1 Unit Testing
- [Coverage targets]
- [Key areas to test]

### 9.2 Integration Testing
- [API testing approach]
- [E2E scenarios]

### 9.3 User Testing
- [Beta testing plan]
- [Feedback collection]

## 10. Deployment & Operations
### 10.1 Deployment Strategy
- [Environment setup: dev, staging, prod]
- [Deployment process]
- [Rollback procedures]

### 10.2 Monitoring
- [Application monitoring]
- [Error tracking]
- [Performance monitoring]
- [User analytics]

### 10.3 Maintenance
- [Update strategy]
- [Bug fix process]
- [Feature iteration cycle]

## 11. Risks & Mitigation
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| [Risk 1] | High/Med/Low | High/Med/Low | [Strategy] |
| [Risk 2] | High/Med/Low | High/Med/Low | [Strategy] |

## 12. Appendix
### 12.1 Glossary
[Key terms defined]

### 12.2 References
[External resources, documentation]

### 12.3 Changelog
- [Date]: Initial PRD creation
```

### Input Variables
- `APP_NAME`: {app_name}
- `APP_DESCRIPTION`: {app_description}
- `USER_ANSWERS`: {user_answers}
- `TECH_STACK`: {confirmed_tech_stack}
- `COMPATIBILITY_CHECK`: {validation_results}

### Quality Guidelines
1. **Be Specific**: No vague requirements
2. **Be Measurable**: Include concrete acceptance criteria
3. **Be Realistic**: Scope appropriate for MVP
4. **Be Technical**: Include implementation details
5. **Be Complete**: Cover all sections thoroughly

### Tone
- Professional & authoritative
- Clear & actionable
- Technical but accessible
- Focus on "why" + "how"

### Special Instructions
- If compatibility issues exist (moderate/critical), include in Risks section
- Reference validated tech stack throughout
- Ensure API design matches tech choices
- Make data models detailed enough to implement
- Include realistic timelines based on complexity

---

## API INTEGRATION GUIDE

### For Application Developers

#### 1. Calling Claude API (Prompts #1, #2, #3, #4)

```javascript
// Example: Claude API call for Prompt #1
async function generateQuestions(appName, appDescription) {
  const prompt = `You are PRD requirements analyst. Generate clarification questions for app ideas. Focus on MVP essentials.

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

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  const data = await response.json();
  const content = data.content[0].text;
  
  // Parse JSON response
  try {
    // Strip any potential markdown code fences
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error('Failed to parse JSON:', content);
    throw new Error('Invalid JSON response from Claude');
  }
}
```

#### 2. Calling Perplexity API (Prompts #1, #2)

```javascript
// Example: Perplexity API call for tech research
async function researchTechStack(queries) {
  const prompt = `You are expert tech architect. Research and recommend production-ready tech stack.

Research these queries: ${queries.join(', ')}

For EACH query, provide:
1. Direct answers with specific recommendations
2. Comparative analysis (when applicable)
3. Production considerations (scalability, maintenance, ecosystem)
4. Current trends (2024-2025)
5. Integration compatibility across stack

Structure findings clearly:
- **Frontend**: Framework, state management, styling
- **Backend**: Runtime/framework, API architecture
- **Database**: Primary DB, caching layer if needed
- **Authentication**: Auth strategy & tools
- **Infrastructure**: Hosting, CDN, serverless considerations
- **Key integrations**: Payment, storage, real-time, etc.

Prioritize:
- Battle-tested solutions
- Strong ecosystem/community
- Clear documentation
- Good developer experience
- Cost-effective at scale

Avoid:
- Bleeding-edge/experimental tech
- Deprecated tools
- Niche solutions without community

Format: Clear sections with rationale for each choice.`;

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
    },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful tech architecture expert.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
```

#### 3. Error Handling & Retries

```javascript
async function callWithRetry(apiFunction, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiFunction();
    } catch (error) {
      if (error.message.includes('Invalid JSON')) {
        console.log(`Retry ${i + 1}/${maxRetries}: Invalid JSON response`);
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      } else {
        throw error;
      }
    }
  }
}

// Usage
const questions = await callWithRetry(() => 
  generateQuestions('MyApp', 'A social platform for developers')
);
```

#### 4. Response Validation

```javascript
function validateQuestionsResponse(response) {
  if (!response.questions || !Array.isArray(response.questions)) {
    throw new Error('Invalid response: missing questions array');
  }
  
  response.questions.forEach((q, idx) => {
    if (!q.id || typeof q.id !== 'number') {
      throw new Error(`Question ${idx}: missing or invalid id`);
    }
    if (!q.question || typeof q.question !== 'string') {
      throw new Error(`Question ${idx}: missing or invalid question`);
    }
    if (!Array.isArray(q.options) || q.options.length < 3 || q.options.length > 5) {
      throw new Error(`Question ${idx}: options must be array of 3-5 strings`);
    }
    if (!q.default || !q.options.includes(q.default)) {
      throw new Error(`Question ${idx}: default must match one option`);
    }
  });
  
  return true;
}

function validateCompatibilityResponse(response) {
  const validStatuses = ['approved', 'warnings', 'critical'];
  if (!validStatuses.includes(response.status)) {
    throw new Error('Invalid status value');
  }
  
  if (!Array.isArray(response.issues)) {
    throw new Error('Issues must be array');
  }
  
  response.issues.forEach((issue, idx) => {
    const validSeverities = ['critical', 'moderate', 'low'];
    if (!validSeverities.includes(issue.severity)) {
      throw new Error(`Issue ${idx}: invalid severity`);
    }
    if (!issue.component || !issue.issue || !issue.recommendation) {
      throw new Error(`Issue ${idx}: missing required fields`);
    }
  });
  
  return true;
}
```

#### 5. Complete Flow Example

```javascript
async function generatePRD(appName, appDescription) {
  try {
    // Step 1: Generate questions
    console.log('Step 1: Generating questions...');
    const questionsData = await callWithRetry(() => 
      generateQuestions(appName, appDescription)
    );
    validateQuestionsResponse(questionsData);
    
    // Present questions to user and get answers
    const userAnswers = await presentQuestionsToUser(questionsData.questions);
    
    // Step 2: Generate research queries
    console.log('Step 2: Generating research queries...');
    const queriesData = await callWithRetry(() =>
      generateResearchQueries(appName, appDescription, userAnswers)
    );
    
    // Step 3: Research tech stack
    console.log('Step 3: Researching tech stack...');
    const research = await researchTechStack(queriesData.queries);
    
    // Step 4: Present tech recommendations
    console.log('Step 4: Presenting tech stack...');
    const techPresentation = await presentTechStack(research, appName, userAnswers);
    
    // Get user confirmation/modifications
    const confirmedStack = await getUserStackConfirmation(techPresentation);
    
    // Step 5: Validate compatibility
    console.log('Step 5: Validating compatibility...');
    const validation = await validateCompatibility(appName, confirmedStack);
    validateCompatibilityResponse(validation);
    
    if (validation.status === 'critical') {
      console.error('Critical compatibility issues found');
      return { error: 'critical_issues', issues: validation.issues };
    }
    
    // Step 6: Generate PRD
    console.log('Step 6: Generating PRD...');
    const prd = await generateFullPRD(
      appName,
      appDescription,
      userAnswers,
      confirmedStack,
      validation
    );
    
    return { success: true, prd, warnings: validation.issues };
    
  } catch (error) {
    console.error('PRD generation failed:', error);
    return { error: error.message };
  }
}
```

#### 6. Environment Variables Required

```bash
# .env file
ANTHROPIC_API_KEY=sk-ant-xxxxx
PERPLEXITY_API_KEY=pplx-xxxxx
```

#### 7. Rate Limiting Considerations

```javascript
// Simple rate limiter
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
      const waitTime = this.windowMs - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requests.push(Date.now());
  }
}

// Usage
const claudeLimiter = new RateLimiter(50, 60000); // 50 requests per minute
const perplexityLimiter = new RateLimiter(20, 60000); // 20 requests per minute

async function generateQuestionsWithRateLimit(...args) {
  await claudeLimiter.waitForSlot();
  return generateQuestions(...args);
}
```

---

## Prompt Usage Guide

### Step 1: Initial Input
**Input:** App name + description
**Prompt:** Claude Prompt #1
**Output:** JSON questions

### Step 2: Research & Architecture
**Input:** App details + user answers
**Prompt:** Claude Prompt #2 → Perplexity Prompt #1
**Output:** Research queries → Research findings

### Step 3: Tech Presentation
**Input:** Research findings
**Prompt:** Claude Prompt #3
**Output:** User-friendly tech recommendations

### Step 4: Validation
**Input:** User-confirmed stack
**Prompt:** Perplexity Prompt #2
**Output:** Compatibility check results

### Step 5: PRD Generation
**Input:** All gathered info + validated stack
**Prompt:** Claude Prompt #4 (Opus)
**Output:** Complete PRD document

---

## Variable Interpolation Guide

### Standard Variables Across Prompts
```python
variables = {
    "app_name": str,           # User-provided app name
    "app_description": str,    # User-provided description
    "user_answers": dict,      # Answers to clarification questions
    "generated_queries": list, # Search queries for Perplexity
    "research_output": str,    # Perplexity research findings
    "confirmed_tech_stack": dict, # User-confirmed technology choices
    "validation_results": dict    # Compatibility check results
}
```

### Example Data Flow
```python
# Step 1
input_1 = {
    "app_name": "TaskFlow",
    "app_description": "A project management tool for remote teams"
}

# Step 2
input_2 = {
    **input_1,
    "user_answers": {
        "core_features": "User auth, task mgmt, real-time collab",
        "scale": "50-100 concurrent users initially",
        "platform": "Web + mobile responsive"
    }
}

# Step 3
input_3 = {
    **input_2,
    "research_output": "[Perplexity response text]"
}

# Step 4
input_4 = {
    "app_name": "TaskFlow",
    "confirmed_tech_stack": {
        "frontend": "Next.js 14",
        "backend": "Node.js + Express",
        "database": "PostgreSQL",
        # ...
    }
}

# Step 5
input_5 = {
    **input_2,
    **input_4,
    "validation_results": {
        "status": "approved",
        "issues": []
    }
}
```

---

## TYPE DEFINITIONS & SCHEMAS

### TypeScript Interfaces

```typescript
// Prompt #1 Output
interface Question {
  id: number;
  question: string;
  options: string[];
  default: string;
}

interface QuestionsResponse {
  questions: Question[];
}

// Prompt #2 Output
interface ResearchQueriesResponse {
  queries: string[];
  reasoning: string;
}

// Perplexity #2 Output
interface CompatibilityIssue {
  severity: 'critical' | 'moderate' | 'low';
  component: string;
  issue: string;
  recommendation: string;
}

interface CompatibilityResponse {
  status: 'approved' | 'warnings' | 'critical';
  issues: CompatibilityIssue[];
  summary: string;
}

// Tech Stack Structure
interface TechStack {
  frontend: {
    framework: string;
    stateManagement?: string;
    styling: string;
    keyLibraries: string[];
  };
  backend: {
    runtime: string;
    framework: string;
    apiStyle: string;
    keyLibraries: string[];
  };
  database: {
    primary: string;
    caching?: string;
    orm?: string;
  };
  authentication: {
    strategy: string;
    implementation: string;
  };
  infrastructure: {
    hosting: string;
    cdn?: string;
    monitoring: string[];
    cicd: string;
  };
  thirdPartyServices: {
    [key: string]: string;
  };
}

// User Answers Structure
interface UserAnswers {
  [questionId: string]: string;
}
```

### JSON Schema for Validation

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {
    "QuestionsResponse": {
      "type": "object",
      "required": ["questions"],
      "properties": {
        "questions": {
          "type": "array",
          "minItems": 1,
          "maxItems": 6,
          "items": {
            "type": "object",
            "required": ["id", "question", "options", "default"],
            "properties": {
              "id": {
                "type": "integer",
                "minimum": 1
              },
              "question": {
                "type": "string",
                "minLength": 10
              },
              "options": {
                "type": "array",
                "minItems": 3,
                "maxItems": 5,
                "items": {
                  "type": "string",
                  "minLength": 5
                }
              },
              "default": {
                "type": "string",
                "minLength": 5
              }
            }
          }
        }
      }
    },
    "ResearchQueriesResponse": {
      "type": "object",
      "required": ["queries", "reasoning"],
      "properties": {
        "queries": {
          "type": "array",
          "minItems": 3,
          "maxItems": 5,
          "items": {
            "type": "string",
            "minLength": 10
          }
        },
        "reasoning": {
          "type": "string",
          "minLength": 20,
          "maxLength": 500
        }
      }
    },
    "CompatibilityResponse": {
      "type": "object",
      "required": ["status", "issues", "summary"],
      "properties": {
        "status": {
          "type": "string",
          "enum": ["approved", "warnings", "critical"]
        },
        "issues": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["severity", "component", "issue", "recommendation"],
            "properties": {
              "severity": {
                "type": "string",
                "enum": ["critical", "moderate", "low"]
              },
              "component": {
                "type": "string",
                "minLength": 2
              },
              "issue": {
                "type": "string",
                "minLength": 10
              },
              "recommendation": {
                "type": "string",
                "minLength": 10
              }
            }
          }
        },
        "summary": {
          "type": "string",
          "minLength": 10
        }
      }
    }
  }
}
```

### Validation Functions (JavaScript)

```javascript
const Ajv = require('ajv');
const ajv = new Ajv();

// Load schemas
const questionsSchema = require('./schemas/questions-schema.json');
const queriesSchema = require('./schemas/queries-schema.json');
const compatibilitySchema = require('./schemas/compatibility-schema.json');

// Compile validators
const validateQuestions = ajv.compile(questionsSchema);
const validateQueries = ajv.compile(queriesSchema);
const validateCompatibility = ajv.compile(compatibilitySchema);

// Validation wrapper
function validateResponse(data, validator, name) {
  const valid = validator(data);
  if (!valid) {
    console.error(`${name} validation failed:`, validator.errors);
    throw new Error(`Invalid ${name}: ${JSON.stringify(validator.errors)}`);
  }
  return true;
}

// Usage
try {
  const response = JSON.parse(apiResponse);
  validateResponse(response, validateQuestions, 'Questions Response');
  // Proceed with valid data
} catch (error) {
  console.error('Validation error:', error);
  // Handle invalid response
}
```

---

## Optimization Notes

### Token Efficiency
- Claude Prompt #1: ~1.5K tokens
- Claude Prompt #2: ~1K tokens
- Claude Prompt #3: ~1.2K tokens
- Claude Prompt #4: ~3K tokens
- Perplexity Prompts: ~800 tokens each

### Quality Assurance
- Test with diverse app types
- Validate JSON outputs
- Check for edge cases (very simple/complex apps)
- Ensure consistency across steps
- Monitor for hallucinated technologies

### Error Handling
- Invalid JSON → Retry with format emphasis
- Missing required fields → Request clarification
- Critical compatibility issues → Force reselection
- Ambiguous requirements → Generate more questions

---

## Advanced Patterns Used

### 1. Chain-of-Thought
- Explicit `<thinking>` and `<analysis>` tags
- Step-by-step reasoning required
- Verification steps included

### 2. Few-Shot Learning
- Structured examples in formats
- Clear input-output patterns
- Edge case handling shown

### 3. Progressive Disclosure
- Start simple (Prompt #1)
- Add complexity gradually
- Final prompt most detailed

### 4. Output Validation
- Strict JSON schemas
- Required field validation
- Format verification loops

### 5. Conditional Logic
- Special cases handled
- Branching based on inputs
- Error recovery paths

### 6. Modular Composition
- Each prompt standalone
- Clear input/output contracts
- Reusable components
