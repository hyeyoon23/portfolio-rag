import { useState } from "react";

interface ChatBoxProps {
  onSubmit: (question: string) => Promise<void>;
  loading: boolean;
  initialValue?: string;
}

export default function ChatBox({
  onSubmit,
  loading,
  initialValue = "",
}: ChatBoxProps) {
  const [question, setQuestion] = useState(initialValue);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = question.trim();
    if (!trimmed || loading) return;

    await onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="혜윤에 대해 궁금한 점을 질문해보세요."
          className="flex-1 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-slate-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-gray-300 px-5 py-3 font-medium text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? "생성 중..." : "질문하기"}
        </button>
      </div>
    </form>
  );
}
