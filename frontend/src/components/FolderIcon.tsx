interface FolderIconProps {
  fill: string;
  // 뒤쪽 탭 / 앞면 불투명도
  back: number;
  front: number;
  className?: string;
}

// 메인 Hero 바탕화면과 방명록에서 함께 쓰는 폴더 아이콘
export default function FolderIcon({
  fill,
  back,
  front,
  className = "h-12 w-14",
}: FolderIconProps) {
  return (
    <svg viewBox="0 0 64 52" aria-hidden="true" className={className}>
      <path
        d="M4 8a4 4 0 0 1 4-4h14l6 6h28a4 4 0 0 1 4 4v30a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"
        fill={fill}
        fillOpacity={back}
      />
      <path
        d="M4 18a4 4 0 0 1 4-4h48a4 4 0 0 1 4 4v26a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"
        fill={fill}
        fillOpacity={front}
      />
    </svg>
  );
}
