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
    <div className="flex h-[65vh] flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/20 backdrop-blur">
      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="space-y-4">
          {messages.map((message) => {
            if (message.role === "user") {
              return (
                <div key={message.id} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-md bg-linear-to-r from-blue-500 to-purple-500 px-4 py-3 text-sm text-white shadow-lg shadow-blue-500/10">
                    {message.content}
                  </div>
                </div>
              );
            }

            if (message.type === "error") {
              return (
                <div key={message.id} className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {message.content}
                  </div>
                </div>
              );
            }

            return (
              <div key={message.id} className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-white/10 bg-slate-900/90 px-4 py-3 text-sm leading-6 text-slate-200">
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
              <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-white/10 bg-slate-900/90 px-4 py-3 text-sm text-slate-400">
                답변을 생성하고 있습니다...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* 예시 질문 */}
      <div className="border-t border-white/5 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUESTIONS.map((item) => (
            <button
              key={item}
              onClick={() => onAsk(item)}
              className="rounded-full border border-white/10 bg-white/3 px-2 py-1 text-[12px] text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* 입력창 */}
      <div className="border-t border-white/10 px-4 py-3 sm:px-6">
        <ChatBox onSubmit={onAsk} loading={loading} />
      </div>
    </div>
  );
}
