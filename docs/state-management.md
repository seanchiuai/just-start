# State Management

## Convex State (Recommended for Server State)

### Queries (Read)
```tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

function TodoList() {
  // Type cast when inference fails
  const todos = useQuery(api.todos.list) as Doc<"todos">[] | undefined;

  // undefined = loading
  if (todos === undefined) return <div>Loading...</div>;

  return <div>{todos.map(todo => ...)}</div>;
}
```

### Mutations (Write)
```tsx
"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function AddTodo() {
  const addTodo = useMutation(api.todos.create);

  const handleSubmit = async (text: string) => {
    await addTodo({ text });
  };

  return <form onSubmit={...}>...</form>;
}
```

### Actions (Long-running)
```tsx
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

function AIComponent() {
  const generateText = useAction(api.ai.generate);

  const handleGenerate = async () => {
    const result = await generateText({ prompt: "..." });
  };

  return <button onClick={handleGenerate}>Generate</button>;
}
```

## Local Component State

### useState
```tsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}
```

### Form State
```tsx
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Submit logic
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button disabled={loading}>Login</button>
    </form>
  );
}
```

## Context (Shared State Across Components)

### Creating Context
```tsx
// contexts/ThemeContext.tsx
"use client";

import { createContext, useContext, useState } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
} | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
```

### Using Context
```tsx
"use client";

import { useTheme } from "@/contexts/ThemeContext";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      {theme}
    </button>
  );
}
```

## localStorage Persistence

### Save/Load
```tsx
"use client";

import { useState, useEffect } from "react";

function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;

    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

// Usage
function Settings() {
  const [settings, setSettings] = useLocalStorage("settings", {
    notifications: true,
  });

  return <div>...</div>;
}
```

## Optimistic Updates
```tsx
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function TodoItem({ todo }) {
  const toggleTodo = useMutation(api.todos.toggle);

  const handleToggle = () => {
    // Optimistically update UI
    toggleTodo({ id: todo._id });
  };

  return (
    <div>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggle}
      />
    </div>
  );
}
```

## State Management Guidelines
1. **Server state**: Use Convex (queries/mutations)
2. **UI state**: Use local useState
3. **Shared UI state**: Use Context
4. **Persistent state**: Use localStorage with hooks
5. **Form state**: Use controlled components with useState
6. **Complex forms**: Consider react-hook-form

## Anti-patterns to Avoid
- Don't store server data in local state (use Convex)
- Don't prop drill (use Context for deeply nested state)
- Don't use Context for frequently changing values (performance)
- Don't store derived state (compute from existing state)
