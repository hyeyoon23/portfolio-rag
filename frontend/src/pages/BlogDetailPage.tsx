import { Link, useParams } from "react-router-dom";
import BlogHeader from "@/components/BlogHeader";
import { blogPosts } from "@/data/blogData";

export default function BlogDetailPage() {
  const { id } = useParams();
  const post = blogPosts.find((item) => item.id === Number(id));

  if (!post) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        <BlogHeader />
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
          <p>존재하지 않는 게시글입니다.</p>
          <Link
            to="/blog"
            className="mt-4 inline-flex min-h-11 items-center text-[var(--color-text-subtle)] hover:text-[var(--color-text)]"
          >
            ← 목록으로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors">
      <BlogHeader />

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        {/* 뒤로가기 */}
        <Link
          to="/blog"
          className="inline-flex min-h-11 items-center text-sm text-[var(--color-text-subtle)] transition hover:text-[var(--color-text)]"
        >
          ← 목록으로
        </Link>

        {/* 제목 */}
        <h1 className="mt-4 text-[clamp(1.5rem,5vw+0.5rem,2.25rem)] font-bold leading-tight tracking-tight sm:mt-6">
          {post.title}
        </h1>

        {/* 요약 */}
        <p className="mt-4 text-sm sm:text-base leading-7 text-[var(--color-text-muted)]">
          {post.summary}
        </p>

        {/* 구분선 */}
        <div className="mt-8 border-t border-[var(--color-divider-soft)]" />

        {/* 본문 */}
        <div className="mt-10">
          <div className="blog-content whitespace-pre-wrap">{post.content}</div>
        </div>
      </article>
    </main>
  );
}
