import { useEffect, useRef, type ReactNode } from "react";
import ChatBox from "./ChatBox";
import AnswerCard from "./AnswerCard";
import type { Message } from "@/types/chat";
import { EXAMPLE_QUESTIONS } from "@/constants.ts/chat";

const BOT_AVATAR_SRC = "/hyeyoon-avatar.png";

function BotBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start justify-start gap-1">
      <img
        src={BOT_AVATAR_SRC}
        alt=""
        className="h-8 w-8 shrink-0 rounded-full object-cover sm:h-12 sm:w-12"
        style={{ borderRadius: "50%" }}
      />
      <div className="mt-4 flex min-w-0 max-w-[85%] flex-col items-start gap-1 sm:mt-6 sm:max-w-[80%]">
        {children}
      </div>
    </div>
  );
}

interface ChatPanelProps {
  messages: Message[];
  loading: boolean;
  onAsk: (question: string) => Promise<void>;
}

export default function ChatPanel({
  messages,
  loading,
  onAsk,
}: ChatPanelProps) {
  const listRef = useRef<HTMLDivElement | null>(null);

  // scrollIntoView는 overflow-hidden인 바깥 컨테이너까지 스크롤시키므로 목록만 스크롤
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl sm:max-h-[65dvh] backdrop-blur transition-colors"
      style={{
        border: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        boxShadow: "var(--shadow-panel)",
      }}
    >
      {/* 메시지 영역 */}
      <div
        ref={listRef}
        className="chat-scroll min-h-0 flex-1 overflow-y-auto px-2 pt-4 pb-6 sm:pl-3 sm:pr-4"
      >
        <div className="space-y-4">
          {messages.map((message) => {
            if (message.role === "user") {
              return (
                <div key={message.id} className="flex justify-end">
                  <div
                    className="max-w-[85%] rounded-2xl rounded-br-md px-4 py-3 text-sm shadow-lg"
                    style={{
                      background: "var(--gradient-user-bubble)",
                      color: "var(--color-user-bubble-text)",
                      boxShadow: "var(--shadow-user-bubble)",
                    }}
                  >
                    {message.content}
                  </div>
                </div>
              );
            }

            if (message.type === "error") {
              return (
                <div key={message.id} className="flex justify-start">
                  <div
                    className="max-w-[85%] rounded-2xl rounded-bl-md px-4 py-3 text-sm"
                    style={{
                      border: "1px solid var(--color-danger-border)",
                      background: "var(--color-danger-soft)",
                      color: "var(--color-danger-text)",
                    }}
                  >
                    {message.content}
                  </div>
                </div>
              );
            }

            return (
              <BotBubble key={message.id}>
                <div
                  className="max-w-full rounded-2xl rounded-tl-md px-4 py-3 text-sm leading-6"
                  style={{
                    border: "1px solid var(--color-card-border)",
                    background: "var(--color-card-bg)",
                    color: "var(--color-card-text)",
                  }}
                >
                  {message.type === "answer" ? (
                    <AnswerCard data={message.content} />
                  ) : (
                    message.content
                  )}
                </div>
              </BotBubble>
            );
          })}

          {loading && (
            <BotBubble>
              <div
                role="status"
                className="w-64 max-w-full rounded-2xl rounded-tl-md px-4 py-3"
                style={{
                  border: "1px solid var(--color-card-border)",
                  background: "var(--color-card-bg)",
                }}
              >
                <span className="sr-only">답변을 생성하고 있습니다...</span>
                <div className="flex animate-pulse flex-col gap-2 py-1">
                  {["w-full", "w-5/6", "w-2/3"].map((width) => (
                    <div
                      key={width}
                      className={`h-3 rounded-full ${width}`}
                      style={{ background: "var(--color-skeleton)" }}
                    />
                  ))}
                </div>
              </div>
            </BotBubble>
          )}
        </div>
      </div>

      {/* 예시 질문 */}
      <div
        className="shrink-0 px-3 py-3 sm:px-4"
        style={{ borderTop: "1px solid var(--color-divider-soft)" }}
      >
        {/* 좁은 화면: 한 줄 가로 스크롤 / sm 이상: 줄바꿈 */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto sm:flex-wrap sm:overflow-visible">
          {EXAMPLE_QUESTIONS.map((item) => (
            <button
              key={item}
              onClick={() => onAsk(item)}
              className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full border border-(--color-chip-border) bg-(--color-chip-bg) px-3 py-1 text-sm text-(--color-chip-text) transition hover:border-(--color-chip-border-hover) hover:bg-(--color-chip-bg-hover) hover:text-(--color-chip-text-hover) pointer-coarse:min-h-11 sm:px-2 sm:text-[12px]"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* 입력창 */}
      <div
        className="shrink-0 px-3 py-3 sm:px-4"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <ChatBox onSubmit={onAsk} loading={loading} />
      </div>
    </div>
  );
}
