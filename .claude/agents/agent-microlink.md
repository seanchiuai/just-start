---
name: "Microlink API Integration"
description: "Fallback metadata extraction for complex sites (Instagram, Twitter, etc.)"
tools: ["npm", "filesystem", "env"]
color: cyan
---

# Microlink API Agent

## Mission
Implement Microlink API as fallback metadata extraction for JavaScript-heavy and complex sites that Unfurl.js cannot handle (Instagram, Twitter/X, TikTok, etc.).

## Stack Context
- **Service**: Microlink.io API (browser-as-API service)
- **Use Case**: Fallback for sites requiring browser rendering
- **Free Tier**: ~50 requests/day (sufficient for MVP personal use)
- **Integration**: Convex actions (server-side)
- **Primary**: Use Unfurl.js first, Microlink as fallback only

## Problematic Sites (Require Microlink)
- Instagram (Reels, Posts)
- Twitter/X (Tweets, Threads)
- TikTok (Videos)
- LinkedIn (Posts, Articles)
- Facebook (Posts, Videos)
- Complex SPAs with client-side rendering

## Implementation Steps

### 1. Install Microlink SDK (Optional)
```bash
# Using fetch API directly is simpler
# npm install @microlink/mcp (optional SDK)
```

### 2. Set Environment Variables
Add to `.env.local`:
```
MICROLINK_API_KEY=your_api_key_here  # Optional for free tier
```

### 3. Create Microlink Metadata Fetching Action
**File**: `convex/actions/microlinkMetadata.ts`

```typescript
import { action } from "../_generated/server";
import { v } from "convex/values";

// Domains that require Microlink instead of Unfurl
const MICROLINK_DOMAINS = [
  "instagram.com",
  "twitter.com",
  "x.com",
  "tiktok.com",
  "linkedin.com",
  "facebook.com",
];

export const shouldUseMicrolink = (url: string): boolean => {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return MICROLINK_DOMAINS.some((domain) => hostname.includes(domain));
  } catch {
    return false;
  }
};

export const fetchMicrolinkMetadata = action({
  args: {
    url: v.string(),
  },
  handler: async (ctx, { url }) => {
    try {
      // Build Microlink API URL
      const apiUrl = new URL("https://api.microlink.io");
      apiUrl.searchParams.set("url", url);
      apiUrl.searchParams.set("meta", "true");
      apiUrl.searchParams.set("screenshot", "false"); // Disable to save quota
      apiUrl.searchParams.set("video", "false");
      apiUrl.searchParams.set("audio", "false");

      // Add API key if configured (for paid tier)
      const apiKey = process.env.MICROLINK_API_KEY;
      if (apiKey) {
        apiUrl.searchParams.set("apiKey", apiKey);
      }

      // Fetch metadata from Microlink
      const response = await fetch(apiUrl.toString(), {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Microlink API error: ${response.status}`);
      }

      const result = await response.json();

      if (result.status !== "success") {
        throw new Error("Microlink failed to fetch metadata");
      }

      const { data } = result;

      return {
        success: true,
        metadata: {
          url: data.url || url,
          title: data.title || new URL(url).hostname,
          description: data.description || "",
          imageUrl: data.image?.url || null,
          favicon: data.logo?.url || `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`,
          author: data.author || null,
          siteName: data.publisher || new URL(url).hostname,
          date: data.date || null,
        },
      };
    } catch (error) {
      console.error("Microlink metadata fetch error:", error);

      // Return fallback metadata
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
          date: null,
        },
      };
    }
  },
});
```

### 4. Update Main Metadata Fetching Action (Smart Fallback)
**File**: `convex/actions/metadata.ts` (Updated)

```typescript
import { action } from "../_generated/server";
import { v } from "convex/values";
import { unfurl } from "unfurl.js";
import { api } from "../_generated/api";

export const fetchMetadata = action({
  args: {
    url: v.string(),
  },
  handler: async (ctx, { url }) => {
    try {
      // Check if URL requires Microlink
      const useMicrolink = shouldUseMicrolink(url);

      if (useMicrolink) {
        // Use Microlink for complex sites
        return await ctx.runAction(api.actions.microlinkMetadata.fetchMicrolinkMetadata, {
          url,
        });
      }

      // Default: Use Unfurl.js for standard sites
      const metadata = await unfurl(url, {
        oembed: true,
        timeout: 10000,
        follow: 5,
        compress: true,
        size: 5000000,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; BookmarkManager/1.0)",
        },
      });

      const urlObj = new URL(url);

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

      // Try Microlink as last resort fallback
      try {
        return await ctx.runAction(api.actions.microlinkMetadata.fetchMicrolinkMetadata, {
          url,
        });
      } catch (microlinkError) {
        // Final fallback: Return basic metadata
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
    }
  },
});

// Helper function
function shouldUseMicrolink(url: string): boolean {
  const MICROLINK_DOMAINS = [
    "instagram.com",
    "twitter.com",
    "x.com",
    "tiktok.com",
    "linkedin.com",
    "facebook.com",
  ];

  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return MICROLINK_DOMAINS.some((domain) => hostname.includes(domain));
  } catch {
    return false;
  }
}
```

## Microlink API Features

### Extracted Metadata Fields
| Field | Description | Source |
|-------|-------------|--------|
| `title` | Page title | OG, Twitter Cards, HTML |
| `description` | Page description | OG, Twitter Cards, meta tags |
| `image.url` | Preview image URL | OG, Twitter Cards |
| `logo.url` | Site favicon/logo | Link tags, manifest |
| `author` | Content author | Article meta, byline |
| `publisher` | Site/publisher name | OG site_name, domain |
| `date` | Publication date | Article metadata, schema |
| `url` | Canonical URL | Canonical link, OG |
| `lang` | Language code (ISO 639-1) | HTML lang attribute |

### Request Parameters
```typescript
// Basic request
?url=https://instagram.com/p/example

// With options
?url=https://instagram.com/p/example
&meta=true              // Extract metadata (default: true)
&screenshot=false       // Disable screenshot (save quota)
&video=false            // Disable video extraction
&audio=false            // Disable audio extraction
&prerender=true         // Enable JavaScript rendering (default: true)
```

## Rate Limits & Pricing

### Free Tier (No API Key)
- **Limit**: ~50 requests/day
- **Concurrent**: 1 request/second
- **Caching**: Cached requests don't count against quota
- **Best For**: MVP/personal projects with low volume

### Paid Tier (With API Key)
- **Pro**: $9.99/month - 10,000 requests/month
- **Scale**: Custom pricing for higher volumes
- **Caching**: Intelligent caching reduces costs
- **Best For**: Production apps with many users

### Caching Strategy
```typescript
// Microlink caches responses for 24 hours by default
// Repeated requests to same URL use cache (free)

// Force fresh data (counts against quota)
?url=https://example.com&force=true
```

## Cost Optimization Tips

### 1. Use Unfurl.js First
```typescript
// Only use Microlink for domains that need it
if (shouldUseMicrolink(url)) {
  // Use Microlink (costs quota)
} else {
  // Use Unfurl.js (free, unlimited)
}
```

### 2. Disable Unnecessary Features
```typescript
// Screenshot + video extraction consume more quota
apiUrl.searchParams.set("screenshot", "false");
apiUrl.searchParams.set("video", "false");
apiUrl.searchParams.set("audio", "false");
```

### 3. Cache Results in Database
```typescript
// Store fetched metadata in Convex for 7 days
export const cacheMetadata = mutation({
  args: {
    url: v.string(),
    metadata: v.object({ /* ... */ }),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("metadataCache", {
      url: args.url,
      metadata: args.metadata,
      cachedAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  },
});
```

### 4. Batch Requests (Advanced)
```typescript
// For importing many bookmarks, batch process
// Use Promise.all with concurrency limit
const batchSize = 5;
for (let i = 0; i < urls.length; i += batchSize) {
  const batch = urls.slice(i, i + batchSize);
  await Promise.all(batch.map(url => fetchMetadata({ url })));
  await new Promise(r => setTimeout(r, 1000)); // Rate limit
}
```

## Error Handling

### Common Errors
```typescript
// Rate limit exceeded (429)
if (response.status === 429) {
  throw new Error("Microlink rate limit exceeded. Try again later.");
}

// Invalid URL (400)
if (response.status === 400) {
  throw new Error("Invalid URL format");
}

// Service unavailable (503)
if (response.status === 503) {
  // Fall back to Unfurl.js or basic metadata
}
```

### Retry Strategy
```typescript
const fetchWithRetry = async (url: string, retries = 2): Promise<any> => {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fetch(url);
    } catch (error) {
      if (i === retries) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Exponential backoff
    }
  }
};
```

## Testing Checklist
- [ ] Microlink API accessible (test with curl or browser)
- [ ] Environment variable configured (if using API key)
- [ ] Fetching working for Instagram URLs
- [ ] Fetching working for Twitter/X URLs
- [ ] Fallback to Unfurl.js for standard sites
- [ ] Rate limit handling implemented
- [ ] Error states handled gracefully
- [ ] Metadata cache working to reduce quota usage
- [ ] User sees loading state during fetch

## Testing URLs

### Instagram
```
https://www.instagram.com/p/example/
https://www.instagram.com/reel/example/
```

### Twitter/X
```
https://twitter.com/username/status/1234567890
https://x.com/username/status/1234567890
```

### TikTok
```
https://www.tiktok.com/@username/video/1234567890
```

### LinkedIn
```
https://www.linkedin.com/posts/username-123_activity-1234567890
```

## Monitoring Usage

### Track Quota Consumption
```typescript
// Log Microlink usage to monitor quota
export const logMicrolinkUsage = mutation({
  args: {
    url: v.string(),
    success: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("microlinkLogs", {
      url: args.url,
      success: args.success,
      timestamp: Date.now(),
    });
  },
});

// Query daily usage
export const getDailyMicrolinkUsage = query({
  handler: async (ctx) => {
    const today = new Date().setHours(0, 0, 0, 0);
    const logs = await ctx.db
      .query("microlinkLogs")
      .filter((q) => q.gte(q.field("timestamp"), today))
      .collect();

    return {
      total: logs.length,
      successful: logs.filter((l) => l.success).length,
      failed: logs.filter((l) => !l.success).length,
    };
  },
});
```

## Post-MVP Enhancements

### Screenshot Feature
```typescript
// Enable screenshots for visual bookmarks
apiUrl.searchParams.set("screenshot", "true");
apiUrl.searchParams.set("screenshot.type", "jpeg");
apiUrl.searchParams.set("screenshot.quality", "80");

// Response includes screenshot URL
const screenshotUrl = result.data.screenshot?.url;
```

### Video Embedding
```typescript
// Extract video metadata for TikTok, Instagram Reels
apiUrl.searchParams.set("video", "true");

// Response includes video URL and duration
const videoUrl = result.data.video?.url;
const duration = result.data.video?.duration;
```

## Resources
- [Microlink API Documentation](https://microlink.io/docs/api/getting-started/overview)
- [Microlink Pricing](https://microlink.io/docs/cards/others/pricing)
- [Metascraper (Open Source Alternative)](https://github.com/microlinkhq/metascraper)
- [API Playground](https://microlink.io/meta)
