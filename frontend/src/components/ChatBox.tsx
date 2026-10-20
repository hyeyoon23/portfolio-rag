import { Loader2, Send } from "lucide-react";
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
  const isDisabled = loading || !question.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setQuestion("");
    await onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="혜윤에 대해 궁금한 점을 질문해보세요."
          className="h-11 min-w-0 flex-1 rounded-2xl px-4 text-base outline-none transition"
          style={{
            border: "1px solid var(--color-input-border)",
            background: "var(--color-input-bg)",
            color: "var(--color-input-text)",
          }}
        />

        <button
          type="submit"
          disabled={isDisabled}
          aria-label="질문 전송"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-(--color-primary) text-(--color-button-text-on-primary) transition enabled:hover:bg-(--color-primary-hover) disabled:cursor-not-allowed disabled:bg-(--color-button-bg-disabled) disabled:text-(--color-button-text-disabled) sm:w-auto sm:px-4"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </form>
  );
}
