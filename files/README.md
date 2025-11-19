# PRD Generator - Structured Output Implementation

Complete AI-powered PRD generation system using Claude (Anthropic) and Perplexity APIs with strict structured outputs.

## 📋 Overview

This implementation converts your app idea into a comprehensive Product Requirements Document through 6 automated steps:

1. **Question Generation** (Claude) → Structured JSON questions
2. **Research Query Generation** (Claude) → Structured JSON queries  
3. **Tech Stack Research** (Perplexity) → Research findings
4. **Tech Presentation** (Claude) → Markdown presentation
5. **Compatibility Validation** (Perplexity) → Structured JSON validation
6. **PRD Generation** (Claude Opus) → Complete markdown PRD

## ✨ Key Features

- ✅ **Strict structured outputs** - All responses validated against JSON schemas
- ✅ **Automatic retries** - Handles malformed JSON responses
- ✅ **Rate limiting** - Built-in rate limiters for both APIs
- ✅ **Type safety** - TypeScript definitions included
- ✅ **Error handling** - Comprehensive error recovery
- ✅ **Production ready** - Battle-tested prompt engineering patterns

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Environment Setup

Create `.env` file:

```bash
ANTHROPIC_API_KEY=sk-ant-xxxxx
PERPLEXITY_API_KEY=pplx-xxxxx
```

### Basic Usage

```javascript
const { PRDGenerator } = require('./prd-generator');

const generator = new PRDGenerator();

// Mock user input handler
const userInputHandler = {
  async getAnswers(questions) {
    // Present questions to user, return answers
    return answers;
  },
  
  async confirmTechStack(presentation) {
    // Show tech stack, get confirmation
    return confirmedStack;
  },
  
  async handleCriticalIssues(issues) {
    // Handle compatibility issues
    return shouldRetry;
  }
};

const result = await generator.generate(
  'MyApp',
  'A social platform for developers',
  userInputHandler
);

if (result.success) {
  console.log(result.prd);
}
```

### Run Demo

```bash
npm start
```

## 📚 Documentation

- **`prd-generator-prompts.md`** - Complete prompt engineering guide with all 6 prompts
- **`api-quick-reference.md`** - Quick API implementation reference
- **`prd-generator.js`** - Full Node.js implementation with schemas

## 🔧 API Structure

### Step 1: Generate Questions

**Input:**
- App name
- App description

**Output (Validated JSON):**
```json
{
  "questions": [
    {
      "id": 1,
      "question": "What are the core features?",
      "options": ["Option 1", "Option 2", "Option 3"],
      "default": "Option 1"
    }
  ]
}
```

### Step 2: Generate Research Queries

**Input:**
- App details
- User answers

**Output (Validated JSON):**
```json
{
  "queries": [
    "Best React vs Next.js 2024",
    "PostgreSQL vs MongoDB comparison"
  ],
  "reasoning": "Queries cover frontend and database decisions."
}
```

### Step 5: Validate Compatibility

**Input:**
- Confirmed tech stack

**Output (Validated JSON):**
```json
{
  "status": "approved",
  "issues": [],
  "summary": "No compatibility issues found."
}
```

## 🛡️ Schema Validation

All structured outputs validated using AJV:

```javascript
const { Validator } = require('./prd-generator');

const validator = new Validator();

// Parse and validate in one step
const data = validator.parseAndValidate(response, 'questions');

// Or validate separately
validator.validate(data, 'compatibility');
```

## ⚡ Rate Limiting

Built-in rate limiters prevent API throttling:

- **Claude API**: 50 requests/minute
- **Perplexity API**: 20 requests/minute

```javascript
const limiter = new RateLimiter(50, 60000);
await limiter.waitForSlot();
// Make API call
```

## 🎯 Prompt Engineering Patterns Used

### 1. Structured Output Enforcement
- Explicit JSON-only instructions
- No markdown code fences allowed
- Schema validation after every response

### 2. Chain-of-Thought
- `<thinking>` and `<analysis>` tags for reasoning
- Multi-step problem decomposition
- Self-verification steps

### 3. Progressive Disclosure
- Start simple (questions)
- Build complexity (research)
- Culminate in comprehensive PRD

### 4. Error Recovery
- JSON parsing with fallbacks
- Retry logic with exponential backoff
- Validation before proceeding

### 5. Conditional Logic
- Special handling for simple vs complex apps
- Critical issue blocking
- Warning vs error states

## 💰 Cost Estimation

**Pricing as of November 2025** (API versions: Claude Sonnet 4.5, Claude Opus 4, Perplexity Sonar)

Per PRD generation:
- Claude Sonnet (Steps 1,2,3,4): ~$0.05
  - Based on ~15K input tokens and ~5K output tokens per step across 4 steps
  - Input: $3/MTok × 60K = $0.18, Output: $15/MTok × 20K = $0.30
- Claude Opus (Step 6): ~$0.50
  - Based on ~25K input tokens and ~8K output tokens for final PRD
  - Input: $15/MTok × 25K = $0.375, Output: $75/MTok × 8K = $0.60
- Perplexity (Steps 3,5): ~$0.01
  - Based on ~2K tokens per request × 2 requests at $5/MTok
- **Total: ~$0.56/PRD**

Monthly estimates:
- 100 PRDs: ~$56
- 1000 PRDs: ~$560

*Note: Token counts are estimates and vary by app complexity. Prices may change. Verify current costs at [Anthropic Pricing](https://www.anthropic.com/pricing) and [Perplexity Pricing](https://www.perplexity.ai/pricing).*

## 🔒 Security Best Practices

1. ✅ Never expose API keys client-side
2. ✅ Use server-side proxy for all API calls
3. ✅ Implement user authentication
4. ✅ Rate limit by user/IP
5. ✅ Sanitize all inputs
6. ✅ Log API usage for monitoring

## 🧪 Testing

```bash
npm test
```

Example test:

```javascript
describe('PRD Generator', () => {
  it('generates valid questions', async () => {
    const questions = await generator.generateQuestions(
      'TestApp',
      'A test application'
    );
    
    expect(questions.questions).toBeInstanceOf(Array);
    expect(questions.questions[0]).toHaveProperty('id');
    expect(questions.questions[0]).toHaveProperty('question');
    expect(questions.questions[0]).toHaveProperty('options');
    expect(questions.questions[0]).toHaveProperty('default');
  });
});
```

## 📊 Response Formats

### Questions Response
```typescript
interface Question {
  id: number;
  question: string;
  options: string[];
  default: string;
}

interface QuestionsResponse {
  questions: Question[];
}
```

### Compatibility Response
```typescript
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
```

## 🔍 Debugging

Enable detailed logging:

```javascript
// In prd-generator.js, add:
console.log('Raw API response:', response);
console.log('Parsed data:', data);
console.log('Validation result:', validator.validate(data, schema));
```

Common issues:
- **JSON parsing fails**: Check for markdown code fences in response
- **Validation fails**: Review schema against actual response structure
- **Rate limiting**: Increase wait times in rate limiter

## 🚧 Extending

### Add New Validation

```javascript
schemas.customValidation = {
  type: 'object',
  required: ['field1', 'field2'],
  properties: {
    field1: { type: 'string' },
    field2: { type: 'number' }
  }
};

// Use in code
const data = validator.parseAndValidate(response, 'customValidation');
```

### Add New Step

```javascript
async stepX_customAction(input) {
  console.log('Step X: Custom action...');
  const prompt = this.buildPromptX(input);
  const response = await this.callClaude(prompt);
  const data = this.validator.parseAndValidate(response, 'customValidation');
  console.log('✓ Custom action complete');
  return data;
}
```

## 📖 Resources

- [Anthropic API Docs](https://docs.anthropic.com)
- [Perplexity API Docs](https://docs.perplexity.ai)
- [Prompt Engineering Guide](./prd-generator-prompts.md)
- [API Quick Reference](./api-quick-reference.md)

## 🤝 Contributing

1. Follow existing prompt patterns
2. Always validate structured outputs
3. Add tests for new features
4. Update documentation

## 📄 License

MIT

## 🆘 Support

For issues:
1. Check API keys are valid
2. Verify rate limits not exceeded
3. Review validation errors
4. Check prompt formatting

## 📈 Roadmap

- [ ] Add streaming support for real-time PRD generation
- [ ] Implement caching for repeated queries
- [ ] Add webhook support for async processing
- [ ] Create web UI for user interactions
- [ ] Add PDF export for PRDs
- [ ] Implement version control for PRDs
- [ ] Add multi-language support

## 🎓 Learning Resources

This implementation demonstrates:
- Advanced prompt engineering
- Structured output handling
- API integration patterns
- Error recovery strategies
- Rate limiting techniques
- Schema validation
- Production-ready error handling

Study the code to learn these patterns for your own AI applications.
