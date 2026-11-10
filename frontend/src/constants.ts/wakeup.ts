// Render 무료 서버가 잠들어 있다가 깨어나는 동안(502/503/504, 네트워크 오류)의 재시도 설정

// 재시도 간격: 3초, 5초, 8초, 이후는 RETRY_DELAY_MAX_MS 간격
export const RETRY_DELAYS_MS = [3_000, 5_000, 8_000];
export const RETRY_DELAY_MAX_MS = 10_000;

// 최초 시도부터 이 시간이 지나면 재시도를 멈추고 오류 말풍선으로 전환
export const WAKEUP_TOTAL_TIMEOUT_MS = 90_000;

// 이 시간이 지나면 깨우는 중 문구를 SLOW 문구로 교체
export const WAKEUP_SLOW_THRESHOLD_MS = 30_000;

// 재시도 대상 HTTP 상태 코드
export const WAKEUP_RETRY_STATUSES = [502, 503, 504];

export const WAKEUP_MESSAGE =
  "서버를 깨우는 중이에요. 최대 1~2분 걸릴 수 있어요 ☕";
export const WAKEUP_SLOW_MESSAGE =
  "조금만 더 기다려 주세요. 곧 답해 드릴게요 ☕";
export const UNAVAILABLE_MESSAGE =
  "지금은 챗봇을 사용할 수 없어요. 잠시 후 다시 시도해 주세요.";
export const RETRY_BUTTON_LABEL = "다시 시도";
export const CANCEL_LABEL = "취소";

// 미리 깨우기: 백엔드에 /api 아래 GET 상태 확인 엔드포인트가 없어서
// 프록시를 타는 아무 경로나 호출한다(404여도 서버는 깨어남).
export const PREWARM_PATH = "/api/v1/warmup";
export const PREWARM_SESSION_KEY = "rag-prewarmed";
