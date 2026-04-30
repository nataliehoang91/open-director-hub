"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

type Theme = "light" | "dark" | "system";

const THEMES: Theme[] = ["light", "dark", "system"];

const icons: Record<Theme, React.ReactNode> = {
  light:  <Sun className="h-4 w-4" />,
  dark:   <Moon className="h-4 w-4" />,
  system: <Monitor className="h-4 w-4" />,
};

function applyTheme(theme: Theme) {
  const dark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem("od-theme") as Theme) || "system";
    setTheme(saved);
    setMounted(true);

    // Watch system preference changes when in "system" mode
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onchange = () => {
      const current = (localStorage.getItem("od-theme") as Theme) || "system";
      if (current === "system") applyTheme("system");
    };
    mq.addEventListener("change", onchange);
    return () => mq.removeEventListener("change", onchange);
  }, []);

  if (!mounted) {
    return <div className="h-8 w-8 rounded-lg" />;
  }

  function cycle() {
    const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    setTheme(next);
    localStorage.setItem("od-theme", next);
    applyTheme(next);
  }

  return (
    <button
      onClick={cycle}
      title={`Theme: ${theme}`}
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
    >
      {icons[theme]}
      <span className="hidden sm:inline capitalize">{theme}</span>
    </button>
  );
}
