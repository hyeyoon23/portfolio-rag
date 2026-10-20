export default function Footer() {
  const year = new Date().getFullYear();

  return (
    // snap-end: 메인 페이지 scroll-snap에서도 맨 아래 푸터까지 내려갈 수 있게
    <footer className="snap-end border-t border-(--color-border) pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-4xl px-4 py-6 text-center text-xs text-(--color-text-subtle) sm:px-8">
        © {year} Hyeyoon Lee. All rights reserved.
      </div>
    </footer>
  );
}
