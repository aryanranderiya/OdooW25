"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark";

  return (
    <DropdownMenuItem
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="cursor-pointer"
    >
      {isDark ? (
        <>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark Mode</span>
        </>
      )}
    </DropdownMenuItem>
  );
}
