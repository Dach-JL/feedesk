"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { StarButton } from "@/components/ui/star-button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 animate-pulse border border-zinc-200 dark:border-zinc-700" />
    );
  }

  return (
    <StarButton
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      lightColor={theme === "light" ? "#f59e0b" : "#FAFAFA"}
      className="h-10 w-10 p-0 flex items-center justify-center rounded-xl border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
      title="Toggle theme"
    >
      {theme === "light" ? (
        <Sun className="h-[18px] w-[18px] transition-all" />
      ) : (
        <Moon className="h-[18px] w-[18px] transition-all" />
      )}
    </StarButton>
  );
}
