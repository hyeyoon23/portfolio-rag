import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { askRag, RagError } from "@/api/rag";
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
  // 서버를 깨우며 재시도 중이면 최초 요청 시각, 아니면 null
  const [wakingSince, setWakingSince] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // 페이지를 떠나면 진행 중인 요청/재시도를 취소
  useEffect(() => () => abortRef.current?.abort(), []);

  const runQuery = async (question: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setWakingSince(null);

    try {
      const result = await askRag(
        { query: question },
        {
          signal: controller.signal,
          onWaking: (startedAt) => {
            if (!controller.signal.aborted) setWakingSince(startedAt);
          },
        },
      );
      if (controller.signal.aborted) return;

      const answerMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        type: "answer",
        content: result.answer,
      };

      setMessages((prev) => [...prev, answerMessage]);
    } catch (err) {
      if (controller.signal.aborted) return;

      const errorMessage: Message = {
        id: Date.now() + 2,
        role: "assistant",
        type: "error",
        content:
          err instanceof Error
            ? err.message
            : "요청 처리 중 오류가 발생했습니다.",
        ...(err instanceof RagError && err.kind === "wakeupTimeout"
          ? { retryQuestion: question }
          : {}),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      // 새 요청이 이미 시작됐다면 그 요청의 로딩 상태를 건드리지 않는다.
      if (abortRef.current === controller) {
        abortRef.current = null;
        setLoading(false);
        setWakingSince(null);
      }
    }
  };

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
    await runQuery(trimmed);
  };

  // 오류 말풍선의 "다시 시도": 질문 말풍선은 그대로 두고 오류 말풍선만 걷어낸 뒤 재요청
  const handleRetry = async (errorMessageId: number, question: string) => {
    if (loading) return;
    setMessages((prev) => prev.filter((m) => m.id !== errorMessageId));
    await runQuery(question);
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
    setWakingSince(null);
  };

  return (
    <main className="h-dvh overflow-hidden pb-[env(safe-area-inset-bottom)] bg-(--color-bg) text-(--color-text) transition-colors">
      <div className="mx-auto flex h-full max-w-4xl flex-col px-3 sm:px-6">
        <header className="flex items-center justify-between border-b border-(--color-border) h-12">
          <div />

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggleButton />

            <Link
              to="/home"
              className="inline-flex min-h-11 items-center whitespace-nowrap px-1 text-sm text-(--color-text-subtle) transition hover:text-(--color-text)"
            >
              블로그 보러 가기 →
            </Link>
          </div>
        </header>

        <section className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col justify-center py-3 sm:py-4">
          <div className="mb-3 text-center sm:mb-5">
            <div className="mb-3 inline-flex items-center rounded-full border border-(--color-primary-border) bg-(--color-primary-soft) px-2.5 py-1 text-xs text-(--color-primary)">
              Portfolio AI
            </div>

            <h1 className="flex flex-col gap-1 font-semibold">
              <span
                className="bg-clip-text text-[clamp(1.375rem,4vw+0.5rem,1.625rem)] text-transparent"
                style={{ backgroundImage: "var(--gradient-hero)" }}
              >
                Ask about Hyeyoon
              </span>
            </h1>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-(--color-text-muted) sm:mt-3">
              프로젝트 경험, 기술 스택, 역할과 성과를 기반으로 답변합니다.
              <br />
              문서 기반 RAG 시스템으로 검증된 정보 안에서만 응답합니다.
            </p>
          </div>

          <ChatPanel
            messages={messages}
            loading={loading}
            wakingSince={wakingSince}
            onAsk={handleAsk}
            onRetry={handleRetry}
            onCancel={handleCancel}
          />
        </section>
      </div>
    </main>
  );
}
