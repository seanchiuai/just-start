# Icon Usage (lucide-react)

**Note**: Use `lucide-react` exclusively. `@tabler/icons-react` is installed but deprecated - found only in `/bookmarks` route (scheduled for removal).

## Import Pattern
```tsx
import { Icon1, Icon2, Icon3 } from "lucide-react";
```

## Basic Usage
```tsx
import { Home, User, Settings } from "lucide-react";

<Home />
<User className="h-5 w-5" />
<Settings className="h-4 w-4 text-muted-foreground" />
```

## Sizing
- `h-3 w-3` (12px) - Extra small
- `h-4 w-4` (16px) - Small (default for buttons)
- `h-5 w-5` (20px) - Medium (default for nav)
- `h-6 w-6` (24px) - Large
- `h-8 w-8` (32px) - Extra large

## Colors
- `text-foreground` - Default text color
- `text-muted-foreground` - Muted/secondary
- `text-primary` - Primary color
- `text-destructive` - Error/danger
- `text-white` - White
- `text-black` - Black

## Common Icons
- Navigation: `Home`, `Menu`, `ChevronRight`, `ChevronDown`
- Actions: `Plus`, `Minus`, `Edit`, `Trash2`, `Save`, `X`
- UI: `Search`, `Filter`, `Settings`, `MoreVertical`, `MoreHorizontal`
- Status: `Check`, `AlertCircle`, `Info`, `XCircle`, `CheckCircle`
- User: `User`, `Users`, `UserPlus`, `LogIn`, `LogOut`
- Files: `File`, `FileText`, `Download`, `Upload`, `Folder`
- Media: `Image`, `Video`, `Music`, `Camera`

## Buttons with Icons
```tsx
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// Icon only
<Button size="icon">
  <Plus className="h-4 w-4" />
</Button>

// Icon + Text
<Button>
  <Plus className="h-4 w-4 mr-2" />
  Add Item
</Button>

// Icon after text
<Button>
  Next
  <ChevronRight className="h-4 w-4 ml-2" />
</Button>
```

## Accessibility
```tsx
<Button size="icon" aria-label="Add item">
  <Plus className="h-4 w-4" />
</Button>
```

## Animation
```tsx
<Menu className="h-5 w-5 transition-transform duration-200 group-hover:rotate-90" />
```
