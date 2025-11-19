# AJV JSON Schema Validation - Best Practices Agent

Implementation guide for AJV JSON Schema validation in Node.js.

## Tools
All tools

## Instructions

### Installation
```bash
npm install ajv
```

### Basic Setup
```javascript
const Ajv = require('ajv');
const ajv = new Ajv();
```

### Schema Definitions

#### Object Schema
```javascript
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'integer', minimum: 0 },
    email: { type: 'string', format: 'email' }
  },
  required: ['name', 'email'],
  additionalProperties: false
};
```

#### Array Schema
```javascript
const arraySchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      value: { type: 'string' }
    },
    required: ['id', 'value']
  },
  minItems: 1
};
```

#### Nested Schema
```javascript
const nestedSchema = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          question: { type: 'string' },
          options: {
            type: 'array',
            items: { type: 'string' },
            minItems: 2
          },
          default: { type: 'string' }
        },
        required: ['id', 'question', 'options', 'default']
      }
    }
  },
  required: ['questions']
};
```

### Validation Patterns

#### Basic Validation
```javascript
const validate = ajv.compile(schema);
const valid = validate(data);

if (!valid) {
  console.error(validate.errors);
}
```

#### Validator Class Pattern
```javascript
class Validator {
  constructor() {
    this.ajv = new Ajv({ allErrors: true });
    this.schemas = {};
    this.initSchemas();
  }

  initSchemas() {
    this.schemas.questions = {
      type: 'object',
      properties: {
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              question: { type: 'string' },
              options: { type: 'array', items: { type: 'string' } },
              default: { type: 'string' }
            },
            required: ['id', 'question', 'options', 'default']
          }
        }
      },
      required: ['questions']
    };

    this.schemas.compatibility = {
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
            },
            required: ['severity', 'component', 'issue', 'recommendation']
          }
        },
        summary: { type: 'string' }
      },
      required: ['status', 'issues', 'summary']
    };
  }

  validate(data, schemaName) {
    const schema = this.schemas[schemaName];
    if (!schema) throw new Error(`Schema '${schemaName}' not found`);

    const validate = this.ajv.compile(schema);
    const valid = validate(data);

    if (!valid) {
      const errors = validate.errors.map(e =>
        `${e.instancePath} ${e.message}`
      ).join('; ');
      throw new Error(`Validation failed: ${errors}`);
    }

    return data;
  }

  parseAndValidate(text, schemaName) {
    // Strip markdown fences if present
    const cleaned = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const data = JSON.parse(cleaned);
    return this.validate(data, schemaName);
  }
}
```

### Advanced Schema Features

#### Conditional Validation
```javascript
const conditionalSchema = {
  type: 'object',
  if: {
    properties: { type: { const: 'premium' } }
  },
  then: {
    required: ['subscriptionId']
  },
  else: {
    required: ['email']
  }
};
```

#### Pattern Properties
```javascript
const patternSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' }
  },
  patternProperties: {
    '^data_': { type: 'string' }
  },
  additionalProperties: false
};
```

#### Enum Validation
```javascript
const enumSchema = {
  type: 'object',
  properties: {
    status: {
      type: 'string',
      enum: ['pending', 'approved', 'rejected']
    },
    severity: {
      type: 'string',
      enum: ['low', 'moderate', 'critical']
    }
  }
};
```

### Error Handling

#### Detailed Error Messages
```javascript
const ajv = new Ajv({ allErrors: true, verbose: true });

const validate = ajv.compile(schema);
if (!validate(data)) {
  validate.errors.forEach(error => {
    console.error({
      path: error.instancePath,
      message: error.message,
      params: error.params,
      data: error.data
    });
  });
}
```

#### Custom Error Messages
```javascript
const schema = {
  type: 'object',
  properties: {
    age: {
      type: 'integer',
      minimum: 0,
      errorMessage: 'Age must be a non-negative integer'
    }
  }
};

// Requires ajv-errors plugin
const Ajv = require('ajv');
const ajvErrors = require('ajv-errors');
const ajv = new Ajv({ allErrors: true });
ajvErrors(ajv);
```

### Integration with AI APIs

#### Parse and Validate AI Response
```javascript
async function getValidatedResponse(apiCall, schemaName) {
  const response = await apiCall();
  const text = response.content[0].text;

  try {
    return validator.parseAndValidate(text, schemaName);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }
    throw error;
  }
}
```

#### Retry on Validation Failure
```javascript
async function getValidatedWithRetry(apiCall, schemaName, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await apiCall();
      return validator.parseAndValidate(response, schemaName);
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed: ${error.message}`);
      if (i === maxRetries - 1) throw error;
    }
  }
}
```

### Best Practices

1. **Define schemas upfront** - Create all schemas in a central location
2. **Use strict mode** - Set `additionalProperties: false` when structure is fixed
3. **Compile once** - Use `ajv.compile()` and reuse validators
4. **Enable allErrors** - Get all validation errors, not just first
5. **Clean input** - Strip markdown fences before parsing JSON
6. **Descriptive errors** - Map errors to user-friendly messages
7. **Test schemas** - Validate schemas work with expected data

### Common Gotchas

- `additionalProperties` defaults to `true` - explicitly set to `false`
- `required` is array at object level, not in properties
- `items` for arrays can be object (all items) or array (tuple)
- Nested schemas need explicit `type` declarations
