"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Stars } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function ThemeSwitcher({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn(
        "w-20 h-10 rounded-full bg-secondary/50 animate-pulse",
        className
      )} />
    );
  }

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "group relative flex items-center w-20 h-10 p-1 rounded-full cursor-pointer transition-all duration-500 overflow-hidden",
        isDark
          ? "bg-gradient-to-r from-violet/20 to-teal/20 border border-violet/30 hover:border-violet/50"
          : "bg-gradient-to-r from-amber/20 to-amber-glow/20 border border-amber/30 hover:border-amber/50",
        className
      )}
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Background glow effect */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          isDark
            ? "bg-gradient-to-r from-violet/10 to-transparent"
            : "bg-gradient-to-l from-amber/10 to-transparent"
        )}
      />

      {/* Stars decoration for dark mode */}
      {isDark && (
        <div className="absolute inset-0 overflow-hidden">
          <Stars className="absolute top-1 left-2 w-2 h-2 text-violet/40 animate-pulse" />
          <Stars className="absolute bottom-2 left-6 w-1.5 h-1.5 text-teal/30" style={{ animationDelay: "0.5s" }} />
        </div>
      )}

      {/* Toggle thumb */}
      <div
        className={cn(
          "relative z-10 flex items-center justify-center w-8 h-8 rounded-full shadow-lg transition-all duration-500",
          isDark
            ? "translate-x-10 bg-gradient-to-br from-violet to-teal shadow-glow-violet"
            : "translate-x-0 bg-gradient-to-br from-amber to-amber-glow shadow-glow-amber"
        )}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-white transition-transform duration-300 group-hover:rotate-12" />
        ) : (
          <Sun className="w-4 h-4 text-white transition-transform duration-300 group-hover:rotate-45" />
        )}
      </div>

      {/* Inactive icon */}
      <div
        className={cn(
          "absolute flex items-center justify-center w-6 h-6 transition-all duration-500",
          isDark
            ? "left-2 opacity-40"
            : "right-2 opacity-40"
        )}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-muted-foreground" />
        ) : (
          <Moon className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
    </button>
  );
}
