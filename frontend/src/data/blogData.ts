export interface BlogPost {
  id: number;
  title: string;
  summary: string;
  content: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Spring AI로 인메모리 RAG 만들기",
    summary: "Vector DB 없이 markdown 기반으로 RAG를 구성한 과정 정리",
    content:
      "Spring AI와 SimpleVectorStore를 활용해 markdown 문서를 인메모리로 적재하고, 검색 후 답변을 생성하는 흐름을 정리했습니다.",
  },
  {
    id: 2,
    title: "Devine 프로젝트 회고",
    summary: "프론트엔드 팀장으로 참여하며 배운 점",
    content:
      "역할 분배, 일정 관리, 사용자 흐름 기반 UI 설계를 경험하며 팀 프로젝트 운영 역량을 키웠습니다.",
  },
  {
    id: 3,
    title: "프로젝트 경험을 RAG 문서로 구조화하기",
    summary: "포트폴리오 정보를 markdown 문서로 정리한 방법",
    content:
      "프로젝트 소개, 역할, 주요 기능, 성과를 구조화하면 검색 품질이 더 좋아지고 답변도 안정적으로 생성됩니다.",
  },
];
