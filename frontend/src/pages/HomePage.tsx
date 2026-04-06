import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { askRag } from "@/api/rag";
import type { Message } from "@/types/chat";
import ChatPanel from "@/components/ChatPanel";
import ThemeToggleButton from "@/components/ThemeToggleButton";

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      type: "text",
      content:
        "안녕하세요. 혜윤의 프로젝트 경험, 기술 스택, 역할, 성과에 대해 질문해보세요.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const handleAsk = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      type: "text",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const result = await askRag({ query: trimmed });

      const answerMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        type: "answer",
        content: result.answer,
      };

      setMessages((prev) => [...prev, answerMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: Date.now() + 2,
        role: "assistant",
        type: "error",
        content:
          err instanceof Error
            ? err.message
            : "요청 처리 중 오류가 발생했습니다.",
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <main className="h-screen overflow-hidden bg-(--color-bg) text-(--color-text) transition-colors">
      <div className="mx-auto flex h-full max-w-4xl flex-col sm:px-6">
        <header className="flex items-center justify-between border-b border-(--color-border) py-3">
          <div />

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggleButton />

            <Link
              to="/blog"
              className="text-xs text-(--color-text-subtle) transition hover:text-(--color-text) sm:text-sm"
            >
              블로그 보러 가기 →
            </Link>
          </div>
        </header>

        <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-4">
          <div className="mb-5 text-center">
            <div className="mb-3 inline-flex items-center rounded-full border border-(--color-primary-border) bg-(--color-primary-soft) px-2.5 py-1 text-[10px] text-(--color-primary) sm:text-xs">
              Portfolio AI
            </div>

            <h1 className="flex flex-col gap-1 font-semibold">
              <span
                className="bg-clip-text text-[26px] text-transparent"
                style={{ backgroundImage: "var(--gradient-hero)" }}
              >
                Ask about Hyeyoon
              </span>
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-xs leading-5 text-(--color-text-muted) sm:text-sm sm:leading-6">
              프로젝트 경험, 기술 스택, 역할과 성과를 기반으로 답변합니다.
              <br />
              문서 기반 RAG 시스템으로 검증된 정보 안에서만 응답합니다.
            </p>
          </div>

          <ChatPanel messages={messages} loading={loading} onAsk={handleAsk} />
          <div ref={bottomRef} />
        </section>
      </div>
    </main>
  );
}
