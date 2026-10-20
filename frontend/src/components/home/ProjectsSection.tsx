import { useRef, useState, type WheelEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FaGithub } from "react-icons/fa";
import { ChevronDown, ExternalLink } from "lucide-react";
import { projects, type Project } from "@/data/projects";

// 넘기기 판단 기준
const SWIPE_DISTANCE = 40;
const SWIPE_VELOCITY = 300;
const WHEEL_DISTANCE = 40;
// 트랙패드 가로 스크롤 한 번에 여러 장 넘어가지 않게 잠깐 멈춤
const WHEEL_COOLDOWN_MS = 500;

// 여러 장: 가운데 한 장을 크게, 양옆은 작게 겹쳐 보여주고
// 누르기·가로 스와이프·트랙패드 가로 스크롤로 넘김 (세로 스크롤은 페이지 스크롤 그대로)
function ProjectGallery({
  project,
  images,
}: {
  project: Project;
  images: string[];
}) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const isMobile = project.imageType === "mobile";
  // 스와이프 직후 발생하는 click으로 옆 사진이 선택되지 않게
  const pannedRef = useRef(false);
  const wheelRef = useRef({ distance: 0, lockedUntil: 0 });

  const go = (direction: 1 | -1) =>
    setActive((current) => (current + direction + images.length) % images.length);

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    // 세로 스크롤이 더 크면 페이지 스크롤로 둠
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;

    const now = Date.now();
    const wheel = wheelRef.current;
    if (now < wheel.lockedUntil) return;

    wheel.distance += event.deltaX;
    if (Math.abs(wheel.distance) < WHEEL_DISTANCE) return;

    go(wheel.distance > 0 ? 1 : -1);
    wheel.distance = 0;
    wheel.lockedUntil = now + WHEEL_COOLDOWN_MS;
  };

  return (
    <div>
      <motion.div
        // touch-pan-y: 세로 터치 스크롤은 브라우저에 맡기고 가로 스와이프만 처리
        // overscroll-x-contain: 가로 스크롤이 브라우저 뒤로 가기 제스처로 이어지지 않게
        className={`relative w-full touch-pan-y overscroll-x-contain ${
          isMobile
            ? "h-[min(55dvh,26rem)] md:h-[min(65dvh,32rem)]"
            : "aspect-[8/5]"
        }`}
        onPointerDown={() => {
          pannedRef.current = false;
        }}
        onPanStart={() => {
          pannedRef.current = true;
        }}
        onPanEnd={(_, { offset, velocity }) => {
          if (Math.abs(offset.x) < Math.abs(offset.y)) return;
          if (offset.x < -SWIPE_DISTANCE || velocity.x < -SWIPE_VELOCITY) go(1);
          else if (offset.x > SWIPE_DISTANCE || velocity.x > SWIPE_VELOCITY) go(-1);
        }}
        onWheel={handleWheel}
      >
        {images.map((src, index) => {
          // 순환 배치: 가운데 기준 양옆에 한 장씩 오도록 (3장이면 -1, 0, 1)
          let offset = index - active;
          if (offset > images.length / 2) offset -= images.length;
          if (offset < -images.length / 2) offset += images.length;
          if (Math.abs(offset) > 1) return null;
          const isActive = offset === 0;

          return (
            <div
              key={src}
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
              style={{ zIndex: isActive ? 2 : 1 }}
            >
              <motion.button
                type="button"
                disabled={isActive}
                onClick={() => {
                  if (pannedRef.current) return;
                  setActive(index);
                }}
                aria-label={`${project.name} 화면 ${index + 1} 보기`}
                className={`pointer-events-auto h-full ${isMobile ? "" : "w-full"} ${isActive ? "cursor-default" : "cursor-pointer"}`}
                initial={false}
                animate={{
                  // 폰 화면은 폭의 45%, 웹 화면은 12%만큼 옆으로 비켜 겹침
                  x: `${offset * (isMobile ? 45 : 12)}%`,
                  scale: isActive ? 1 : 0.85,
                  opacity: isActive ? 1 : 0.6,
                }}
                transition={
                  reduceMotion ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }
                }
              >
                <img
                  src={src}
                  alt={`${project.name} 화면 ${index + 1}`}
                  draggable={false}
                  // 웹 화면은 캡처 자체에 창 모양/그림자가 있어 테두리 박스 없이 전체를 그대로 표시
                  className={
                    isMobile
                      ? "aspect-[9/19.5] h-full rounded-[2rem] border border-(--color-card-border) object-cover shadow-lg"
                      : "h-full w-full object-contain"
                  }
                />
              </motion.button>
            </div>
          );
        })}
      </motion.div>

      <div className="mt-2 flex justify-center">
        {images.map((src, index) => (
          <button
            key={src}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`${project.name} 화면 ${index + 1} 보기`}
            aria-current={index === active}
            className="flex h-11 w-7 items-center justify-center"
          >
            <span
              className={`h-2 rounded-full transition-all ${
                index === active
                  ? "w-5 bg-(--color-primary)"
                  : "w-2 bg-(--color-chip-border-hover)"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function ProjectImage({ project }: { project: Project }) {
  const [failed, setFailed] = useState(false);

  if (project.images && project.images.length > 1) {
    return <ProjectGallery project={project} images={project.images} />;
  }
  const isMobile = project.imageType === "mobile";

  // 웹: 가로 8:5 박스 / 모바일: 휴대폰 비율(9:19.5)로 가운데 정렬, 화면 높이를 넘지 않게
  const frameClass = isMobile
    ? "mx-auto aspect-[9/19.5] h-[min(65dvh,32rem)] rounded-[2rem]"
    : "aspect-[8/5] w-full rounded-2xl";

  if (!project.image || failed) {
    return (
      <div
        className={`${frameClass} flex items-center justify-center border border-dashed border-(--color-card-border) bg-(--color-card-bg) text-sm text-(--color-text-subtle)`}
      >
        {project.name}
      </div>
    );
  }

  return (
    <img
      src={project.image}
      alt={`${project.name} 화면`}
      onError={() => setFailed(true)}
      // 모바일은 폰 프레임처럼 테두리, 웹 화면은 테두리·배경 없이 이미지 전체를 그대로 표시
      className={`${frameClass} ${
        isMobile
          ? "border border-(--color-card-border) object-cover shadow-lg"
          : "object-contain"
      }`}
    />
  );
}

function StackChips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((tech) => (
        <span
          key={tech}
          className="rounded-full border border-(--color-chip-border) bg-(--color-chip-bg) px-3 py-1 text-xs text-(--color-chip-text)"
        >
          {tech}
        </span>
      ))}
    </div>
  );
}

// 기술 스택: 한 줄 목록이면 칩만, 그룹이면 그룹 이름 + 칩
function StackList({ stack }: { stack: Project["stack"] }) {
  if (stack.length === 0) return null;

  if (typeof stack[0] === "string") {
    return (
      <div className="mt-5">
        <StackChips items={stack as string[]} />
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-3">
      {(stack as { group: string; items: string[] }[]).map(({ group, items }) => (
        <div key={group}>
          <p className="mb-1.5 text-xs font-medium text-(--color-text-subtle)">
            {group}
          </p>
          <StackChips items={items} />
        </div>
      ))}
    </div>
  );
}

const linkClass =
  "inline-flex min-h-11 items-center gap-2 rounded-full border border-(--color-border) bg-(--color-surface) px-4 text-sm text-(--color-text-subtle) transition hover:border-(--color-primary-border) hover:text-(--color-text)";

function ProjectSlide({ project }: { project: Project }) {
  const reduceMotion = useReducedMotion();
  const { github, demo } = project.links;

  return (
    <article className="flex min-h-dvh snap-start items-center py-16">
      <motion.div
        className="grid w-full items-center gap-8 md:grid-cols-2 md:gap-12"
        initial={reduceMotion ? false : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div>
          <p className="text-sm font-medium text-(--color-primary)">
            {project.number}
          </p>
          <h3 className="mt-2 text-[clamp(1.5rem,4vw,2rem)] font-bold tracking-tight">
            {project.name}
          </h3>
          {project.period && (
            <p className="mt-1 text-xs text-(--color-text-subtle)">
              {project.period}
            </p>
          )}
          <p className="mt-3 text-sm leading-7 text-(--color-text-muted)">
            {project.summary}
          </p>
          {project.description && (
            <p className="text-sm leading-6 text-(--color-text-subtle)">
              {project.description}
            </p>
          )}

          <p className="mt-5 text-xs font-medium text-(--color-text-subtle)">
            Role
          </p>
          {Array.isArray(project.role) ? (
            <ul className="mt-1 space-y-1 text-sm leading-6">
              {project.role.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-(--color-text-subtle)">-</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm leading-6">{project.role}</p>
          )}

          {project.highlights.length > 0 && (
            <ul className="mt-5 space-y-1.5 text-sm leading-6">
              {project.highlights.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-(--color-primary)">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}

          {project.features && project.features.length > 0 && (
            // 내용이 길어 기본은 접어 두고 눌러서 펼침
            <details className="group mt-5">
              <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1 text-sm font-medium text-(--color-text-subtle) transition hover:text-(--color-text) [&::-webkit-details-marker]:hidden">
                주요 기능 구현
                <ChevronDown
                  size={16}
                  className="transition-transform group-open:rotate-180"
                />
              </summary>
              <ul className="mt-2 space-y-2 text-sm leading-6 text-(--color-text-muted)">
                {project.features.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-(--color-text-subtle)">-</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}

          <StackList stack={project.stack} />

          {(github || demo) && (
            <div className="mt-6 flex flex-wrap gap-3">
              {github && (
                <a
                  href={github}
                  target="_blank"
                  rel="noreferrer"
                  className={linkClass}
                >
                  <FaGithub size={16} />
                  GitHub
                </a>
              )}
              {demo && (
                <a
                  href={demo}
                  target="_blank"
                  rel="noreferrer"
                  className={linkClass}
                >
                  <ExternalLink size={16} />
                  Demo
                </a>
              )}
            </div>
          )}
        </div>

        <ProjectImage project={project} />
      </motion.div>
    </article>
  );
}

export default function ProjectsSection() {
  return (
    <section id="projects" className="scroll-mt-8 pt-16">
      <div className="flex snap-start scroll-mt-8 items-center gap-3">
        <div className="h-8 w-1 rounded-full bg-(--color-primary)" />
        <h2 className="text-[clamp(1.25rem,5vw,1.5rem)] font-bold tracking-tight">
          Projects
        </h2>
      </div>

      {projects.map((project) => (
        <ProjectSlide key={project.id} project={project} />
      ))}
    </section>
  );
}
