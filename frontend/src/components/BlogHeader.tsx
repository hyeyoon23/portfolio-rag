import { Link, useLocation } from "react-router-dom";
import { BotMessageSquare, NotebookPen } from "lucide-react";
import ThemeToggleButton from "./ThemeToggleButton";

export default function BlogHeader() {
  const location = useLocation();

  const isHome = location.pathname === "/";
  const isMain = location.pathname === "/home";
  const isPosts = location.pathname.startsWith("/posts");
  const isAbout = location.pathname === "/about";
  const isGuestbook = location.pathname === "/guestbook";

  const navClass = (active: boolean) =>
    [
      "inline-flex min-h-11 items-center whitespace-nowrap px-1.5 text-sm font-medium transition-colors sm:px-2",
      active
        ? "text-[var(--color-text)]"
        : "text-[var(--color-text-subtle)] hover:text-[var(--color-text)]",
    ].join(" ");

  return (
    <header className="border-b border-(--color-border) bg-(--color-bg)">
      <div className="mx-auto flex h-12 max-w-4xl items-center justify-between gap-2 px-2 sm:px-6">
        <div className="flex items-center sm:gap-2">
          <Link to="/home" className={navClass(isMain)}>
            Home
          </Link>
          <Link to="/posts" className={navClass(isPosts)}>
            Posts
          </Link>
          <Link to="/about" className={navClass(isAbout)}>
            About
          </Link>
        </div>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className={[
              "inline-flex min-h-8 items-center gap-1 whitespace-nowrap rounded-lg px-2 text-sm transition duration-300",
              isHome
                ? "text-(--color-text) font-medium"
                : "text-(--color-text-subtle) hover:text-white hover:bg-linear-to-r hover:from-blue-500 hover:to-purple-500",
            ].join(" ")}
          >
            <BotMessageSquare size={16} strokeWidth={1.8} />
            <span>AI Chat</span>
          </Link>

          <Link
            to="/guestbook"
            aria-label="방명록"
            title="방명록"
            className={[
              "inline-flex h-11 w-8 items-center justify-center transition",
              isGuestbook
                ? "text-(--color-text)"
                : "text-(--color-text-subtle) hover:text-(--color-text)",
            ].join(" ")}
          >
            <NotebookPen size={18} strokeWidth={1.8} />
          </Link>

          <ThemeToggleButton />
        </nav>
      </div>
    </header>
  );
}
