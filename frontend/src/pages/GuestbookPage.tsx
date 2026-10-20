import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2, Pin } from "lucide-react";
import BlogHeader from "@/components/BlogHeader";
import Footer from "@/components/Footer";
import { useTheme } from "@/providers/ThemeProvider";
import {
  GUESTBOOK_MESSAGE_MAX,
  GUESTBOOK_NAME_MAX,
  GUESTBOOK_PAGE_SIZE,
  createGuestbookEntry,
  fetchGuestbook,
  isGuestbookAvailable,
  type GuestbookEntry,
} from "@/api/guestbook";

// 같은 브라우저에서 연달아 남기지 않게 (DB 쪽 도배 방지와 별도로 가볍게)
const COOLDOWN_MS = 30_000;
const COOLDOWN_KEY = "guestbook:lastSubmittedAt";

function readLastSubmittedAt() {
  try {
    return Number(localStorage.getItem(COOLDOWN_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveLastSubmittedAt() {
  try {
    localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
  } catch {
    // 저장소를 못 쓰는 환경이면 쿨다운만 생략
  }
}

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// ---- 포스트잇 색상 (이 페이지 전용. 전역 토큰에는 넣지 않음) ----
// 다크 모드에서는 채도를 조금 낮춘 색. 글자색은 두 모드 모두 어두운 색으로 고정 (대비 9:1 이상)
const NOTE_COLORS = [
  { light: "#FFF3B0", dark: "#E6DCA0" }, // 노랑
  { light: "#FFD6E0", dark: "#E3C2CB" }, // 분홍
  { light: "#CFE8FF", dark: "#BAD0E4" }, // 하늘
  { light: "#D9F2C9", dark: "#C3D9B5" }, // 연두
  { light: "#E3D9FF", dark: "#CCC4E3" }, // 연보라
];
const NOTE_TEXT = "#2B2B33";
// 날짜·글자 수·placeholder 등 보조 글씨 (모든 파스텔 배경 위 대비 4.5:1 이상)
const NOTE_SUBTLE = "#4A4A54";

// id를 고르게 섞는 해시 (murmur3 fmix32). 연속된 id도 서로 무관한 값이 나옴
function mixHash(n: number) {
  let h = (n ^ 0x9e3779b9) >>> 0;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

// id별 색 순번 캐시. 무작위로 고르되 바로 앞 id(=목록에서 바로 옆 쪽지)와는 다른 색
const colorIndexCache: number[] = [];

function colorIndexOf(id: number) {
  for (let i = colorIndexCache.length; i <= id; i++) {
    const hash = mixHash(i);
    colorIndexCache[i] =
      i === 0
        ? hash % NOTE_COLORS.length
        : (colorIndexCache[i - 1] + 1 + (hash % (NOTE_COLORS.length - 1))) %
          NOTE_COLORS.length;
  }
  return colorIndexCache[id];
}

// 글 id로 색과 기울기를 정해 새로고침해도 같은 모양 유지
function noteStyleOf(id: number) {
  return {
    color: NOTE_COLORS[colorIndexOf(id)],
    // -3.0 ~ 3.0deg
    tilt: ((mixHash(id) >>> 8) % 61) / 10 - 3,
  };
}

// 포스트잇 위쪽 가운데 반투명 테이프
function Tape({ isDark }: { isDark: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 -rotate-2 rounded-xs"
      style={{
        background: isDark ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.6)",
        // 라이트 모드 밝은 배경에서도 테이프 윤곽이 보이게 옅은 테두리
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
      }}
    />
  );
}

function GuestbookForm({ onCreated }: { onCreated: () => Promise<void> }) {
  const { isDark } = useTheme();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  // 봇이 채우는 숨은 칸. 값이 있으면 조용히 무시
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    !submitting && name.trim().length > 0 && message.trim().length > 0;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    if (website) {
      setName("");
      setMessage("");
      return;
    }

    const waitMs = readLastSubmittedAt() + COOLDOWN_MS - Date.now();
    if (waitMs > 0) {
      setError(
        `조금만 기다렸다가 다시 남겨 주세요. (${Math.ceil(waitMs / 1000)}초)`,
      );
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await createGuestbookEntry(name, message);
      saveLastSubmittedAt();
      setMessage("");
      setName("");
      await onCreated();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "방명록을 남기지 못했어요.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const noteColor = NOTE_COLORS[0];

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md">
      {/* 빈 포스트잇 한 장 */}
      <div
        className="relative -rotate-[1.5deg] rounded-sm px-5 pt-8 pb-4 shadow-md sm:px-6"
        style={{
          background: isDark ? noteColor.dark : noteColor.light,
          color: NOTE_TEXT,
        }}
      >
        <Tape isDark={isDark} />

        <label htmlFor="guestbook-message" className="sr-only">
          메시지
        </label>
        <textarea
          id="guestbook-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={GUESTBOOK_MESSAGE_MAX}
          rows={5}
          placeholder="다녀간 흔적을 남겨 주세요."
          className="block w-full resize-none rounded-md bg-transparent text-base leading-8 outline-none placeholder:text-[#4A4A54]"
        />

        <p className="mt-1 text-right text-xs" style={{ color: NOTE_SUBTLE }}>
          {message.length}/{GUESTBOOK_MESSAGE_MAX}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <label
            htmlFor="guestbook-name"
            className="flex min-w-0 flex-1 items-baseline gap-2"
          >
            <span
              className="shrink-0 text-sm italic"
              style={{ color: NOTE_SUBTLE }}
            >
              from.
            </span>
            <input
              id="guestbook-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={GUESTBOOK_NAME_MAX}
              placeholder="이름 또는 닉네임"
              autoComplete="nickname"
              aria-label="이름"
              className="min-w-0 flex-1 border-b border-dashed border-[#2B2B33]/40 bg-transparent py-1 text-base outline-none placeholder:text-[#4A4A54] focus-visible:border-solid focus-visible:border-[#2B2B33]"
            />
          </label>

          <button
            type="submit"
            disabled={!canSubmit}
            aria-label="쪽지 붙이기"
            title="붙이기"
            className="ml-auto inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#2B2B33] transition enabled:hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B2B33] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Pin size={18} strokeWidth={1.8} />
            )}
          </button>
        </div>

        {/* 스팸 봇용 숨은 칸 (사람에게는 보이지 않음) */}
        <input
          type="text"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 text-center text-xs text-(--color-danger-text)"
        >
          {error}
        </p>
      )}
    </form>
  );
}

interface NoteCardProps {
  entry: GuestbookEntry;
  // 방금 작성한 쪽지면 "툭" 붙는 애니메이션
  dropIn: boolean;
  // 목록 로드 시 순서대로 페이드인할 순번
  staggerIndex: number;
}

function NoteCard({ entry, dropIn, staggerIndex }: NoteCardProps) {
  const { isDark } = useTheme();
  const reduceMotion = useReducedMotion();
  const { color, tilt } = noteStyleOf(entry.id);

  return (
    <motion.li
      layout={!reduceMotion}
      initial={
        reduceMotion
          ? false
          : dropIn
            ? { opacity: 0, y: -40, scale: 1.04 }
            : { opacity: 0, y: 8 }
      }
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={
        dropIn
          ? { type: "spring", stiffness: 420, damping: 22 }
          : { duration: 0.3, delay: staggerIndex * 0.04, ease: "easeOut" }
      }
    >
      <article
        // 기울기는 CSS rotate로 두고 hover 때 0으로 (Tailwind v4 hover는 마우스 환경에서만 적용)
        className="relative h-full rotate-(--tilt) rounded-sm px-5 pt-7 pb-4 shadow-md transition-[rotate,translate,box-shadow] duration-200 hover:-translate-y-1 hover:rotate-0 hover:shadow-xl"
        style={
          {
            "--tilt": `${tilt}deg`,
            background: isDark ? color.dark : color.light,
            color: NOTE_TEXT,
          } as CSSProperties
        }
      >
        <Tape isDark={isDark} />
        {/* 사용자 입력은 텍스트로만 렌더링 */}
        <p className="text-base leading-7 whitespace-pre-wrap wrap-anywhere">
          {entry.message}
        </p>
        <footer className="mt-4 flex items-end justify-between gap-3">
          <span className="min-w-0 text-sm font-medium wrap-anywhere">
            - {entry.name}
          </span>
          <time
            dateTime={entry.created_at}
            className="shrink-0 text-xs"
            style={{ color: NOTE_SUBTLE }}
          >
            {dateFormatter.format(new Date(entry.created_at))}
          </time>
        </footer>
      </article>
    </motion.li>
  );
}

export default function GuestbookPage() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(isGuestbookAvailable);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 방금 작성해서 새로 붙은 쪽지 id
  const [droppedIds, setDroppedIds] = useState<Set<number>>(new Set());
  // "더 보기"로 붙은 묶음의 시작 위치 (그 묶음 안에서 stagger)
  const batchStartRef = useRef(0);

  const loadFirstPage = async () => {
    try {
      const data = await fetchGuestbook();
      setEntries(data);
      setHasMore(data.length === GUESTBOOK_PAGE_SIZE);
      setError(null);
      return data;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "방명록을 불러오지 못했어요.",
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 작성 후 첫 페이지를 다시 불러오고, 새로 생긴 쪽지만 "툭" 애니메이션
  const handleCreated = async () => {
    const knownIds = new Set(entries.map((entry) => entry.id));
    batchStartRef.current = 0;
    const data = await loadFirstPage();
    if (data) {
      setDroppedIds(
        new Set(
          data.filter((entry) => !knownIds.has(entry.id)).map((e) => e.id),
        ),
      );
    }
  };

  const loadMore = async () => {
    const last = entries.at(-1);
    if (!last) return;
    setLoadingMore(true);
    try {
      const data = await fetchGuestbook(last.id);
      batchStartRef.current = entries.length;
      setEntries((prev) => [...prev, ...data]);
      setHasMore(data.length === GUESTBOOK_PAGE_SIZE);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "방명록을 불러오지 못했어요.",
      );
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!isGuestbookAvailable) return;
    void loadFirstPage();
  }, []);

  return (
    <main className="flex min-h-screen flex-col bg-(--color-bg) text-(--color-text) transition-colors">
      <BlogHeader />

      <section className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-8">
        <div className="mb-10 flex flex-col items-center text-center">
          <p className="mt-2 text-sm text-(--color-text-muted)">
            방문해 주셔서 감사해요. 편하게 쪽지를 남겨 주세요 ✎
          </p>
        </div>

        {!isGuestbookAvailable ? (
          <p className="rounded-2xl border border-dashed border-(--color-card-border) p-5 text-center text-sm text-(--color-text-subtle)">
            지금은 방명록을 사용할 수 없어요.
          </p>
        ) : (
          <>
            <GuestbookForm onCreated={handleCreated} />

            <div className="mt-14">
              {loading ? (
                <div className="flex justify-center py-10 text-(--color-text-subtle)">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : error && entries.length === 0 ? (
                <p className="py-10 text-center text-sm text-(--color-text-subtle)">
                  {error}
                </p>
              ) : entries.length === 0 ? (
                <p className="py-10 text-center text-sm text-(--color-text-subtle)">
                  아직 남겨진 쪽지가 없어요. 첫 쪽지를 붙여 주세요!
                </p>
              ) : (
                // 모바일 1열, 640px 이상 2열, 1024px 이상 3열. 테이프가 잘리지 않게 위 여백
                <ul className="grid grid-cols-1 items-start gap-5 pt-3 sm:grid-cols-2 lg:grid-cols-3">
                  {entries.map((entry, index) => (
                    <NoteCard
                      key={entry.id}
                      entry={entry}
                      dropIn={droppedIds.has(entry.id)}
                      staggerIndex={Math.max(0, index - batchStartRef.current)}
                    />
                  ))}
                </ul>
              )}

              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-(--color-border) bg-(--color-surface) px-5 text-sm text-(--color-text-subtle) transition hover:border-(--color-primary-border) hover:text-(--color-text) disabled:cursor-not-allowed"
                  >
                    {loadingMore && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    더 보기
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      <Footer />
    </main>
  );
}
