import { useTheme } from "@/providers/ThemeProvider";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="테마 변경"
      className="transition text-(--color-text-subtle) transition hover:text-(--color-text)"
      onMouseEnter={(e) => {
        e.currentTarget.style.accentColor = "var(--color-chip-bg-hover)";
      }}
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
