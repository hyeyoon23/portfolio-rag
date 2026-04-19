import { Link } from "react-router-dom";
import { blogPosts } from "@/data/blogData";
import BlogHeader from "@/components/BlogHeader";
import { FaGithub, FaInstagram } from "react-icons/fa";

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-(--color-bg) text-(--color-text) transition-colors">
      <BlogHeader />

      <section className="mx-auto max-w-4xl px-6 py-8 sm:px-8">
        <div className="mb-15">
          <p
            className="text-md font-medium bg-clip-text text-transparent"
            style={{ backgroundImage: "var(--gradient-hero)" }}
          >
            Thanks for stopping by.
          </p>

          <h1 className="mt-5 text-2xl font-bold tracking-tight">
            Welcome to HYEYOON's Dev Blog 🥳
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-7 text-(--color-text-muted)">
            This is where I share my projects, learning notes, and thoughts as a
            frontend developer.
          </p>

          <div className="mt-5 flex items-center gap-3">
            <a
              href="https://github.com/hyeyoon23"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-subtle)] transition hover:border-[var(--color-primary-border)] hover:text-[var(--color-text)]"
            >
              <FaGithub size={18} strokeWidth={1.8} />
            </a>

            <a
              href="https://instagram.com/hyeyoon_23"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-subtle)] transition hover:border-[var(--color-primary-border)] hover:text-[var(--color-text)]"
            >
              <FaInstagram size={18} strokeWidth={1.8} />
            </a>
          </div>
        </div>

        <div className="mb-7">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 rounded-full bg-(--color-primary)" />
            <h2 className="text-2xl font-bold tracking-tight">Blog</h2>
          </div>

          <p className="text-sm mt-3 text-(--color-text-muted)">
            프로젝트, 학습, 개발 기록을 정리하는 공간입니다.
          </p>
        </div>

        <div className="space-y-3">
          {blogPosts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.id}`}
              className="blog-card block rounded-2xl p-5 transition"
            >
              <h2 className="text-md font-semibold text-(--color-card-text)">
                {post.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-(--color-text-muted)">
                {post.summary}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
