import { Link, useLocation } from "react-router-dom";
import { BotMessageSquare, Search } from "lucide-react";
import ThemeToggleButton from "./ThemeToggleButton";

export default function BlogHeader() {
  const location = useLocation();

  const isHome = location.pathname === "/";
  const isPosts = location.pathname.startsWith("/blog");
  const isAbout = location.pathname === "/about";

  const navClass = (active: boolean) =>
    [
      "text-sm font-medium transition-colors",
      active
        ? "text-[var(--color-text)]"
        : "text-[var(--color-text-subtle)] hover:text-[var(--color-text)]",
    ].join(" ");

  return (
    <header className="border-b border-(--color-border) bg-(--color-bg)">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6 sm:px-8">
        <Link
          to="/blog"
          className="text-xl font-bold tracking-tight text-(--color-text)"
        >
          HyeyoonLog
        </Link>

        <nav className="flex items-center gap-5">
          <Link
            to="/"
            className={[
              "flex items-center gap-1 rounded-lg px-2 py-1 text-sm transition duration-300",
              isHome
                ? "text-(--color-text) font-medium"
                : "text-(--color-text-subtle) hover:text-white hover:bg-linear-to-r hover:from-blue-500 hover:to-purple-500",
            ].join(" ")}
          >
            <BotMessageSquare size={16} strokeWidth={1.8} />
            <span>AI Chat</span>
          </Link>
          <Link to="/blog" className={navClass(isPosts)}>
            Posts
          </Link>
          <Link to="/about" className={navClass(isAbout)}>
            About
          </Link>

          <button
            type="button"
            aria-label="검색"
            className="text-(--color-text-subtle) transition hover:text-(--color-text)"
          >
            <Search size={18} strokeWidth={1.8} />
          </button>

          <ThemeToggleButton />
        </nav>
      </div>
    </header>
  );
}
