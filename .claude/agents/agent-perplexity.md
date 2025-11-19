# Perplexity Sonar API - Best Practices Agent

Implementation guide for Perplexity API with real-time research and structured outputs.

## Tools
All tools

## Instructions

### API Setup
```javascript
// Perplexity uses OpenAI-compatible API structure
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

async function callPerplexity(prompt, options = {}) {
  const response = await fetch(PERPLEXITY_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: options.model || 'sonar',
      messages: [{ role: 'user', content: prompt }],
      ...options
    })
  });
  return response.json();
}
```

### Models
- `sonar` - Basic model, cost-effective ($5/1000 searches)
- `sonar-pro` - Best factuality, real-time info ($3/750K input, $15/750K output)

### Structured Output Patterns

#### JSON Schema Format
```javascript
const response = await fetch(PERPLEXITY_API_URL, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'sonar-pro',
    messages: [{ role: 'user', content: prompt }],
    response_format: {
      type: 'json_schema',
      json_schema: {
        schema: {
          type: 'object',
          properties: {
            findings: {
              type: 'array',
              items: { type: 'string' }
            },
            summary: { type: 'string' }
          },
          required: ['findings', 'summary']
        }
      }
    }
  })
});
```

#### Regex Format (Sonar only)
```javascript
response_format: {
  type: 'regex',
  regex: { regex: '^(yes|no|maybe)$' }
}
```

### Important Caveats

#### Links in JSON Responses
**CRITICAL**: Never request links as part of JSON response content - they may hallucinate.

Instead, use citations from API response:
```javascript
const result = await callPerplexity(prompt, { response_format: {...} });
const content = JSON.parse(result.choices[0].message.content);
const citations = result.citations; // Use these for valid links
const searchResults = result.search_results; // Or these
```

#### Schema Limitations
- First request with new schema: 10-30 seconds warmup
- No recursive structures allowed
- No unconstrained objects

### Rate Limiting
```javascript
class PerplexityLimiter {
  constructor(maxRequests = 20, windowMs = 60000) {
    this.requests = [];
    this.max = maxRequests;
    this.window = windowMs;
  }

  async waitForSlot() {
    const now = Date.now();
    this.requests = this.requests.filter(t => now - t < this.window);
    if (this.requests.length >= this.max) {
      const wait = this.window - (now - this.requests[0]);
      await new Promise(r => setTimeout(r, wait));
    }
    this.requests.push(Date.now());
  }
}
```

### Research Query Patterns

#### Tech Stack Research
```javascript
const queries = [
  "Best React vs Next.js 2024 performance comparison",
  "PostgreSQL vs MongoDB for real-time apps 2024",
  "Modern authentication solutions comparison 2024"
];

const results = await Promise.all(
  queries.map(q => callPerplexity(q, { model: 'sonar-pro' }))
);
```

#### Compatibility Validation
```javascript
const validationPrompt = `Analyze compatibility of this tech stack:
${JSON.stringify(techStack)}

Check for:
- Version compatibility
- Integration issues
- Known conflicts
- Security concerns`;

const validation = await callPerplexity(validationPrompt, {
  model: 'sonar-pro',
  response_format: {
    type: 'json_schema',
    json_schema: {
      schema: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['approved', 'warnings', 'critical'] },
          issues: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                severity: { type: 'string' },
                component: { type: 'string' },
                issue: { type: 'string' },
                recommendation: { type: 'string' }
              }
            }
          },
          summary: { type: 'string' }
        },
        required: ['status', 'issues', 'summary']
      }
    }
  }
});
```

### Error Handling
```javascript
async function callWithRetry(prompt, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await callPerplexity(prompt, options);
      if (response.error) throw new Error(response.error.message);
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      // Exponential backoff
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
}
```

### Cost Optimization
- Use basic `sonar` for simple queries
- Reserve `sonar-pro` for factuality-critical research
- Cache results with TTL (research data changes)
- Batch similar queries when possible

### Security
- Store API keys in `.env.local`
- Never expose keys client-side
- Use server-side proxy
- Validate all user inputs before passing to API
