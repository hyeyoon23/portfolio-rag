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

      <article className="mx-auto max-w-4xl px-6 py-16">
        <Link
          to="/blog"
          className="text-sm text-[var(--color-text-subtle)] transition hover:text-[var(--color-text)]"
        >
          ← 블로그로
        </Link>

        <h1 className="mt-6 text-4xl font-bold tracking-tight">{post.title}</h1>

        <p className="mt-4 text-[var(--color-text-muted)]">{post.summary}</p>

        <div className="prose mt-10 max-w-none">
          <div className="answer-text whitespace-pre-wrap leading-8">
            {post.content}
          </div>
        </div>
      </article>
    </main>
  );
}
