const storageKey = "drew-theme";
const root = document.documentElement;
const toggle = document.querySelector("[data-theme-toggle]");
const toggleLabel = toggle?.querySelector("[data-theme-label]");

const updateToggle = (theme) => {
  if (!toggle) {
    return;
  }

  const isDark = theme === "dark";
  toggle.setAttribute("aria-pressed", String(isDark));
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";
  toggle.setAttribute("aria-label", label);
  toggle.setAttribute("title", label);
  if (toggleLabel) {
    toggleLabel.textContent = theme;
  }
};

const storedTheme = localStorage.getItem(storageKey);
const initialTheme = storedTheme || "light";
root.dataset.theme = initialTheme;
updateToggle(initialTheme);

if (toggle) {
  toggle.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = nextTheme;
    localStorage.setItem(storageKey, nextTheme);
    updateToggle(nextTheme);
  });
}
