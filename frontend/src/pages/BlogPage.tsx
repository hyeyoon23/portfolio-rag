import { Link } from "react-router-dom";
import { blogPosts } from "@/data/blogData";
import BlogHeader from "@/components/BlogHeader";
import Footer from "@/components/Footer";

export default function BlogPage() {
  return (
    <main className="flex min-h-screen flex-col bg-(--color-bg) text-(--color-text) transition-colors">
      <BlogHeader />

      <section className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-8">
        <div className="mb-7">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 rounded-full bg-(--color-primary)" />
            <h2 className="text-[clamp(1.25rem,5vw,1.5rem)] font-bold tracking-tight">Posts</h2>
          </div>

          <p className="text-sm mt-3 text-(--color-text-muted)">
            프로젝트, 학습, 개발 기록을 정리하는 공간입니다.
          </p>
        </div>

        <div className="space-y-3">
          {blogPosts.map((post) => (
            <Link
              key={post.id}
              to={`/posts/${post.id}`}
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

      <Footer />
    </main>
  );
}
