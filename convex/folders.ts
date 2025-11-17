import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

const MAX_FOLDER_DEPTH = 5;

// Helper to calculate folder depth
async function getFolderDepth(
  ctx: any,
  folderId: Id<"folders"> | undefined
): Promise<number> {
  if (!folderId) return 0;

  const folder = await ctx.db.get(folderId);
  if (!folder) return 0;

  return 1 + (await getFolderDepth(ctx, folder.parentFolderId));
}

// Helper to check if moving would create a circular reference
async function wouldCreateCircularReference(
  ctx: any,
  folderId: Id<"folders">,
  newParentId: Id<"folders"> | undefined
): Promise<boolean> {
  if (!newParentId) return false;
  if (folderId === newParentId) return true;

  let currentParent = await ctx.db.get(newParentId);
  while (currentParent) {
    if (currentParent._id === folderId) return true;
    if (!currentParent.parentFolderId) break;
    currentParent = await ctx.db.get(currentParent.parentFolderId);
  }

  return false;
}

// Helper to build folder tree structure
interface FolderNode extends Doc<"folders"> {
  children: FolderNode[];
  bookmarkCount: number;
}

async function buildFolderTree(
  ctx: any,
  folders: Doc<"folders">[]
): Promise<FolderNode[]> {
  const folderMap = new Map<Id<"folders">, FolderNode>();

  // Initialize all folders with children array
  for (const folder of folders) {
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_folder", (q) => q.eq("folderId", folder._id))
      .collect();

    folderMap.set(folder._id, {
      ...folder,
      children: [],
      bookmarkCount: bookmarks.length,
    });
  }

  // Build tree structure
  const rootFolders: FolderNode[] = [];

  for (const folder of folders) {
    const node = folderMap.get(folder._id)!;

    if (folder.parentFolderId) {
      const parent = folderMap.get(folder.parentFolderId);
      if (parent) {
        parent.children.push(node);
      } else {
        // Orphaned folder, treat as root
        rootFolders.push(node);
      }
    } else {
      rootFolders.push(node);
    }
  }

  return rootFolders;
}

// Get all folders in a project as a tree structure
export const listFoldersInProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Verify project access
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== identity.subject) {
      throw new Error("Project not found or unauthorized");
    }

    const folders = await ctx.db
      .query("folders")
      .withIndex("by_project", (q: any) => q.eq("projectId", args.projectId))
      .collect();

    return await buildFolderTree(ctx, folders);
  },
});

// Get a single folder with auth check
export const getFolder = query({
  args: { folderId: v.id("folders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.userId !== identity.subject) {
      throw new Error("Folder not found or unauthorized");
    }

    return folder;
  },
});

// Get breadcrumb path from root to folder
export const getFolderPath = query({
  args: { folderId: v.id("folders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.userId !== identity.subject) {
      throw new Error("Folder not found or unauthorized");
    }

    const path: Doc<"folders">[] = [folder];
    let currentFolder = folder;

    while (currentFolder.parentFolderId) {
      const parent = await ctx.db.get(currentFolder.parentFolderId);
      if (!parent) break;
      path.unshift(parent);
      currentFolder = parent;
    }

    return path;
  },
});

// Create a new folder
export const createFolder = mutation({
  args: {
    projectId: v.id("projects"),
    parentFolderId: v.optional(v.id("folders")),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify project access
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== identity.subject) {
      throw new Error("Project not found or unauthorized");
    }

    // Validate name
    if (args.name.trim().length === 0) {
      throw new Error("Folder name cannot be empty");
    }
    if (args.name.length > 100) {
      throw new Error("Folder name must be 100 characters or less");
    }

    // Verify parent folder if specified
    if (args.parentFolderId) {
      const parentFolder = await ctx.db.get(args.parentFolderId);
      if (!parentFolder || parentFolder.userId !== identity.subject) {
        throw new Error("Parent folder not found or unauthorized");
      }
      if (parentFolder.projectId !== args.projectId) {
        throw new Error("Parent folder must be in the same project");
      }

      // Check depth limit
      const depth = await getFolderDepth(ctx, args.parentFolderId);
      if (depth >= MAX_FOLDER_DEPTH) {
        throw new Error(`Maximum folder depth of ${MAX_FOLDER_DEPTH} reached`);
      }
    }

    // Check for duplicate name in the same parent
    const siblingFolders = await ctx.db
      .query("folders")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const hasDuplicate = siblingFolders.some(
      (f) =>
        f.name === args.name.trim() &&
        f.parentFolderId === args.parentFolderId
    );

    if (hasDuplicate) {
      throw new Error("A folder with this name already exists in this location");
    }

    const now = Date.now();
    const folderId = await ctx.db.insert("folders", {
      projectId: args.projectId,
      parentFolderId: args.parentFolderId,
      name: args.name.trim(),
      userId: identity.subject,
      createdAt: now,
      updatedAt: now,
    });

    return folderId;
  },
});

// Update a folder (rename)
export const updateFolder = mutation({
  args: {
    folderId: v.id("folders"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.userId !== identity.subject) {
      throw new Error("Folder not found or unauthorized");
    }

    // Validate name
    if (args.name.trim().length === 0) {
      throw new Error("Folder name cannot be empty");
    }
    if (args.name.length > 100) {
      throw new Error("Folder name must be 100 characters or less");
    }

    // Check for duplicate name in the same parent
    const siblingFolders = await ctx.db
      .query("folders")
      .withIndex("by_project", (q) => q.eq("projectId", folder.projectId))
      .collect();

    const hasDuplicate = siblingFolders.some(
      (f) =>
        f.name === args.name.trim() &&
        f.parentFolderId === folder.parentFolderId &&
        f._id !== args.folderId
    );

    if (hasDuplicate) {
      throw new Error("A folder with this name already exists in this location");
    }

    await ctx.db.patch(args.folderId, {
      name: args.name.trim(),
      updatedAt: Date.now(),
    });
  },
});

// Move a folder to a different parent
export const moveFolder = mutation({
  args: {
    folderId: v.id("folders"),
    newParentFolderId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.userId !== identity.subject) {
      throw new Error("Folder not found or unauthorized");
    }

    // Verify new parent if specified
    if (args.newParentFolderId) {
      const newParent = await ctx.db.get(args.newParentFolderId);
      if (!newParent || newParent.userId !== identity.subject) {
        throw new Error("New parent folder not found or unauthorized");
      }
      if (newParent.projectId !== folder.projectId) {
        throw new Error("Cannot move folder to a different project");
      }

      // Check for circular reference
      const wouldBeCircular = await wouldCreateCircularReference(
        ctx,
        args.folderId,
        args.newParentFolderId
      );
      if (wouldBeCircular) {
        throw new Error("Cannot move a folder into one of its own subfolders");
      }

      // Check depth limit
      const newDepth = await getFolderDepth(ctx, args.newParentFolderId);
      const folderSubtreeDepth = await getSubtreeDepth(ctx, args.folderId);
      if (newDepth + folderSubtreeDepth > MAX_FOLDER_DEPTH) {
        throw new Error(`Move would exceed maximum folder depth of ${MAX_FOLDER_DEPTH}`);
      }
    }

    await ctx.db.patch(args.folderId, {
      parentFolderId: args.newParentFolderId,
      updatedAt: Date.now(),
    });
  },
});

// Helper to get the maximum depth of a folder's subtree
async function getSubtreeDepth(
  ctx: any,
  folderId: Id<"folders">
): Promise<number> {
  const children = await ctx.db
    .query("folders")
    .withIndex("by_parent", (q: any) => q.eq("parentFolderId", folderId))
    .collect();

  if (children.length === 0) return 1;

  let maxChildDepth = 0;
  for (const child of children) {
    const childDepth = await getSubtreeDepth(ctx, child._id);
    maxChildDepth = Math.max(maxChildDepth, childDepth);
  }

  return 1 + maxChildDepth;
}

// Delete a folder and all its children and bookmarks
export const deleteFolder = mutation({
  args: { folderId: v.id("folders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.userId !== identity.subject) {
      throw new Error("Folder not found or unauthorized");
    }

    // Recursively delete all descendants
    await deleteFolderRecursive(ctx, args.folderId);
  },
});

// Helper to recursively delete folder and all its children
async function deleteFolderRecursive(
  ctx: any,
  folderId: Id<"folders">
): Promise<void> {
  // Get all child folders
  const children = await ctx.db
    .query("folders")
    .withIndex("by_parent", (q: any) => q.eq("parentFolderId", folderId))
    .collect();

  // Recursively delete children
  for (const child of children) {
    await deleteFolderRecursive(ctx, child._id);
  }

  // Delete all bookmarks in this folder
  const bookmarks = await ctx.db
    .query("bookmarks")
    .withIndex("by_folder", (q: any) => q.eq("folderId", folderId))
    .collect();

  for (const bookmark of bookmarks) {
    await ctx.db.delete(bookmark._id);
  }

  // Delete the folder itself
  await ctx.db.delete(folderId);
}
