import type { ApiResponse, QueryResponse } from "../types/rag";

export interface QueryRequest {
  query: string;
  model?: string;
  maxResults?: number;
}

export async function askRag(request: QueryRequest): Promise<QueryResponse> {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const response = await fetch(`${BASE_URL}/api/v1/rag/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: request.query,
      model: request.model ?? "gpt-4o-mini",
      maxResults: request.maxResults ?? 3,
    }),
  });

  if (!response.ok) {
    throw new Error("질의 요청에 실패했습니다.");
  }

  const result: ApiResponse<QueryResponse> = await response.json();

  if (!result.success) {
    throw new Error(result.message ?? "RAG 응답 생성에 실패했습니다.");
  }

  return result.data;
}
