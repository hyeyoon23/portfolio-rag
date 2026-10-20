export interface Project {
  id: string;
  number: string;
  name: string;
  // 수행 기간 (예: "2026.04.23 – 2026.06.17")
  period?: string;
  summary: string;
  // 한 줄 소개 아래 부연 설명
  description?: string;
  // 여러 항목이면 배열로 (목록으로 표시)
  role: string | string[];
  highlights: string[];
  // 주요 기능 구현 (펼쳐 보기 목록으로 표시)
  features?: string[];
  // 한 줄 목록, 또는 { group: "Frontend", items: [...] } 처럼 그룹으로 나눠서
  stack: string[] | { group: string; items: string[] }[];
  // public/ 기준 경로. 없으면 placeholder 박스 표시
  image?: string;
  // Projects 섹션에서 여러 장을 보여줄 때 (첫 장이 가운데). 없으면 image 한 장만 표시
  images?: string[];
  // 세로 휴대폰 스크린샷이면 "mobile" (폰 크기로 표시). 기본은 가로 웹 화면
  imageType?: "web" | "mobile";
  links: {
    github?: string;
    demo?: string;
  };
}

// 프로젝트 이미지 경로는 여기서만 관리 (Hero 파일 썸네일은 각 프로젝트의 image를 사용)
export const PROJECT_IMAGES = {
  sofit: "/projects/sofit1.png",
  sofit2: "/projects/sofit2.png",
  sofit3: "/projects/sofit3.png",
  withgahyo: "/projects/withgahyo1.png",
  withgahyo2: "/projects/withgahyo2.png",
  withgahyo3: "/projects/withgahyo3.png",
  scope: "/projects/scope.png",
  devine: "/projects/devine1.png",
  devine2: "/projects/devine2.png",
  speako: "/projects/speako1.png",
  speako2: "/projects/speako2.png",
  speako3: "/projects/speako3.png",
} as const;

export const projects: Project[] = [
  {
    id: "sofit",
    number: "01",
    name: "Sofit",
    period: "2026.04.23 – 2026.06.17",
    summary: "소상공인 성장 가능성 기반 대출 플랫폼",
    description: "금융 소외 계층을 위한 디지털 포용 금융 서비스 플랫폼",
    role: "5인 팀 프론트엔드 리더 · UX 기획, 프론트엔드, 일부 백엔드",
    highlights: [
      "우리FIS아카데미 최종 프로젝트 최우수상",
      "Speed Index 약 90% 개선",
      "FCP 약 36초 → 3.6초",
    ],
    features: [
      "소상공인의 비즈니스 데이터를 분석해 미래 성장 가능성을 대출 심사에 반영하고, 경영 개선 인사이트를 제공하는 소상공인 특화 대출 서비스",
      "금융위원회와 한국신용정보원의 SCB(소상공인 특화 신용평가) 제도를 바탕으로, 대출 신청·심사·실행·사후관리 프로세스와 S등급 분석 리포트, 마이 비즈데이터 기반 경영 분석 기능 구현",
      "매출증가율·업력·상권트렌드 등 계량·비계량 30여 개 피처를 활용해 LightGBM 기반 성장등급(S1~S10) 예측 모델을 개발하고, 일일/월간 배치 Python 파이프라인과 최대 3회 재시도 후 관리자 수동 트리거를 적용해 안정적인 등급 산출 운영 체계 구축",
      "React Query로 서버 상태의 캐싱·동기화를 담당하고, Zustand로 멀티스텝 대출 플로우의 클라이언트 상태를 관리하는 역할 분리 구조를 설계하여 불필요한 API 재호출을 최소화하고 플로우 이탈·복귀 시에도 입력 데이터 유실 없는 사용자 경험 확보",
      "SSE 기반 실시간 알림 푸시 구현, 동시 접속 환경에서의 안정적인 연결 관리 및 트랜잭션 독립성 확보를 통한 알림 유실 방지",
      "Jenkins·ECR·CodeDeploy를 연결한 자동화 배포 파이프라인을 구성하고, SonarQube 정적 분석을 통합해 코드 품질 검증 후 배포가 진행되는 체계를 확립. Blue/Green 배포 전략으로 서비스 중단 없는 릴리즈 환경 구현",
      "WireGuard VPN으로 AWS 운영 환경과 온프레미스 DB를 안전하게 연결하는 하이브리드 클라우드를 구성하고, InnoDB Cluster 자동 Failover로 DB 이중화를, 2개 AZ 다중화·ALB 분산으로 애플리케이션 이중화를 적용해 단일 장애점 없는 운영 환경 확보",
    ],
    stack: [
      {
        group: "Frontend",
        items: [
          "React 19",
          "TypeScript",
          "Vite",
          "React Query",
          "Zustand",
          "Tailwind CSS",
        ],
      },
      {
        group: "Backend",
        items: [
          "Java 21",
          "Spring Boot",
          "MySQL",
          "Redis",
          "Spring Security",
          "Spring Batch",
        ],
      },
    ],
    image: PROJECT_IMAGES.sofit,
    images: [
      PROJECT_IMAGES.sofit,
      PROJECT_IMAGES.sofit2,
      PROJECT_IMAGES.sofit3,
    ],
    imageType: "mobile",
    links: {
      github: "https://github.com/woori-SoFit",
    },
  },
  {
    id: "withgahyo",
    number: "02",
    name: "같이가효",
    period: "2026.05.20 – 2026.09.21",
    summary: "가족 맞춤 AI 여행 코스 추천 서비스",
    role: "AI 코스 추천 Spring 백엔드 API와 AI 서버 연동, 일자별 동선 정렬",
    highlights: ["2026 관광데이터 활용 공모전 웹/앱 개발 부문 본선 진출"],
    features: [
      "부모와 자녀의 여행 취향을 함께 분석해 가족 모두가 만족하는 관광코스를 추천하는 가족 맞춤형 AI 여행 코스 추천 서비스. 2026 관광데이터 활용 공모전 웹/앱 개발 부문 본선 진출",
      "부모-자녀 취향 매칭 기반 코스 추천: 부모와 자녀가 각각 여행 취향과 조건을 입력하거나 A/B 선호도 탭을 선택하면 두 세대의 공통분모를 분석해 코스를 추천 (부모: 자연·역사·전통시장·온천·한식·짧은 산책·휴식 / 자녀: 카페·사진 명소·로컬 맛집·숙소 분위기·이동 방식)",
      "Spring 백엔드에서 AI 코스 추천 API를 개발하고 AI 서버와 연동해, 추천 결과를 일자별 동선 순서로 정렬해 사용자에게 제공하는 코스 생성 흐름 구현",
      '여행 후 가족 만족도 피드백 수집 및 재추천 반영: 부모는 이동 피로도와 음식·휴식·관광지 만족도를, 자녀는 동선과 전체 일정 만족도를 평가하고, 이 결과를 다음 추천에 반영 (예: 부모가 "걷기 힘들었다"고 응답하면 도보 이동이 짧고 휴식 장소가 많은 코스를 우선 추천)',
      "쓸수록 가족별 취향과 부모의 컨디션을 학습하는 맞춤형 관광 서비스 구조 설계",
    ],
    stack: [
      {
        group: "Frontend",
        items: [
          "React 19",
          "TypeScript",
          "Vite",
          "Tailwind CSS v4",
          "React Router",
          "TanStack Query",
          "Zustand",
          "Axios",
          "React Hook Form",
          "Zod",
          "ESLint",
          "Prettier",
        ],
      },
      { group: "Backend", items: ["Spring"] },
    ],
    image: PROJECT_IMAGES.withgahyo,
    images: [
      PROJECT_IMAGES.withgahyo,
      PROJECT_IMAGES.withgahyo2,
      PROJECT_IMAGES.withgahyo3,
    ],
    imageType: "mobile",
    links: {
      github: "https://github.com/withgahyo/withgahyo-frontend",
    },
  },
  {
    id: "scope",
    number: "03",
    name: "우리카드 Scope",
    summary:
      "약 530만 건의 카드 거래 데이터로 회원 등급 성장과 소비 성향을 분석하는 플랫폼",
    role: "4인 팀 · WAS 이중화와 Redis 세션 관리",
    highlights: [],
    features: [
      "우리카드의 530만 건 카드 거래 데이터를 기반으로 카드 이용 현황을 조회·분석하는 웹 애플리케이션. 3-Tier 아키텍처 전 계층(WAS·DB·세션)에 이중화를 적용해 은행 시스템에 요구되는 고가용성 구현",
      "기준 분기별 고객 목록 조회와 등급·연령대·성별·지역·고객번호 필터 검색, 고객 상세 조회(최다 소비 중분류, 현재 등급, 다음 등급까지 남은 금액과 진행률) 기능 구현",
      "5단계 등급 체계(기타·Gold·Platinum·VIP·VVIP, 500만·1,000만·1,500만·2,000만 원 기준)를 설계해 회원 등급 성장과 소비 성향을 분석",
      "대용량 테이블에서 OFFSET 방식의 조회 지연을 피하도록 PK 기반 Deferred Join 페이징을 적용하고, null이 아닌 파라미터만 WHERE 조건에 추가하는 PreparedStatement 동적 검색 구현",
      "WAS 이중화와 세션 관리 담당: Nginx(least_conn)로 부하를 분산하는 Tomcat 2대 구성에서 세션 공유 방식을 DB 저장·Redis·JWT·Sticky Session·Tomcat Clustering 5가지로 비교해 Redis를 선택하고, Redisson Tomcat Session Manager로 구현해 한쪽 WAS가 중단돼도 로그인 세션 유지",
      "MySQL InnoDB Cluster(Single-Primary, 4대: R/W 1 + R/O 3)와 MySQL Router(R/W 6446, R/O 6447)로 DB 이중화 및 자동 Failover 구성 (팀원 담당)",
      "AuthFilter로 보호 경로 접근을 제어하고, Docker Compose로 전체 환경을 구성",
    ],
    // 핵심만: 이중화·세션 구성에 직접 쓰인 기술 위주
    stack: [
      "Java 21",
      "Tomcat 9",
      "MySQL InnoDB Cluster",
      "Redis",
      "Redisson",
      "Nginx",
      "Docker Compose",
    ],
    image: PROJECT_IMAGES.scope,
    links: {
      github: "https://github.com/hyeyoon23/woori_card_scope",
    },
  },
  {
    id: "devine",
    number: "04",
    name: "DeVine",
    period: "2025.12.20 – 2026.02.20",
    summary:
      "사이드 프로젝트를 함께할 개발자와 PM을 매칭해주는 IT 협업 커뮤니티 플랫폼",
    description:
      "프로젝트 등록부터 팀원 매칭, AI 기반 프로젝트 분석 리포트까지 — 사이드 프로젝트의 시작을 체계적으로 지원",
    role: [
      "Frontend Leader",
      "역할 분담, 일정 관리, 기술 스택 및 구조 설계 주도",
      "개발자 / PM 검색 페이지 UI 구현 및 API 연동",
      "매칭 페이지 UI 구현 및 상태 분기 처리, API 연동",
    ],
    highlights: [
      "데모데이에서 코드 분석 리포트 출력 기능이 높은 관심을 받아 약 100명 이상이 리포트 이용",
    ],
    features: [
      "개발자 프로젝트 매칭 서비스: 프로젝트를 등록해 팀원을 모집하고, 기술 스택·카테고리 기반 필터 검색으로 맞는 프로젝트를 찾을 수 있는 개발자 매칭 플랫폼",
      "프로젝트 등록 및 모집 공고 관리, 팀원 지원·수락·거절 워크플로우 구현",
    ],
    stack: ["React", "TypeScript", "TailwindCSS"],
    image: PROJECT_IMAGES.devine,
    images: [PROJECT_IMAGES.devine, PROJECT_IMAGES.devine2],
    links: {
      github: "https://github.com/DeVine-2025/DeVine_FrontEnd",
    },
  },
  {
    id: "speako",
    number: "05",
    name: "Speako",
    period: "2024.12.20 – 2025.09.30",
    summary: "사용자의 언어 습관 개선을 위한 음성 기반 감정 분석 서비스",
    role: [
      "음성 녹음 파일을 텍스트로 변환하고, 서버 API와 비동기 통신하여 데이터 전송 및 분석 결과 수신 로직 구현",
      "녹음 활동 기반 뱃지 시스템을 포함한 피드(게시글 작성·조회) 컴포넌트 설계 및 API 연동",
    ],
    highlights: ["졸업 캡스톤 프로젝트"],
    features: [
      "사용자의 음성을 실시간으로 녹음해 텍스트로 변환한 뒤, AI 기반 감정 분석으로 발화를 긍정·부정·중립으로 분류하는 말하기 습관 분석 서비스 (졸업 프로젝트)",
      "감정 분석 결과를 정량화된 수치로 제공하는 분석 리포트 구현, 부정적인 표현을 긍정적인 언어로 바꿔 주는 맞춤형 피드백을 자동 생성해 사용자의 언어 습관 개선을 지원",
      "React 웹 앱을 React Native로 전환해 모바일 환경에서 바로 녹음하고 분석 결과를 확인할 수 있는 앱으로 개발, Xcode 빌드와 iOS 호환성 이슈에 대응",
      "차트 라이브러리로 원하는 디자인을 구현할 수 없어 react-native-svg로 분석 리포트 차트를 직접 구현하고, 원형 감정 차트의 원주와 비율을 직접 계산해 감정 비율을 시각화",
    ],
    stack: ["React Native", "TypeScript", "TailwindCSS"],
    image: PROJECT_IMAGES.speako,
    images: [
      PROJECT_IMAGES.speako,
      PROJECT_IMAGES.speako2,
      PROJECT_IMAGES.speako3,
    ],
    imageType: "mobile",
    links: {
      github: "https://github.com/hyeyoon23/Speako-FE",
    },
  },
];
