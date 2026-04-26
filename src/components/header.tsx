"use client";

import { useTheme } from "next-themes";
import { Zap, Sun, Moon, Monitor } from "lucide-react";
import { useFileStore } from "@/store/useFileStore";
import { useMounted } from "@/hooks/useMounted";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  // Render neutral (no active state) until mounted to avoid hydration mismatch
  const activeTheme = mounted ? theme : undefined;

  return (
    <div className="flex items-center rounded-lg border border-border bg-background p-0.5 gap-0.5">
      <button
        onClick={() => setTheme("light")}
        className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${activeTheme === "light" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        title="Light mode"
        aria-label="Switch to light mode"
      >
        <Sun className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${activeTheme === "system" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        title="System mode"
        aria-label="Use system theme"
      >
        <Monitor className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${activeTheme === "dark" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        title="Dark mode"
        aria-label="Switch to dark mode"
      >
        <Moon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function Header() {
  const mounted = useMounted();
  const queue = useFileStore((s) => s.queue);
  const queueCount = mounted ? queue.length : 0;
  const doneCount = mounted
    ? queue.filter((q) => q.status === "done").length
    : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
            <Zap
              className="h-4 w-4 text-primary-foreground"
              fill="currentColor"
            />
          </div>
          <div>
            <span className="text-base font-bold text-foreground tracking-tight">
              Convertiqo
            </span>
            <span className="ml-2 hidden text-xs text-muted-foreground sm:inline">
              Convert · Compress · Transform
            </span>
          </div>
        </div>

        {/* Stats + Theme toggle */}
        <div className="flex items-center gap-3">
          {queueCount > 0 && (
            <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
              <span>
                {queueCount} file{queueCount !== 1 ? "s" : ""}
              </span>
              {doneCount > 0 && (
                <span className="text-green-600 dark:text-green-400">
                  · {doneCount} done
                </span>
              )}
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
