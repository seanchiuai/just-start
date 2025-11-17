import { MessageSquare } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  onToggleChat?: () => void;
}

export function SiteHeader({ onToggleChat }: SiteHeaderProps) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">Tasks</h1>

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-2">
          {onToggleChat && (
            <button
              onClick={onToggleChat}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                "hover:bg-muted",
                "text-muted-foreground hover:text-foreground"
              )}
              title="Toggle AI Assistant (⌘J)"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">AI Assistant</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
