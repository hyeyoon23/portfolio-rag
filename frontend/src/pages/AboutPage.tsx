import BlogHeader from "@/components/BlogHeader";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <BlogHeader />

      <section className="mx-auto flex max-w-lg flex-col items-center px-4 py-8">
        {/* 상단 이모지 */}
        <div className="mb-10 text-3xl">🕯️</div>

        <div className="flex w-full flex-col items-center gap-3">
          {/* 이름 */}
          <div className="about-card w-32">
            <div className="about-title">이름은...</div>
            <div className="about-content bg-[var(--about-blue)]">이혜윤</div>
          </div>

          {/* 나이 */}
          <div className="about-card w-44">
            <div className="about-title">나이는...</div>
            <div className="about-content bg-[var(--about-yellow)]">22~24</div>
          </div>

          {/* 직업 */}
          <div className="about-card w-65">
            <div className="about-title">하는 일은...</div>
            <div className="about-content bg-[var(--about-purple)]">
              프론트엔드 개발자 지망생
            </div>
          </div>

          {/* 좋아하는 것 */}
          <div className="about-card w-90">
            <div className="about-title">좋아하는 것은...</div>

            <div className="grid grid-cols-4">
              {["집", "야구", "토마토", "러닝"].map((item) => (
                <div
                  key={item}
                  className="about-content border-r last:border-r-0 bg-[var(--about-red)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* 링크 */}
          <div className="about-card w-full">
            <div className="about-title">혹시 더 궁금하다면...</div>

            <div className="grid grid-cols-2">
              <a
                href="https://instagram.com/hyeyoon_23"
                target="_blank"
                rel="noreferrer"
                className="about-content border-r bg-[var(--about-green-soft)] cursor-pointer transition hover:opacity-80"
              >
                Instagram
              </a>

              <a
                href="https://github.com/hyeyoon23"
                target="_blank"
                rel="noreferrer"
                className="about-content bg-[var(--about-green-soft)] cursor-pointer transition hover:opacity-80"
              >
                Github
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
