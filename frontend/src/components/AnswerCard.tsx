type AnswerCardProps = {
  data: string;
};

export default function AnswerCard({ data }: AnswerCardProps) {
  if (!data) return null;

  return (
    <div className="whitespace-pre-wrap text-sm leading-7 text-slate-200">
      {data}
    </div>
  );
}
