# Anthropic Claude API - Best Practices Agent

Implementation guide for Claude API with structured JSON outputs.

## Tools
All tools

## Instructions

### API Setup
```javascript
const Anthropic = require('@anthropic-ai/sdk');
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
```

### Structured JSON Output Patterns

#### Method 1: Tool Use (Recommended)
Force structured output via tool definitions:
```javascript
const tools = [{
  name: "extract_data",
  description: "Extracts structured data",
  input_schema: {
    type: "object",
    properties: {
      field1: { type: "string", description: "Description" },
      field2: { type: "array", items: { type: "string" } }
    },
    required: ["field1", "field2"]
  }
}];

const response = await client.messages.create({
  model: "claude-sonnet-4-5-20250929",
  max_tokens: 4096,
  tools,
  messages: [{ role: "user", content: "Use extract_data tool..." }]
});

// Extract JSON from tool use
for (const content of response.content) {
  if (content.type === "tool_use") {
    return content.input; // Structured JSON
  }
}
```

#### Method 2: Prefill Assistant Response
```javascript
const response = await client.messages.create({
  model: "claude-sonnet-4-5-20250929",
  max_tokens: 1024,
  messages: [
    { role: "user", content: "Return JSON with..." },
    { role: "assistant", content: "{" } // Prefill forces JSON
  ]
});

// Robustly extract JSON from response
function extractJSON(text) {
  const trimmed = text.trim();

  // If already valid JSON, parse directly
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      return JSON.parse(trimmed);
    } catch (e) {
      // Fall through to extraction
    }
  }

  // Find JSON substring
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error(`Invalid JSON response: no valid JSON object found in: ${trimmed.substring(0, 100)}...`);
  }

  const jsonStr = trimmed.substring(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    throw new Error(`Failed to parse extracted JSON: ${e.message}. Content: ${jsonStr.substring(0, 100)}...`);
  }
}

// For prefilled responses, prepend "{" since we started with it
const json = extractJSON("{" + response.content[0].text);
```

#### Method 3: Explicit Instructions
```javascript
const systemPrompt = `CRITICAL: Your ENTIRE response must be ONLY valid JSON.
- Do NOT include markdown code fences
- Do NOT include explanatory text
- Output MUST be parseable by JSON.parse()`;
```

### Chain-of-Thought with Structured Output
```javascript
const prompt = `<thinking>
1. Analyze the requirements
2. Identify key data points
3. Structure the response
</thinking>

Now output ONLY valid JSON:`;
```

### Retry Logic
```javascript
async function callWithRetry(prompt, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await client.messages.create({...});
      return JSON.parse(response.content[0].text);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
}
```

### Rate Limiting
```javascript
class RateLimiter {
  constructor(maxRequests = 50, windowMs = 60000) {
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

### Model Selection
- `claude-sonnet-4-5-20250929` - Latest, balanced speed/quality (recommended)
- `claude-opus-4-20250514` - Complex tasks, long-form content
- `claude-3-haiku-20240307` - Fast, simple tasks

### Error Handling
```javascript
try {
  const response = await client.messages.create({...});
} catch (error) {
  if (error.status === 429) {
    // Rate limited - wait and retry
  } else if (error.status === 400) {
    // Bad request - check input
  }
}
```

### Cost Optimization
- Use Sonnet for intermediate steps
- Use Opus only for final complex output
- Cache repeated queries
- Implement streaming for long outputs

### Security
- Store API keys in `.env.local`
- Never expose keys client-side
- Use server-side proxy for API calls
- Implement request signing for production
