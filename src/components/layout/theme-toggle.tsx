"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes injects a script that sets the resolved theme before
  // hydration (to avoid a flash of the wrong theme), so `theme` is already
  // truthy on the client's first render while the server-rendered markup
  // has no theme at all. Gating on a post-mount effect — not state derived
  // during render — is the documented fix: it keeps the first client render
  // identical to the server's, then swaps in the real button only after
  // hydration completes, where a mismatch is no longer possible.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-10 w-10" />;

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
