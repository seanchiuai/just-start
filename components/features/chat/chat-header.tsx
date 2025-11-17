"use client";

import { X, Trash2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  onClose: () => void;
  onClearHistory: () => void;
  onOpenMemoryPanel?: () => void;
  messageCount?: number;
}

export function ChatHeader({
  onClose,
  onClearHistory,
  onOpenMemoryPanel,
  messageCount = 0,
}: ChatHeaderProps) {
  return (
    <div className="sticky top-0 z-10 border-b bg-background px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">AI Assistant</h2>
          {messageCount > 0 && (
            <p className="text-xs text-muted-foreground">
              {messageCount} message{messageCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onOpenMemoryPanel && (
            <button
              onClick={onOpenMemoryPanel}
              className={cn(
                "rounded-lg p-2 transition-colors",
                "hover:bg-muted",
                "text-muted-foreground hover:text-foreground"
              )}
              title="Memory settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClearHistory}
            className={cn(
              "rounded-lg p-2 transition-colors",
              "hover:bg-muted",
              "text-muted-foreground hover:text-foreground"
            )}
            title="Clear conversation"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className={cn(
              "rounded-lg p-2 transition-colors",
              "hover:bg-muted",
              "text-muted-foreground hover:text-foreground"
            )}
            title="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
