import BlogHeader from "@/components/BlogHeader";
import Footer from "@/components/Footer";

interface CakeLayer {
  title: string;
  // 위층일수록 좁게: 데스크톱 최대 폭과 좁은 화면에서의 비율 중 작은 값
  width: string;
  color: string;
  gridClass: string;
  items: { label: string; href?: string }[];
}

const CAKE_LAYERS: CakeLayer[] = [
  {
    title: "name",
    width: "min(8rem, 40%)",
    color: "var(--about-blue)",
    gridClass: "grid-cols-1",
    items: [{ label: "이혜윤" }],
  },
  {
    title: "birth",
    width: "min(12rem, 55%)",
    color: "var(--about-yellow)",
    gridClass: "grid-cols-1",
    items: [{ label: "2003" }],
  },
  {
    title: "tech stack",
    width: "min(24rem, 80%)",
    color: "var(--about-peach)",
    // 좁은 화면에서는 2x2로 줄바꿈
    gridClass: "grid-cols-2 sm:grid-cols-4",
    items: [
      { label: "React" },
      { label: "TypeScript" },
      { label: "Spring Boot" },
      { label: "MySQL" },
    ],
  },
  {
    title: "favorite",
    width: "min(27rem, 90%)",
    color: "var(--about-red)",
    gridClass: "grid-cols-5",
    items: [
      { label: "여행" },
      { label: "야구" },
      { label: "과일" },
      { label: "러닝" },
      { label: "음악" },
    ],
  },
  {
    title: "more info",
    width: "100%",
    color: "var(--about-green-soft)",
    gridClass: "grid-cols-2",
    items: [
      { label: "Instagram", href: "https://instagram.com/hyeyoon_23" },
      { label: "Github", href: "https://github.com/hyeyoon23" },
    ],
  },
];

export default function AboutPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
      <BlogHeader />

      <section className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center px-4 py-15">
        {/* 상단 이모지 */}
        <div className="mb-10 text-3xl">🕯️</div>

        <div className="flex w-full flex-col items-center gap-3">
          {CAKE_LAYERS.map((layer) => (
            <div
              key={layer.title}
              className="about-card"
              style={{ width: layer.width }}
            >
              <div className="about-title">{layer.title}</div>

              {/* gap-px + 검은 배경으로 칸 사이 구분선 표시 */}
              <div className={`grid gap-px bg-black ${layer.gridClass}`}>
                {layer.items.map((item) =>
                  item.href ? (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="about-content flex min-h-11 cursor-pointer items-center justify-center transition hover:opacity-80"
                      style={{ background: layer.color }}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <div
                      key={item.label}
                      className="about-content flex items-center justify-center"
                      style={{ background: layer.color }}
                    >
                      {item.label}
                    </div>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
