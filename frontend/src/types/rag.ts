export interface QueryRequest {
  query: string;
  model?: string;
  maxResults?: number;
}

export interface QueryResponse {
  answer: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
