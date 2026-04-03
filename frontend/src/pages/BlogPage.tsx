import { Link } from "react-router-dom";
import { blogPosts } from "../data/blogData";

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10">
          <Link to="/" className="text-sm text-slate-400 hover:text-white">
            ← 홈으로
          </Link>
          <h1 className="mt-4 text-4xl font-bold">블로그</h1>
          <p className="mt-3 text-slate-400">
            프로젝트, 학습, 개발 기록을 정리하는 공간입니다.
          </p>
        </div>

        <div className="space-y-4">
          {blogPosts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.id}`}
              className="block rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-slate-600"
            >
              <h2 className="text-xl font-semibold">{post.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {post.summary}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
