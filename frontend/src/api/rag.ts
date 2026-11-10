import type { ApiResponse, QueryResponse } from "../types/rag";
import {
  PREWARM_PATH,
  PREWARM_SESSION_KEY,
  RETRY_DELAYS_MS,
  RETRY_DELAY_MAX_MS,
  UNAVAILABLE_MESSAGE,
  WAKEUP_RETRY_STATUSES,
  WAKEUP_TOTAL_TIMEOUT_MS,
} from "../constants.ts/wakeup";

export interface QueryRequest {
  query: string;
  model?: string;
  maxResults?: number;
}

export interface AskRagOptions {
  signal?: AbortSignal;
  // 서버가 깨어나는 중으로 판단되어 첫 재시도를 시작할 때 한 번 호출된다.
  onWaking?: (startedAt: number) => void;
}

export class RagError extends Error {
  // wakeupTimeout: 서버 깨우기 대기 시간 초과 → "다시 시도" 버튼 노출
  readonly kind: "unavailable" | "wakeupTimeout" | "aborted";

  constructor(kind: RagError["kind"], message = UNAVAILABLE_MESSAGE) {
    super(message);
    this.name = "RagError";
    this.kind = kind;
  }
}

// 서버가 깨어나는 중으로 보고 재시도할 실패
class WakingError extends Error {}

function retryDelay(attempt: number) {
  return RETRY_DELAYS_MS[attempt] ?? RETRY_DELAY_MAX_MS;
}

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new RagError("aborted"));
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new RagError("aborted"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

async function requestOnce(
  request: QueryRequest,
  signal: AbortSignal,
): Promise<QueryResponse> {
  let response: Response;

  try {
    response = await fetch("/api/v1/rag/query", {
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
      signal,
    });
  } catch (err) {
    if (signal.aborted) throw new RagError("aborted");
    console.error("RAG 네트워크 오류:", err);
    throw new WakingError();
  }

  if (WAKEUP_RETRY_STATUSES.includes(response.status)) {
    console.error("RAG 서버 깨우는 중:", response.status);
    throw new WakingError();
  }

  let result: ApiResponse<QueryResponse>;

  try {
    if (!response.ok) {
      console.error("RAG 요청 실패:", response.status, await response.text());
      throw new RagError("unavailable");
    }

    result = await response.json();
  } catch (err) {
    if (signal.aborted) throw new RagError("aborted");
    console.error("RAG 요청 오류:", err);
    throw new RagError("unavailable");
  }

  if (!result.success || !result.data) {
    console.error("RAG 응답 실패:", result.error);
    throw new RagError("unavailable");
  }

  return result.data;
}

export async function askRag(
  request: QueryRequest,
  { signal, onWaking }: AskRagOptions = {},
): Promise<QueryResponse> {
  const startedAt = Date.now();
  const deadline = startedAt + WAKEUP_TOTAL_TIMEOUT_MS;
  let attempt = 0;

  for (;;) {
    // 재시도 요청은 남은 대기 시간이 끝나면 중단한다(최초 요청은 기존처럼 제한 없음).
    const attemptController = new AbortController();
    const abortAttempt = () => attemptController.abort();
    signal?.addEventListener("abort", abortAttempt, { once: true });
    if (signal?.aborted) attemptController.abort();
    const timer =
      attempt > 0
        ? setTimeout(abortAttempt, Math.max(0, deadline - Date.now()))
        : undefined;

    try {
      return await requestOnce(request, attemptController.signal);
    } catch (err) {
      if (err instanceof RagError && err.kind === "aborted" && !signal?.aborted) {
        // 사용자 취소가 아니라 대기 시간 초과로 끊긴 경우
        throw new RagError("wakeupTimeout");
      }
      if (!(err instanceof WakingError)) throw err;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abortAttempt);
    }

    const delay = retryDelay(attempt);
    if (Date.now() + delay >= deadline) {
      throw new RagError("wakeupTimeout");
    }
    if (attempt === 0) onWaking?.(startedAt);

    await sleep(delay, signal);
    attempt += 1;
  }
}

// 방문자가 챗봇을 쓰기 전에 백엔드를 미리 깨운다. 응답은 무시하고, 세션당 한 번만 보낸다.
export function prewarmRag() {
  try {
    if (sessionStorage.getItem(PREWARM_SESSION_KEY)) return;
    sessionStorage.setItem(PREWARM_SESSION_KEY, "1");
  } catch {
    // sessionStorage를 쓸 수 없어도 요청은 보낸다.
  }

  fetch(PREWARM_PATH, { method: "GET", cache: "no-store" }).catch((err) => {
    console.error("RAG 서버 미리 깨우기 실패:", err);
  });
}
