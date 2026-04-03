interface ExampleQuestionsProps {
  onSelect: (question: string) => void;
}

const EXAMPLE_QUESTIONS = [
  "Devine 프로젝트에서 어떤 역할을 했어?",
  "청년돋움 프로젝트에서 구현한 기능은 뭐야?",
  "Wego 프로젝트의 주요 성과를 알려줘.",
  "프론트엔드 개발자로서 어떤 강점이 있어?",
];

export default function ExampleQuestions({ onSelect }: ExampleQuestionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {EXAMPLE_QUESTIONS.map((question) => (
        <button
          key={question}
          type="button"
          onClick={() => onSelect(question)}
          className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-700"
        >
          {question}
        </button>
      ))}
    </div>
  );
}
