# PRD Generator - API Quick Reference

## Overview
This guide shows how to implement structured API calls to Claude and Perplexity for the PRD generator flow.

## Critical Requirements

### ✅ All LLM responses must be pure JSON
- No markdown code fences (```)
- No explanatory text outside JSON
- Must be parseable by `JSON.parse()`

### ✅ Response validation required
- Validate schema before using data
- Handle parsing errors with retries
- Implement rate limiting

---

## API Endpoints

### Claude API
```
POST https://api.anthropic.com/v1/messages
Headers:
  - x-api-key: YOUR_API_KEY
  - anthropic-version: 2023-06-01
  - Content-Type: application/json
```

### Perplexity API
```
POST https://api.perplexity.ai/chat/completions
Headers:
  - Authorization: Bearer YOUR_API_KEY
  - Content-Type: application/json
```

---

## Step 1: Generate Questions (Claude)

### Request
```javascript
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 4096,
  "messages": [{
    "role": "user",
    "content": "[Full Prompt #1 from main doc with variables replaced]"
  }]
}
```

### Expected Response
```json
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
```

### Validation
- `questions` is array, 1-6 items
- Each has `id`, `question`, `options` (3-5 strings), `default`
- `default` matches one option exactly

---

## Step 2: Generate Research Queries (Claude)

### Request
```javascript
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 2048,
  "messages": [{
    "role": "user",
    "content": "[Full Prompt #2 with app details + user answers]"
  }]
}
```

### Expected Response
```json
{
  "queries": [
    "Best React vs Next.js for real-time chat app 2024",
    "PostgreSQL vs MongoDB for social media platform",
    "Implementing secure payment processing Stripe vs Square"
  ],
  "reasoning": "Queries cover frontend, database, and payment decisions."
}
```

### Validation
- `queries` is array, 3-5 strings
- `reasoning` is string, 20-500 chars

---

## Step 3: Research Tech Stack (Perplexity)

### Request
```javascript
{
  "model": "llama-3.1-sonar-large-128k-online",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful tech architecture expert."
    },
    {
      "role": "user",
      "content": "[Full Perplexity Prompt #1 with queries]"
    }
  ]
}
```

### Expected Response
```
Plain text with structured sections:
- Frontend recommendations
- Backend recommendations
- Database recommendations
- etc.
```

### Validation
- Non-empty string
- Contains key sections

---

## Step 4: Present Tech Stack (Claude)

### Request
```javascript
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 4096,
  "messages": [{
    "role": "user",
    "content": "[Full Prompt #3 with research findings]"
  }]
}
```

### Expected Response
```
Markdown formatted text with:
- Executive Summary
- Recommended Tech Stack (structured)
- Architecture Overview
- Next Steps
```

### Validation
- Non-empty string
- Contains required sections

---

## Step 5: Validate Compatibility (Perplexity)

### Request
```javascript
{
  "model": "llama-3.1-sonar-large-128k-online",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful tech architecture expert."
    },
    {
      "role": "user",
      "content": "[Full Perplexity Prompt #2 with confirmed stack]"
    }
  ]
}
```

### Expected Response
```json
{
  "status": "approved",
  "issues": [],
  "summary": "Stack validated. No compatibility issues found."
}
```

OR with issues:
```json
{
  "status": "warnings",
  "issues": [
    {
      "severity": "moderate",
      "component": "Next.js 14 + Node 16",
      "issue": "Next.js 14 requires Node 18+",
      "recommendation": "Upgrade to Node 18 or use Next.js 13"
    }
  ],
  "summary": "Minor compatibility concerns detected."
}
```

### Validation
- `status` is "approved"|"warnings"|"critical"
- `issues` is array (can be empty)
- Each issue has `severity`, `component`, `issue`, `recommendation`

### Flow Control
- **approved**: Proceed to Step 6
- **warnings**: Show warnings, user can proceed or modify
- **critical**: Block, force user to reselect stack

---

## Step 6: Generate PRD (Claude Opus)

### Request
```javascript
{
  "model": "claude-opus-4-20250514", // Note: Opus for final PRD
  "max_tokens": 16384, // Larger for comprehensive PRD
  "messages": [{
    "role": "user",
    "content": "[Full Prompt #4 with all gathered data]"
  }]
}
```

### Expected Response
```
Full markdown PRD document (large)
Sections as defined in Prompt #4
```

### Validation
- Non-empty string
- Contains all required sections
- Properly formatted markdown

---

## Implementation Example

```javascript
class PRDGenerator {
  constructor(anthropicKey, perplexityKey) {
    this.anthropicKey = anthropicKey;
    this.perplexityKey = perplexityKey;
    this.claudeLimiter = new RateLimiter(50, 60000);
    this.perplexityLimiter = new RateLimiter(20, 60000);
  }

  async generate(appName, appDescription) {
    try {
      // Step 1: Questions
      const questions = await this.generateQuestions(appName, appDescription);
      const userAnswers = await this.getUserAnswers(questions);

      // Step 2: Research Queries
      const queries = await this.generateResearchQueries(
        appName, 
        appDescription, 
        userAnswers
      );

      // Step 3: Research
      const research = await this.researchTechStack(queries.queries);

      // Step 4: Present Stack
      const techPresentation = await this.presentTechStack(
        research,
        appName,
        userAnswers
      );
      const confirmedStack = await this.getUserStackConfirmation(
        techPresentation
      );

      // Step 5: Validate
      const validation = await this.validateCompatibility(
        appName,
        confirmedStack
      );

      if (validation.status === 'critical') {
        throw new Error('Critical compatibility issues');
      }

      // Step 6: Generate PRD
      const prd = await this.generatePRD(
        appName,
        appDescription,
        userAnswers,
        confirmedStack,
        validation
      );

      return { success: true, prd, validation };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async callClaude(prompt, model = 'claude-sonnet-4-20250514', maxTokens = 4096) {
    await this.claudeLimiter.waitForSlot();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.anthropicKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    return data.content[0].text;
  }

  async callPerplexity(prompt) {
    await this.perplexityLimiter.waitForSlot();

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.perplexityKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          { role: 'system', content: 'You are a helpful tech architecture expert.' },
          { role: 'user', content: prompt }
        ]
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }

  parseJSON(text) {
    // Strip markdown code fences
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  }

  async generateQuestions(appName, appDescription) {
    const prompt = this.buildPrompt1(appName, appDescription);
    const response = await this.callClaude(prompt);
    return this.parseJSON(response);
  }

  // ... implement other methods similarly
}

// Rate Limiter
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
```

---

## Error Handling

### Common Issues

**1. Invalid JSON Response**
```javascript
try {
  const data = this.parseJSON(response);
} catch (error) {
  // Retry with emphasis on JSON format
  console.error('Invalid JSON, retrying...');
  // Implement retry logic
}
```

**2. API Rate Limits**
```javascript
// Use rate limiters (shown above)
// Implement exponential backoff
```

**3. Validation Failures**
```javascript
if (!validateQuestions(data)) {
  throw new Error('Schema validation failed');
}
```

**4. Critical Compatibility Issues**
```javascript
if (validation.status === 'critical') {
  // Show issues to user
  // Request new tech stack selection
  // Do NOT proceed to PRD generation
}
```

---

## Testing

### Unit Tests
```javascript
describe('PRD Generator', () => {
  it('generates valid questions', async () => {
    const questions = await generator.generateQuestions('TestApp', 'A test app');
    expect(questions.questions).toBeInstanceOf(Array);
    expect(questions.questions.length).toBeGreaterThan(0);
    expect(questions.questions[0]).toHaveProperty('id');
    expect(questions.questions[0]).toHaveProperty('question');
    expect(questions.questions[0]).toHaveProperty('options');
    expect(questions.questions[0]).toHaveProperty('default');
  });

  it('validates compatibility correctly', async () => {
    const validation = await generator.validateCompatibility(
      'TestApp',
      mockTechStack
    );
    expect(['approved', 'warnings', 'critical']).toContain(validation.status);
  });
});
```

---

## Cost Estimation

### Per PRD Generation
- **Claude Sonnet** (Steps 1,2,3): ~10K tokens input, ~5K tokens output
  - Cost: ~$0.05
- **Claude Opus** (Step 6): ~15K tokens input, ~8K tokens output
  - Cost: ~$0.50
- **Perplexity** (Steps 3,5): ~5K tokens total
  - Cost: ~$0.01

**Total per PRD**: ~$0.56

### Monthly Estimates
- 100 PRDs/month: ~$56
- 1000 PRDs/month: ~$560

---

## Security Notes

1. **Never expose API keys in client-side code**
2. **Implement server-side proxy for API calls**
3. **Add authentication/authorization for your users**
4. **Rate limit by user to prevent abuse**
5. **Sanitize all user inputs**
6. **Log API usage for monitoring**

---

## Support & Resources

- Main prompt document: `prd-generator-prompts.md`
- Anthropic API docs: https://docs.anthropic.com
- Perplexity API docs: https://docs.perplexity.ai
