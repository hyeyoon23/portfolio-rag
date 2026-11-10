// 챗봇 추천 질문 칩과 미리 저장한 답변.
// 칩을 누르면 API(RAG)를 호출하지 않고 이 답변을 바로 보여준다.
// 문서(backend/docs)를 바꾸면 이 답변도 같이 갱신할 것.

export interface SuggestedQuestion {
  id: string;
  question: string;
  answer: string;
}

export const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  {
    id: "who",
    question: "Hyeyoon은 어떤 개발자인가요?",
    answer: [
      "저는 사용자 경험부터 서버까지 서비스 흐름을 끝까지 책임지는 개발자입니다 😊",
      "컴퓨터과학을 전공했고 프론트엔드에서 시작해 UX 기획, 백엔드, 인프라까지 범위를 넓혀 왔습니다.",
      "대표 프로젝트인 Sofit에서 프론트엔드 리더를 맡아 우리FIS아카데미 최종 프로젝트 최우수상을 받았습니다 👍",
    ].join("\n"),
  },
  {
    id: "projects",
    question: "어떤 프로젝트를 진행했나요?",
    answer: [
      "저는 소상공인 대출 플랫폼인 Sofit 프로젝트를 진행했습니다 ✨",
      "우리카드 Scope에서는 WAS 이중화와 세션 관리를, 같이가효에서는 AI 코스 추천 백엔드 API와 AI 서버 연동을 맡았습니다.",
      "그 밖에 개발자 매칭 서비스 Devine과 음성 감정 분석 앱 Speako도 진행했습니다 🚀",
    ].join("\n"),
  },
  {
    id: "stack",
    question: "주로 사용하는 기술 스택은?",
    answer: [
      "프론트엔드는 JavaScript, TypeScript, React, React Native, Zustand, TanStack Query, Axios, Tailwind CSS, Vite를 사용합니다 ✨",
      "백엔드는 Java, Spring, MySQL, Redis를 활용하고 있습니다.",
      "언어 중에는 JavaScript와 TypeScript가 가장 익숙하며, Java와 Python은 중급 수준입니다 💻",
    ].join("\n"),
  },
  {
    id: "future",
    question: "앞으로 어떤 개발자가 되고 싶나요?",
    answer: [
      "저는 사용자가 직접 쓰는 금융·플랫폼 서비스를 프론트엔드부터 서버 구조까지 이해하고 만드는 개발자가 되고 싶습니다 😊",
      "지금은 프론트엔드가 가장 익숙하며, 백엔드와 인프라로 영역을 계속 넓혀가고 있습니다.",
      "우리FIS아카데미의 금융 특강과 Sofit, 우리카드 Scope 프로젝트를 하면서 금융 도메인을 직접 접했습니다 👍",
    ].join("\n"),
  },
];

// 칩 답변 전 "입력 중" 표시 시간(ms). prefers-reduced-motion이면 지연 없이 바로 보여준다.
export const SUGGESTED_TYPING_DELAY_MIN_MS = 400;
export const SUGGESTED_TYPING_DELAY_MAX_MS = 700;
