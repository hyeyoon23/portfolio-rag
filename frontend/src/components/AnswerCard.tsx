type AnswerCardProps = {
  data: string;
};

export default function AnswerCard({ data }: AnswerCardProps) {
  if (!data) return null;

  return (
    <div className="answer-text whitespace-pre-wrap text-sm leading-7">
      {data}
    </div>
  );
}
