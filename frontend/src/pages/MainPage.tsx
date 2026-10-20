import { useEffect } from "react";
import BlogHeader from "@/components/BlogHeader";
import Footer from "@/components/Footer";
import HeroSection from "@/components/home/HeroSection";
import ProjectsSection from "@/components/home/ProjectsSection";
import ScrollHint from "@/components/home/ScrollHint";

export default function MainPage() {
  // 프로젝트를 한 화면씩 넘기도록 이 페이지에서만 문서 스크롤에 snap 적용
  useEffect(() => {
    const root = document.documentElement;
    root.style.scrollSnapType = "y proximity";
    return () => {
      root.style.scrollSnapType = "";
    };
  }, []);

  const scrollToProjects = () => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    document
      .getElementById("projects")
      ?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <main className="flex min-h-screen flex-col overflow-x-clip bg-(--color-bg) text-(--color-text) transition-colors">
      <BlogHeader />

      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-8">
        <HeroSection onOpenProjects={scrollToProjects} />
        <ScrollHint onClick={scrollToProjects} />
        <ProjectsSection />
      </div>

      <Footer />
    </main>
  );
}
