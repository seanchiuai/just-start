"use client";

import { useState, useEffect, useRef } from "react";
import { Download, FileJson, FileText, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ExportFormat = "json" | "markdown";

interface ExportDropdownProps {
  onExport: (format: ExportFormat) => Promise<void>;
}

export function ExportDropdown({ onExport }: ExportDropdownProps) {
  const [loadingFormat, setLoadingFormat] = useState<ExportFormat | null>(null);
  const [successFormat, setSuccessFormat] = useState<ExportFormat | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear success format after 2s with cleanup
  useEffect(() => {
    if (successFormat !== null) {
      timeoutRef.current = setTimeout(() => setSuccessFormat(null), 2000);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [successFormat]);

  const handleExport = async (format: ExportFormat) => {
    // Guard against concurrent exports
    if (loadingFormat !== null) return;

    setLoadingFormat(format);
    setSuccessFormat(null);

    try {
      await onExport(format);
      setSuccessFormat(format);
    } finally {
      setLoadingFormat(null);
    }
  };

  const formatInfo = {
    json: {
      icon: FileJson,
      label: "JSON",
      description: "Structured data format",
      size: "~15 KB",
    },
    markdown: {
      icon: FileText,
      label: "Markdown",
      description: "Formatted document",
      size: "~8 KB",
    },
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {(Object.keys(formatInfo) as ExportFormat[]).map((format) => {
          const { icon: Icon, label, description, size } = formatInfo[format];
          const isLoading = loadingFormat === format;
          const isSuccess = successFormat === format;

          return (
            <DropdownMenuItem
              key={format}
              onClick={() => handleExport(format)}
              disabled={loadingFormat !== null}
              className="flex items-start gap-3 p-3"
            >
              <div className="mt-0.5">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : isSuccess ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Icon className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">{label}</div>
                <div className="text-xs text-muted-foreground">
                  {description}
                </div>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {size}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
