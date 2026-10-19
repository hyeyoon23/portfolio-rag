import type { ApiResponse, QueryResponse } from "../types/rag";

export interface QueryRequest {
  query: string;
  model?: string;
  maxResults?: number;
}

const UNAVAILABLE_MESSAGE =
  "지금은 챗봇을 사용할 수 없어요. 잠시 후 다시 시도해 주세요.";

export async function askRag(request: QueryRequest): Promise<QueryResponse> {
  // const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  let result: ApiResponse<QueryResponse>;

  try {
    const response = await fetch("/api/v1/rag/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: request.query,
        // model이 없으면 필드를 생략해 백엔드 기본값을 사용한다.
        ...(request.model ? { model: request.model } : {}),
        maxResults: request.maxResults ?? 3,
      }),
    });

    if (!response.ok) {
      console.error("RAG 요청 실패:", response.status, await response.text());
      throw new Error(UNAVAILABLE_MESSAGE);
    }

    result = await response.json();
  } catch (err) {
    console.error("RAG 요청 오류:", err);
    throw new Error(UNAVAILABLE_MESSAGE);
  }

  if (!result.success || !result.data) {
    console.error("RAG 응답 실패:", result.error);
    throw new Error(UNAVAILABLE_MESSAGE);
  }

  return result.data;
}
