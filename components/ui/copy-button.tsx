"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CopyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  onCopy?: () => void;
}

export function CopyButton({
  value,
  className,
  onCopy,
  ...props
}: CopyButtonProps) {
  const [hasCopied, setHasCopied] = React.useState(false);

  React.useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => setHasCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setHasCopied(true);
    onCopy?.();
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      className={cn(
        "h-8 w-8 p-0 hover:bg-muted",
        className
      )}
      onClick={handleCopy}
      {...props}
    >
      {hasCopied ? (
        <Check className="h-4 w-4 text-success" />
      ) : (
        <Copy className="h-4 w-4 text-muted-foreground" />
      )}
      <span className="sr-only">Copy</span>
    </Button>
  );
}
