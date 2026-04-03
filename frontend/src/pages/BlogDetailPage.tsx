import { Link, useParams } from "react-router-dom";
import { blogPosts } from "../data/blogData";

export default function BlogDetailPage() {
  const { id } = useParams();
  const post = blogPosts.find((item) => item.id === Number(id));

  if (!post) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-3xl">
          <Link to="/blog" className="text-sm text-slate-400 hover:text-white">
            ← 블로그로
          </Link>
          <p className="mt-6 text-slate-300">존재하지 않는 글입니다.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <Link to="/blog" className="text-sm text-slate-400 hover:text-white">
          ← 블로그로
        </Link>

        <article className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <h1 className="text-3xl font-bold">{post.title}</h1>
          <p className="mt-4 leading-7 text-slate-300">{post.content}</p>
        </article>
      </div>
    </main>
  );
}
