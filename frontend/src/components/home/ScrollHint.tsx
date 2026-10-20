import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";

// Hero 아래 "아래로 내려보세요" 유도 화살표. 누르면 Projects로 이동
export default function ScrollHint({ onClick }: { onClick: () => void }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="mt-6 flex justify-center">
      <motion.button
        type="button"
        onClick={onClick}
        aria-label="프로젝트 보러 아래로 이동"
        className="flex min-h-11 min-w-11 flex-col items-center gap-1 rounded-full px-3 py-2 text-xs text-(--color-text-subtle) transition-colors hover:text-(--color-text)"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <span>Scroll</span>
        <motion.span
          className="flex"
          // 위아래로 천천히 반복해서 움직임 (움직임 줄이기 설정이면 정지)
          animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={20} strokeWidth={1.8} />
        </motion.span>
      </motion.button>
    </div>
  );
}
