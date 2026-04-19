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
        <div className="mx-auto max-w-4xl px-6 py-16">
          <p>존재하지 않는 게시글입니다.</p>
          <Link
            to="/blog"
            className="mt-4 inline-block text-[var(--color-text-subtle)] hover:text-[var(--color-text)]"
          >
            ← 블로그로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors">
      <BlogHeader />

      <article className="mx-auto max-w-3xl px-6 py-16">
        {/* 뒤로가기 */}
        <Link
          to="/blog"
          className="text-sm text-[var(--color-text-subtle)] transition hover:text-[var(--color-text)]"
        >
          ← 블로그로
        </Link>

        {/* 제목 */}
        <h1 className="mt-6 text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
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
