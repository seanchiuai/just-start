# Type Definitions

## TypeScript Strict Mode
All code uses strict TypeScript. No `any` types allowed.

## Convex Types

### Generated Types
```ts
import { Doc, Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";

// Document types
type Todo = Doc<"todos">;
type User = Doc<"users">;

// ID types
type TodoId = Id<"todos">;
type UserId = Id<"users">;
```

### Function Arguments
```ts
import { v } from "convex/values";
import { query } from "./_generated/server";

export const getTodo = query({
  args: {
    id: v.id("todos"),
    completed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // args is typed automatically
    const todo = await ctx.db.get(args.id);
    return todo;
  },
});
```

### Validator to Type
```ts
import { v } from "convex/values";
import { Infer } from "convex/values";

const todoValidator = v.object({
  text: v.string(),
  completed: v.boolean(),
  tags: v.array(v.string()),
});

// Extract TypeScript type from validator
type Todo = Infer<typeof todoValidator>;
```

## Component Props

### Basic Props
```ts
interface ButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

function Button({ variant = "default", size = "md", ...props }: ButtonProps) {
  return <button {...props} />;
}
```

### Extending HTML Attributes
```ts
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

function Input({ label, error, ...props }: InputProps) {
  return (
    <div>
      {label && <label>{label}</label>}
      <input {...props} />
      {error && <span>{error}</span>}
    </div>
  );
}
```

### Generic Props
```ts
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <div>
      {items.map((item) => (
        <div key={keyExtractor(item)}>{renderItem(item)}</div>
      ))}
    </div>
  );
}
```

## Union Types

### Discriminated Unions
```ts
type Result<T> =
  | { status: "success"; data: T }
  | { status: "error"; error: string }
  | { status: "loading" };

function handleResult<T>(result: Result<T>) {
  if (result.status === "success") {
    console.log(result.data); // Type: T
  } else if (result.status === "error") {
    console.error(result.error); // Type: string
  }
}
```

### Literal Types
```ts
type ButtonVariant = "default" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

// In Convex validators
import { v } from "convex/values";

const buttonValidator = v.object({
  variant: v.union(
    v.literal("default"),
    v.literal("outline"),
    v.literal("ghost")
  ),
});
```

## Utility Types

### Pick/Omit
```ts
interface User {
  id: string;
  email: string;
  password: string;
  name: string;
}

// Pick specific fields
type PublicUser = Pick<User, "id" | "email" | "name">;

// Omit specific fields
type UserWithoutPassword = Omit<User, "password">;
```

### Partial/Required
```ts
// All fields optional
type PartialUser = Partial<User>;

// All fields required
type RequiredUser = Required<User>;
```

### Record
```ts
// Object with specific key/value types
type UserMap = Record<Id<"users">, string>;

// Example usage in Convex
const userNames: Record<Id<"users">, string> = {};
userNames[userId] = "John";
```

## Type Guards
```ts
function isError(result: Result<unknown>): result is { status: "error"; error: string } {
  return result.status === "error";
}

if (isError(result)) {
  console.error(result.error); // Type narrowed
}
```

## Async Types
```ts
// Promise return type
async function fetchUser(): Promise<User> {
  const response = await fetch("/api/user");
  return response.json();
}

// Awaited type
type UserType = Awaited<ReturnType<typeof fetchUser>>;
```

## Type Assertions (Use Sparingly)
```ts
// Type assertion when you know better than TypeScript
const input = document.getElementById("email") as HTMLInputElement;

// Non-null assertion
const value = maybeValue!; // Only if you're 100% sure
```

## Convex-specific Patterns

### ID Types
```ts
import { Id } from "@/convex/_generated/dataModel";

// Function that requires specific ID type
function getUserTodos(userId: Id<"users">): Promise<Todo[]> {
  // Implementation
}

// Don't use: userId: string (too loose)
```

### Record with ID Keys
```ts
import { Id } from "@/convex/_generated/dataModel";

const idToUsername: Record<Id<"users">, string> = {};
```

### Convex Query Type Casting
When useQuery type inference fails, use explicit casting:
```tsx
import { Doc } from "@/convex/_generated/dataModel";

// Cast query results to proper Doc type
const projects = useQuery(api.prdProjects.listByUser) as Doc<"prdProjects">[] | undefined;
const memories = useQuery(api.memory.getUserMemories, { limit: 10 }) as Doc<"userMemory">[] | undefined;

// Use with proper null checks
if (projects === undefined) return <Loading />;
if (projects === null) return <NotFound />;
```

This pattern is used when Convex's generated types don't fully propagate through the API.

### Array Types
```ts
// Use Array<T> for consistency
const tags: Array<string> = [];
const users: Array<Doc<"users">> = [];
```

## Best Practices
1. Always use strict types, never `any`
2. Use `@/*` imports consistently
3. Prefer interfaces for object shapes
4. Use type for unions and aliases
5. Extract complex types to separate type files
6. Use generated Convex types (Doc, Id)
7. Type component props explicitly
8. Use discriminated unions for state
