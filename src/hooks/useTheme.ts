"use client";

import { useEffect, useState } from "react";

const THEME_KEY = "kali_theme";

export function useTheme() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) as "dark" | "light" | null;
    const initial = stored ?? "dark";
    setTheme(initial);
    document.documentElement.classList.toggle("light", initial === "light");
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      document.documentElement.classList.toggle("light", next === "light");
      return next;
    });
  };

  return { theme, toggle };
}
