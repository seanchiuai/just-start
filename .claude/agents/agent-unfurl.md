---
name: "Unfurl.js Metadata Fetching"
description: "Implementation guide for URL metadata extraction using Unfurl.js"
tools: ["npm", "filesystem"]
color: yellow
---

# Unfurl.js Agent

## Mission
Implement automatic metadata fetching for bookmarks using Unfurl.js to extract title, description, images, and favicons from URLs.

## Stack Context
- **Library**: unfurl.js (Open Graph, Twitter Cards, oEmbed support)
- **Environment**: Node.js only (server-side) - does NOT work in browser
- **Integration**: Convex actions (server-side functions)
- **Fallback**: Microlink API for complex sites (Instagram, Twitter)

## Implementation Steps

### 1. Install Unfurl.js
```bash
npm install unfurl.js
```

### 2. Create Metadata Fetching Action
**File**: `convex/actions/metadata.ts`

```typescript
import { action } from "../_generated/server";
import { v } from "convex/values";
import { unfurl } from "unfurl.js";

export const fetchMetadata = action({
  args: {
    url: v.string(),
  },
  handler: async (ctx, { url }) => {
    try {
      // Validate URL format
      const urlObj = new URL(url);

      // Fetch metadata with unfurl.js
      const metadata = await unfurl(url, {
        oembed: true,           // Enable oEmbed support
        timeout: 10000,         // 10 second timeout
        follow: 5,              // Follow up to 5 redirects
        compress: true,         // Support gzip compression
        size: 5000000,          // Max 5MB response
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BookmarkManager/1.0)',
        },
      });

      // Extract relevant data
      const title =
        metadata.title ||
        metadata.open_graph?.title ||
        metadata.twitter_card?.title ||
        urlObj.hostname;

      const description =
        metadata.description ||
        metadata.open_graph?.description ||
        metadata.twitter_card?.description ||
        "";

      // Get best quality image
      const imageUrl =
        metadata.open_graph?.images?.[0]?.url ||
        metadata.twitter_card?.images?.[0]?.url ||
        metadata.oEmbed?.thumbnails?.[0]?.url ||
        null;

      const favicon =
        metadata.favicon ||
        `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;

      return {
        success: true,
        metadata: {
          url,
          title,
          description,
          imageUrl,
          favicon,
          author: metadata.author || null,
          siteName: metadata.open_graph?.site_name || urlObj.hostname,
        },
      };
    } catch (error) {
      console.error("Metadata fetch error:", error);

      // Return fallback metadata on error
      const urlObj = new URL(url);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch metadata",
        metadata: {
          url,
          title: urlObj.hostname,
          description: "",
          imageUrl: null,
          favicon: `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`,
          author: null,
          siteName: urlObj.hostname,
        },
      };
    }
  },
});
```

### 3. Image Storage Helper (Convex Action)
**File**: `convex/actions/storeMetadataImages.ts`

```typescript
import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

export const storeMetadataImages = action({
  args: {
    imageUrl: v.union(v.string(), v.null()),
    faviconUrl: v.string(),
  },
  handler: async (ctx, { imageUrl, faviconUrl }) => {
    try {
      const results: {
        previewImageId?: string;
        faviconId?: string;
      } = {};

      // Store preview image if available
      if (imageUrl) {
        const imageResponse = await fetch(imageUrl);
        if (imageResponse.ok) {
          const imageBlob = await imageResponse.blob();
          results.previewImageId = await ctx.storage.store(imageBlob);
        }
      }

      // Store favicon
      const faviconResponse = await fetch(faviconUrl);
      if (faviconResponse.ok) {
        const faviconBlob = await faviconResponse.blob();
        results.faviconId = await ctx.storage.store(faviconBlob);
      }

      return results;
    } catch (error) {
      console.error("Image storage error:", error);
      return {};
    }
  },
});
```

### 4. Complete Bookmark Creation Flow (Convex Mutation)
**File**: `convex/mutations/bookmarks.ts`

```typescript
import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createBookmarkWithMetadata = mutation({
  args: {
    folderId: v.id("folders"),
    url: v.string(),
    // Metadata fetched from action
    title: v.string(),
    description: v.optional(v.string()),
    previewImageId: v.optional(v.id("_storage")),
    faviconId: v.optional(v.id("_storage")),
    embedding: v.array(v.number()), // From OpenAI
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Verify folder ownership
    const folder = await ctx.db.get(args.folderId);
    if (!folder) throw new Error("Folder not found");

    const project = await ctx.db.get(folder.projectId);
    if (!project || project.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    // Generate storage URLs if images exist
    let previewImageUrl: string | undefined;
    let faviconUrl: string | undefined;

    if (args.previewImageId) {
      previewImageUrl = await ctx.storage.getUrl(args.previewImageId) ?? undefined;
    }

    if (args.faviconId) {
      faviconUrl = await ctx.storage.getUrl(args.faviconId) ?? undefined;
    }

    return await ctx.db.insert("bookmarks", {
      folderId: args.folderId,
      url: args.url,
      title: args.title,
      description: args.description,
      previewImageUrl,
      faviconUrl,
      embedding: args.embedding,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
```

## Frontend Integration

### Add Bookmark Form Component
```tsx
"use client";

import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function AddBookmarkForm({ folderId }: { folderId: string }) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchMetadata = useAction(api.actions.metadata.fetchMetadata);
  const storeImages = useAction(api.actions.storeMetadataImages.storeMetadataImages);
  const generateEmbedding = useAction(api.actions.generateEmbedding.generateEmbedding);
  const createBookmark = useMutation(api.mutations.bookmarks.createBookmarkWithMetadata);

  const handleUrlBlur = async () => {
    if (!url) return;

    setIsLoading(true);
    try {
      const result = await fetchMetadata({ url });

      if (result.success) {
        setTitle(result.metadata.title);
        setDescription(result.metadata.description);
      }
    } catch (error) {
      console.error("Failed to fetch metadata:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !title) return;

    setIsLoading(true);
    try {
      // 1. Fetch metadata (if not already fetched)
      const metadataResult = await fetchMetadata({ url });

      // 2. Store images
      const { previewImageId, faviconId } = await storeImages({
        imageUrl: metadataResult.metadata.imageUrl,
        faviconUrl: metadataResult.metadata.favicon,
      });

      // 3. Generate embedding
      const embeddingText = `${title} ${description} ${url}`;
      const embedding = await generateEmbedding({ text: embeddingText });

      // 4. Create bookmark
      await createBookmark({
        folderId,
        url,
        title,
        description,
        previewImageId,
        faviconId,
        embedding,
      });

      // Reset form
      setUrl("");
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("Failed to create bookmark:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={handleUrlBlur}
          required
        />
      </div>

      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          type="text"
          placeholder="Auto-filled from URL"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Auto-filled from URL"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <Button type="submit" disabled={isLoading || !url || !title}>
        {isLoading ? "Adding..." : "Add Bookmark"}
      </Button>
    </form>
  );
}
```

## Supported Metadata

### Open Graph Protocol
- `og:title`, `og:description`, `og:image`, `og:url`
- `og:type`, `og:site_name`, `og:locale`
- Article metadata (publish date, author, section, tags)
- Video metadata (URL, dimensions, type)

### Twitter Cards
- `twitter:card`, `twitter:title`, `twitter:description`
- `twitter:image`, `twitter:creator`, `twitter:site`
- Player URLs and app links

### oEmbed
- Photo, Video, Link, Rich types
- Embed HTML code and dimensions
- Thumbnail URLs

### HTML Meta Tags
- `<title>`, `<meta name="description">`
- `<meta name="author">`, `<meta name="keywords">`
- `<link rel="icon">` (favicon)

## Error Handling

### Common Errors
- **Invalid URL**: Validate URL format before calling unfurl
- **Timeout**: Site takes too long to respond (>10s)
- **404/403**: Page not found or forbidden
- **No metadata**: Page has no OG/Twitter tags (fallback to title tag)

### Fallback Strategy
```typescript
const getFallbackMetadata = (url: string) => {
  const urlObj = new URL(url);
  return {
    title: urlObj.hostname,
    description: "",
    imageUrl: null,
    favicon: `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`,
    siteName: urlObj.hostname,
  };
};
```

## Sites That May Fail

### JavaScript-Heavy Sites
- Instagram, Twitter/X, TikTok (require browser rendering)
- React/Vue SPAs with client-side rendering
- Sites with bot protection (Cloudflare, etc.)

### Solution: Microlink API (Post-MVP)
For problematic domains, use Microlink API as fallback:
```typescript
const PROBLEMATIC_DOMAINS = ["instagram.com", "twitter.com", "x.com"];

const shouldUseMicrolink = (url: string) => {
  const hostname = new URL(url).hostname;
  return PROBLEMATIC_DOMAINS.some(domain => hostname.includes(domain));
};
```

## Performance Optimization

### Caching Strategy
```typescript
// Cache metadata for 24 hours to avoid refetching
export const getCachedMetadata = query({
  args: { url: v.string() },
  handler: async (ctx, { url }) => {
    const cached = await ctx.db
      .query("metadataCache")
      .withIndex("by_url", (q) => q.eq("url", url))
      .first();

    if (cached && Date.now() - cached.cachedAt < 86400000) {
      return cached.metadata;
    }

    return null;
  },
});
```

### Timeouts
- Set reasonable timeout (10s max)
- Show loading state immediately
- Allow users to edit metadata during fetch

## Testing Checklist
- [ ] unfurl.js installed
- [ ] Metadata fetching working for common sites (GitHub, Medium, Dev.to)
- [ ] Fallback working for sites without metadata
- [ ] Image storage working (preview + favicon)
- [ ] Error handling graceful (timeout, 404, invalid URL)
- [ ] User can edit auto-filled metadata before saving
- [ ] Loading states shown during fetch
- [ ] URLs validated before processing

## Resources
- [Unfurl.js GitHub](https://github.com/jacktuck/unfurl)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Docs](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [oEmbed Spec](https://oembed.com/)
