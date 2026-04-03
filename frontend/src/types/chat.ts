export type MessageRole = "user" | "assistant";

export type MessageType = "text" | "answer" | "error";

export interface BaseMessage {
  id: number;
  role: MessageRole;
  content: string;
}

export interface TextMessage extends BaseMessage {
  type: "text";
}

export interface AnswerMessage extends BaseMessage {
  type: "answer";
}

export interface ErrorMessage extends BaseMessage {
  type: "error";
}

export type Message = TextMessage | AnswerMessage | ErrorMessage;
