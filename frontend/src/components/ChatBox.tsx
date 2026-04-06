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

    setQuestion("");
    await onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="혜윤에 대해 궁금한 점을 질문해보세요."
          className="flex-1 rounded-2xl px-4 py-2.5 text-sm outline-none transition"
          style={{
            border: "1px solid var(--color-input-border)",
            background: "var(--color-input-bg)",
            color: "var(--color-input-text)",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed"
          style={{
            background: loading
              ? "var(--color-button-bg-disabled)"
              : "var(--color-button-bg)",
            color: loading
              ? "var(--color-button-text-disabled)"
              : "var(--color-button-text)",
          }}
        >
          {loading ? "생성 중..." : "질문하기"}
        </button>
      </div>
    </form>
  );
}
