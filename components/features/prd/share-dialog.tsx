"use client";

import { useState } from "react";
import { Link as LinkIcon, Copy, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl?: string;
  expiresAt?: string;
  onGenerate: () => Promise<void>;
  onRevoke?: () => void;
}

export function ShareDialog({
  open,
  onOpenChange,
  shareUrl,
  expiresAt,
  onGenerate,
  onRevoke,
}: ShareDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Share Your PRD</DialogTitle>
          <DialogDescription>
            Generate a shareable link that expires in 7 days. Anyone with the
            link can view the PRD without signing in.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {shareUrl ? (
            <>
              {/* URL display and copy */}
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Expiration info */}
              {expiresAt && (
                <p className="text-xs text-muted-foreground">
                  Expires on {expiresAt}
                </p>
              )}

              {/* Revoke option */}
              {onRevoke && (
                <div className="pt-4 border-t">
                  <button
                    type="button"
                    onClick={onRevoke}
                    className="text-sm text-warning hover:text-warning/80 flex items-center gap-1"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    Revoke share link
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Generate button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isGenerating ? (
                  "Generating..."
                ) : (
                  <>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Generate Share Link
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                The link will be valid for 7 days
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
