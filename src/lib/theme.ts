// Lightweight theme manager — light / dark / system, no provider needed.
const KEY = "belly-theme";
export type ThemeChoice = "light" | "dark" | "system";

function applyTheme(choice: ThemeChoice) {
  const root = document.documentElement;
  if (choice === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", choice);
  }
}

export function getTheme(): ThemeChoice {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem(KEY) as ThemeChoice) || "system";
}

export function setTheme(choice: ThemeChoice) {
  localStorage.setItem(KEY, choice);
  applyTheme(choice);
}

export function initTheme() {
  applyTheme(getTheme());
}
