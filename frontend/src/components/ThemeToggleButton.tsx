import { useTheme } from "@/providers/ThemeProvider";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="테마 변경"
      className="inline-flex w-8 items-center justify-center text-(--color-text-subtle) transition hover:text-(--color-text)"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
