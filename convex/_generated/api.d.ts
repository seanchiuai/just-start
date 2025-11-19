/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai_claude from "../ai/claude.js";
import type * as ai_perplexity from "../ai/perplexity.js";
import type * as bookmarks from "../bookmarks.js";
import type * as chat from "../chat.js";
import type * as chatMessages from "../chatMessages.js";
import type * as compatibility from "../compatibility.js";
import type * as embeddings from "../embeddings.js";
import type * as folders from "../folders.js";
import type * as http from "../http.js";
import type * as init from "../init.js";
import type * as memory from "../memory.js";
import type * as myFunctions from "../myFunctions.js";
import type * as prd from "../prd.js";
import type * as prdProjects from "../prdProjects.js";
import type * as projects from "../projects.js";
import type * as questions from "../questions.js";
import type * as search from "../search.js";
import type * as techStack from "../techStack.js";
import type * as todos from "../todos.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "ai/claude": typeof ai_claude;
  "ai/perplexity": typeof ai_perplexity;
  bookmarks: typeof bookmarks;
  chat: typeof chat;
  chatMessages: typeof chatMessages;
  compatibility: typeof compatibility;
  embeddings: typeof embeddings;
  folders: typeof folders;
  http: typeof http;
  init: typeof init;
  memory: typeof memory;
  myFunctions: typeof myFunctions;
  prd: typeof prd;
  prdProjects: typeof prdProjects;
  projects: typeof projects;
  questions: typeof questions;
  search: typeof search;
  techStack: typeof techStack;
  todos: typeof todos;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
