import { useEffect, useRef } from "react";
import ChatBox from "./ChatBox";
import AnswerCard from "./AnswerCard";
import type { Message } from "../types/chat";
import { EXAMPLE_QUESTIONS } from "../constants.ts/chat";

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
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div
      className="flex h-[65vh] flex-col overflow-hidden rounded-3xl backdrop-blur transition-colors"
      style={{
        border: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        boxShadow: "var(--shadow-panel)",
      }}
    >
      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
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
              <div key={message.id} className="flex justify-start">
                <div
                  className="max-w-[85%] rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-6"
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
              </div>
            );
          })}

          {loading && (
            <div className="flex justify-start">
              <div
                className="max-w-[85%] rounded-2xl rounded-bl-md px-4 py-3 text-sm"
                style={{
                  border: "1px solid var(--color-card-border)",
                  background: "var(--color-card-bg)",
                  color: "var(--color-text-subtle)",
                }}
              >
                답변을 생성하고 있습니다...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* 예시 질문 */}
      <div
        className="px-4 py-3 sm:px-6"
        style={{ borderTop: "1px solid var(--color-divider-soft)" }}
      >
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUESTIONS.map((item) => (
            <button
              key={item}
              onClick={() => onAsk(item)}
              className="rounded-full px-2 py-1 text-[12px] transition"
              style={{
                border: "1px solid var(--color-chip-border)",
                background: "var(--color-chip-bg)",
                color: "var(--color-chip-text)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor =
                  "var(--color-chip-border-hover)";
                e.currentTarget.style.background = "var(--color-chip-bg-hover)";
                e.currentTarget.style.color = "var(--color-chip-text-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-chip-border)";
                e.currentTarget.style.background = "var(--color-chip-bg)";
                e.currentTarget.style.color = "var(--color-chip-text)";
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* 입력창 */}
      <div
        className="px-4 py-3 sm:px-6"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <ChatBox onSubmit={onAsk} loading={loading} />
      </div>
    </div>
  );
}
