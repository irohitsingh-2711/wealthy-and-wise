"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "wealthy-and-wise-theme";

function setThemeOnDocument(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(STORAGE_KEY);
    const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    const initialTheme = savedTheme || preferredTheme;

    setThemeOnDocument(initialTheme);
    setTheme(initialTheme);
    setMounted(true);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setThemeOnDocument(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    setTheme(nextTheme);
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={mounted ? `Switch to ${theme === "dark" ? "light" : "dark"} mode` : "Toggle theme"}
    >
      <span className="theme-toggle-icon">{mounted && theme === "dark" ? "Sun" : "Moon"}</span>
      <span>{mounted && theme === "dark" ? "Light Mode" : "Night Mode"}</span>
    </button>
  );
}
