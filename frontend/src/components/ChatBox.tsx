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
          disabled={isDisabled}
          className="flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed"
          style={{
            background: isDisabled
              ? "var(--color-button-bg-disabled)"
              : "var(--color-primary)",
            color: isDisabled
              ? "var(--color-button-text-disabled)"
              : "var(--color-button-text-on-primary)",
          }}
          onMouseEnter={(e) => {
            if (!isDisabled) {
              e.currentTarget.style.background = "var(--color-primary-hover)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isDisabled) {
              e.currentTarget.style.background = "var(--color-primary)";
            }
          }}
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
