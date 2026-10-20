import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  animate,
  motion,
  useDragControls,
  useMotionValue,
  useReducedMotion,
  type Transition,
} from "framer-motion";
import { FaGithub, FaInstagram } from "react-icons/fa";
import type { IconType } from "react-icons";
import {
  SiFigma,
  SiGithub,
  SiNotion,
  SiReact,
  SiSpring,
  SiTypescript,
} from "react-icons/si";
import FolderIcon from "@/components/FolderIcon";
import { HERO_IMAGES } from "@/data/hero";
import { projects, type Project } from "@/data/projects";
import { useMediaQuery } from "@/hooks/useMediaQuery";

type FolderName = "projects" | "posts" | "about";

// 장식 위치 (장식 영역 기준 %)
type DeskItem = { left: string; top: string } & (
  | { kind: "folder"; name: FolderName }
  | { kind: "file"; projectId: string }
  | { kind: "app"; icon: IconType; label: string }
  | { kind: "cursor" }
  | {
      kind: "memoji";
      src: string;
      alt: string;
      sizeClass: string;
      wave?: boolean;
    }
);

// 기술 아이콘 브랜드 색상. Notion/GitHub는 검정 로고라 다크 모드에서도 보이게 글자색 사용
const BRAND_COLORS: Record<string, string> = {
  React: "#61DAFB",
  TypeScript: "#3178C6",
  Spring: "#6DB33F",
  Figma: "#F86E60",
};

// 데스크톱: Hero 위에 겹친 장식 레이어(텍스트에서 top 5rem 띄움, 높이 43.5rem) 기준 좌표.
// 768px 폭(가장 좁은 데스크톱)에서 겹치지 않게 계산한 좌표.
// 오른쪽(텍스트 아래)은 wave Memoji 자리
const DESK_ITEMS: DeskItem[] = [
  {
    kind: "memoji",
    src: HERO_IMAGES.memojiWave,
    alt: "Hyeyoon waving",
    sizeClass: "h-60 w-60",
    wave: true,
    left: "calc(100% - 15rem)",
    top: "19%",
  },
  { kind: "folder", name: "projects", left: "1%", top: "34%" },
  { kind: "file", projectId: "sofit", left: "17%", top: "27%" },
  { kind: "folder", name: "posts", left: "33%", top: "34%" },
  {
    kind: "app",
    icon: SiTypescript,
    label: "TypeScript",
    left: "50%",
    top: "30%",
  },
  { kind: "app", icon: SiGithub, label: "GitHub", left: "62%", top: "43%" },
  { kind: "folder", name: "about", left: "47%", top: "47%" },
  { kind: "cursor", left: "56%", top: "56%" },
  { kind: "app", icon: SiReact, label: "React", left: "5%", top: "52%" },
  { kind: "file", projectId: "devine", left: "28%", top: "52%" },
  { kind: "file", projectId: "withgahyo", left: "11%", top: "64%" },
  { kind: "file", projectId: "scope", left: "34%", top: "67%" },
  { kind: "file", projectId: "speako", left: "55%", top: "60%" },
  { kind: "app", icon: SiSpring, label: "Spring", left: "71%", top: "58%" },
  { kind: "app", icon: SiFigma, label: "Figma", left: "87%", top: "62%" },
  { kind: "app", icon: SiNotion, label: "Notion", left: "78%", top: "72%" },
];

// 모바일(<768px): 텍스트 아래 별도 영역(26rem, wave Memoji와 위쪽 4rem 겹침)에 같은 바탕화면 느낌으로 흩어 배치.
// 크기는 데스크톱과 같게 두고 360px 폭에서 겹치지 않게 계산한 좌표
const MOBILE_DESK_ITEMS: DeskItem[] = [
  { kind: "folder", name: "projects", left: "10%", top: "-7%" },
  { kind: "file", projectId: "sofit", left: "33%", top: "11%" },
  { kind: "folder", name: "posts", left: "62%", top: "18%" },
  { kind: "file", projectId: "devine", left: "3%", top: "33%" },
  { kind: "folder", name: "about", left: "74%", top: "38%" },
  { kind: "file", projectId: "withgahyo", left: "40%", top: "56%" },
  { kind: "cursor", left: "88%", top: "52%" },
  { kind: "file", projectId: "scope", left: "6%", top: "60%" },
  { kind: "file", projectId: "speako", left: "68%", top: "64%" },
];

// wave Memoji: 제자리에서 위아래로 한 번 흔들림
const WAVE_KEYFRAMES = [0, -10, 0, -5, 0];
const WAVE_TRANSITION: Transition = {
  delay: 0.3,
  duration: 1,
  times: [0, 0.3, 0.55, 0.8, 1],
  ease: "easeInOut",
};

const PROJECT_BY_ID = new Map(projects.map((project) => [project.id, project]));

// 폴더별 색상 (뒤쪽 탭 / 앞면 불투명도)
const FOLDER_COLORS: Record<
  FolderName,
  { fill: string; back: number; front: number }
> = {
  projects: { fill: "var(--color-primary)", back: 0.4, front: 0.65 },
  posts: { fill: "var(--about-green)", back: 0.7, front: 1 },
  about: { fill: "var(--about-yellow)", back: 0.6, front: 0.9 },
};

function DeskFolderIcon({ name }: { name: FolderName }) {
  return <FolderIcon {...FOLDER_COLORS[name]} />;
}

function CursorIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
      <path
        d="M5 3l14 8.5-6.2 1.3L10 19z"
        fill="var(--color-text)"
        stroke="var(--color-bg)"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AppIcon({ icon: Icon, label }: { icon: IconType; label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="flex h-13 w-13 items-center justify-center rounded-2xl border border-(--color-card-border) bg-(--color-card-bg) text-(--color-text) shadow-sm"
    >
      <Icon size={24} color={BRAND_COLORS[label]} />
    </div>
  );
}

function Caption({ children }: { children: ReactNode }) {
  return (
    <span className="mt-1 text-xs text-(--color-text-subtle)">{children}</span>
  );
}

// 폰 스크린샷(imageType: "mobile")은 휴대폰 비율, 나머지는 가로 썸네일
function FileThumb({ project }: { project?: Project }) {
  if (!project?.image) return null;
  const isMobile = project.imageType === "mobile";

  return (
    <div className="flex w-24 flex-col items-center">
      <img
        src={project.image}
        alt=""
        draggable={false}
        // 가로 이미지는 스크린샷 자체에 창 모양/그림자가 있어 테두리 박스 없이 그대로 표시
        className={
          isMobile
            ? "aspect-[9/19.5] h-28 rounded-lg border border-(--color-card-border) object-cover shadow-sm"
            : "h-16 w-24 object-contain"
        }
      />
      <Caption>{project.image.split("/").pop()}</Caption>
    </div>
  );
}

function useFolderAction(onOpenProjects: () => void) {
  const navigate = useNavigate();
  return (name: FolderName) => {
    if (name === "projects") onOpenProjects();
    else navigate(`/${name}`);
  };
}

// direct: 바로 드래그(마우스) / longPress: 길게 눌러야 드래그(터치, 짧게 쓸면 스크롤) / none: 드래그 없음
type DragMode = "direct" | "longPress" | "none";

const LONG_PRESS_MS = 300;
// 길게 누르는 동안 이만큼 이상 움직이면 스크롤로 보고 취소
const LONG_PRESS_MOVE_TOLERANCE = 8;
// 폴더는 누른 위치에서 이 거리 이하로 움직였을 때만 클릭(링크 이동)으로 처리
const CLICK_MOVE_TOLERANCE = 5;

// 첫 방문 힌트: 로드 1.5초 후 sofit 파일을 x축으로 12px 살짝 움직였다 되돌림 (1회)
const HINT_PROJECT_ID = "sofit";
const HINT_DELAY_MS = 1500;

interface DeskItemNodeProps {
  item: DeskItem;
  index: number;
  containerRef: RefObject<HTMLDivElement | null>;
  dragMode: DragMode;
  openFolder: (name: FolderName) => void;
  // Hero 안 어느 요소든 드래그를 시작했으면 true (힌트 애니메이션 생략용)
  userDraggedRef: RefObject<boolean>;
}

function DeskItemNode({
  item,
  index,
  containerRef,
  dragMode,
  openFolder,
  userDraggedRef,
}: DeskItemNodeProps) {
  const reduceMotion = useReducedMotion();
  const dragControls = useDragControls();
  const x = useMotionValue(0);
  const scale = useMotionValue(1);
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const pressTimerRef = useRef<number | null>(null);
  const pressStartRef = useRef({ x: 0, y: 0 });
  // 길게 눌러 드래그 모드에 들어갔는지 (놓았을 때 폴더가 열리지 않게)
  const longPressTriggeredRef = useRef(false);
  const longPressActiveRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const isMovable =
    item.kind === "folder" || item.kind === "file" || item.kind === "memoji";
  const canDrag = dragMode !== "none" && isMovable;
  const useLongPress = canDrag && dragMode === "longPress";
  const isWave = item.kind === "memoji" && item.wave;
  const isHintTarget =
    item.kind === "file" && item.projectId === HINT_PROJECT_ID;

  const clearPressTimer = () => {
    if (pressTimerRef.current !== null) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const handleDragStart = () => {
    userDraggedRef.current = true;
    setIsDragging(true);
    if (dragMode === "direct") document.body.style.cursor = "grabbing";
  };

  // 터치에서 누르는 동안 살짝 커지는 반응. whileTap은 길게 눌러 드래그를 직접 시작하면
  // 손을 뗀 뒤에도 풀리지 않아 직접 관리
  const setPressed = (pressed: boolean) => {
    if (!canDrag || reduceMotion) return;
    animate(scale, pressed ? 1.05 : 1, { duration: 0.15 });
  };

  const handleDragEnd = () => {
    longPressActiveRef.current = false;
    setPressed(false);
    setIsDragging(false);
    document.body.style.cursor = "";
  };

  // 길게 눌러 드래그 중일 때만 페이지 스크롤을 막음 (passive: false여야 preventDefault 가능)
  useEffect(() => {
    const node = nodeRef.current;
    if (!node || !useLongPress) return;

    const preventScroll = (event: TouchEvent) => {
      if (longPressActiveRef.current) event.preventDefault();
    };
    node.addEventListener("touchmove", preventScroll, { passive: false });
    return () => node.removeEventListener("touchmove", preventScroll);
  }, [useLongPress]);

  // 드래그할 수 있다는 힌트. 그 전에 드래그를 시작했거나 움직임 줄이기 설정이면 생략
  useEffect(() => {
    if (!isHintTarget || !canDrag || reduceMotion) return;

    let controls: ReturnType<typeof animate> | undefined;
    const timer = window.setTimeout(() => {
      if (userDraggedRef.current) return;
      controls = animate(x, [0, 12, 0], { duration: 0.7, ease: "easeInOut" });
    }, HINT_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
      controls?.stop();
    };
  }, [isHintTarget, canDrag, reduceMotion, userDraggedRef, x]);

  useEffect(() => clearPressTimer, []);

  return (
    <motion.div
      ref={nodeRef}
      className={[
        "absolute",
        item.kind === "cursor" ? "" : "pointer-events-auto",
        canDrag
          ? // hover: 변형은 Tailwind v4에서 (hover: hover) 환경에만 적용
            "cursor-grab select-none transition-[filter] duration-150 hover:drop-shadow-lg active:cursor-grabbing"
          : "",
        // 드래그 중에는 다른 장식 위에 보이게
        isDragging ? "z-50 drop-shadow-xl" : "",
      ].join(" ")}
      style={{
        left: item.left,
        top: item.top,
        x,
        scale,
        // 길게 누를 때 iOS 이미지 미리보기/복사 메뉴가 뜨지 않게
        WebkitTouchCallout: useLongPress ? "none" : undefined,
      }}
      initial={
        reduceMotion
          ? false
          : // wave Memoji는 페이드인 없이 처음부터 보이고 흔들리기만 함
            isWave
            ? { y: 0 }
            : { opacity: 0, y: 16 }
      }
      animate={
        isWave && !reduceMotion
          ? { y: WAVE_KEYFRAMES }
          : { opacity: 1, y: 0 }
      }
      transition={
        isWave
          ? WAVE_TRANSITION
          : { delay: 0.15 + index * 0.05, duration: 0.5, ease: "easeOut" }
      }
      // framer-motion의 hover는 마우스에서만 동작 (터치는 onPointerDown에서 반응)
      whileHover={canDrag ? { scale: 1.05, transition: { duration: 0.15 } } : undefined}
      whileDrag={canDrag ? { scale: 1.08 } : undefined}
      drag={canDrag}
      // longPress 모드에서는 자동 드래그를 끄고(터치 스크롤 유지) 길게 눌렀을 때 직접 시작
      dragListener={!useLongPress}
      dragControls={dragControls}
      dragConstraints={containerRef}
      dragMomentum={false}
      dragElastic={0.1}
      onPointerDown={(event) => {
        pressStartRef.current = { x: event.clientX, y: event.clientY };
        longPressTriggeredRef.current = false;
        if (event.pointerType !== "mouse") setPressed(true);
        if (!useLongPress) return;

        clearPressTimer();
        pressTimerRef.current = window.setTimeout(() => {
          pressTimerRef.current = null;
          longPressTriggeredRef.current = true;
          longPressActiveRef.current = true;
          userDraggedRef.current = true;
          navigator.vibrate?.(10);
          dragControls.start(event, { snapToCursor: false });
        }, LONG_PRESS_MS);
      }}
      onPointerMove={(event) => {
        if (pressTimerRef.current === null) return;
        const dx = event.clientX - pressStartRef.current.x;
        const dy = event.clientY - pressStartRef.current.y;
        if (Math.hypot(dx, dy) > LONG_PRESS_MOVE_TOLERANCE) clearPressTimer();
      }}
      onPointerUp={() => {
        clearPressTimer();
        longPressActiveRef.current = false;
        setPressed(false);
      }}
      onPointerCancel={() => {
        // 터치 스크롤이 시작되면 pointercancel이 와서 눌림 반응도 해제
        clearPressTimer();
        longPressActiveRef.current = false;
        setPressed(false);
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onContextMenu={(event) => {
        // 안드로이드 길게 누르기 메뉴 방지
        if (useLongPress) event.preventDefault();
      }}
    >
      {item.kind === "folder" && (
        <button
          type="button"
          onClick={(event) => {
            // 키보드(Enter/Space)로 누른 경우는 항상 이동
            if (event.detail !== 0) {
              const moved = Math.hypot(
                event.clientX - pressStartRef.current.x,
                event.clientY - pressStartRef.current.y,
              );
              if (moved > CLICK_MOVE_TOLERANCE || longPressTriggeredRef.current)
                return;
            }
            openFolder(item.name);
          }}
          className="flex w-20 flex-col items-center rounded-lg p-1 transition hover:bg-(--color-chip-bg-hover)"
        >
          <DeskFolderIcon name={item.name} />
          <Caption>{item.name}</Caption>
        </button>
      )}
      {item.kind === "file" && (
        <FileThumb project={PROJECT_BY_ID.get(item.projectId)} />
      )}
      {item.kind === "app" && <AppIcon icon={item.icon} label={item.label} />}
      {item.kind === "cursor" && <CursorIcon />}
      {item.kind === "memoji" && (
        <img
          src={item.src}
          alt={item.alt}
          draggable={false}
          fetchPriority="high"
          className={`${item.sizeClass} select-none object-contain`}
        />
      )}
    </motion.div>
  );
}

interface DeskDecorationsProps {
  items: DeskItem[];
  className: string;
  containerRef: RefObject<HTMLDivElement | null>;
  dragMode: DragMode;
  onOpenProjects: () => void;
  userDraggedRef: RefObject<boolean>;
}

function DeskDecorations({
  items,
  className,
  containerRef,
  dragMode,
  onOpenProjects,
  userDraggedRef,
}: DeskDecorationsProps) {
  const openFolder = useFolderAction(onOpenProjects);

  return (
    <div className={className}>
      {items.map((item, index) => (
        <DeskItemNode
          key={index}
          item={item}
          index={index}
          containerRef={containerRef}
          dragMode={dragMode}
          openFolder={openFolder}
          userDraggedRef={userDraggedRef}
        />
      ))}
    </div>
  );
}

// 모바일 wave Memoji: 소셜 버튼 줄 오른쪽 위에 맞춰 둔 h-40 영역 안에 배치
const MOBILE_WAVE_ITEMS: DeskItem[] = [
  {
    kind: "memoji",
    src: HERO_IMAGES.memojiWave,
    alt: "Hyeyoon waving",
    sizeClass: "h-40 w-40",
    wave: true,
    left: "calc(100% - 10rem)",
    top: "0%",
  },
];

export default function HeroSection({
  onOpenProjects,
}: {
  onOpenProjects: () => void;
}) {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  // 태블릿처럼 폭은 넓어도 터치 기기면 길게 눌러 드래그 (화면을 덮은 장식 위에서도 스크롤 가능하게)
  const isCoarsePointer = useMediaQuery("(pointer: coarse)");
  const userDraggedRef = useRef(false);

  return (
    <div ref={heroRef} className="relative md:min-h-[41rem]">
      <div>
        <p
          className="text-md font-medium bg-clip-text text-transparent"
          style={{ backgroundImage: "var(--gradient-hero)" }}
        >
          Thanks for stopping by.
        </p>

        <h1 className="mt-5 text-[clamp(1.25rem,5vw,1.5rem)] font-bold tracking-tight">
          Welcome to HYEYOON’s Portfolio 🥳
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-7 text-(--color-text-muted)">
          This is where I share my projects, learning notes, and thoughts as a
          frontend developer.
        </p>

        <div className="mt-5 flex items-center gap-3">
          <a
            href="https://github.com/hyeyoon23"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-subtle)] transition hover:border-[var(--color-primary-border)] hover:text-[var(--color-text)]"
          >
            <FaGithub size={18} strokeWidth={1.8} />
          </a>

          <a
            href="https://instagram.com/hyeyoon_23"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-subtle)] transition hover:border-[var(--color-primary-border)] hover:text-[var(--color-text)]"
          >
            <FaInstagram size={18} strokeWidth={1.8} />
          </a>
        </div>
      </div>

      <DeskDecorations
        items={DESK_ITEMS}
        className="pointer-events-none absolute inset-x-0 top-10 hidden h-[43.5rem] md:block"
        containerRef={heroRef}
        dragMode={!isDesktop ? "none" : isCoarsePointer ? "longPress" : "direct"}
        onOpenProjects={onOpenProjects}
        userDraggedRef={userDraggedRef}
      />
      {/* 모바일: wave Memoji를 소셜 버튼 줄 오른쪽에 (버튼은 왼쪽 100px만 차지) */}
      <DeskDecorations
        items={MOBILE_WAVE_ITEMS}
        className="pointer-events-none relative -mt-11 h-40 md:hidden"
        containerRef={heroRef}
        dragMode="longPress"
        onOpenProjects={onOpenProjects}
        userDraggedRef={userDraggedRef}
      />
      {/* 모바일은 길게 눌러야 드래그 (짧게 쓸면 페이지 스크롤) */}
      <DeskDecorations
        items={MOBILE_DESK_ITEMS}
        className="pointer-events-none relative -mt-16 h-[26rem] md:hidden"
        containerRef={heroRef}
        dragMode="longPress"
        onOpenProjects={onOpenProjects}
        userDraggedRef={userDraggedRef}
      />
    </div>
  );
}
