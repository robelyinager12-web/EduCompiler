import type { Exercise, SubmissionResult } from "../../types/learning.types";
import Badge from "../common/Badge";
import DifficultyBadge from "../common/DifficultyBadge";

interface Props {
  exercise: Exercise;
  submission: { result: SubmissionResult; source: string } | null;
  currentSource: string;
}

export default function ExercisePanel({ exercise, submission, currentSource }: Props) {
  const result = submission?.result;

  return (
    <div className="max-h-52 shrink-0 space-y-2 overflow-auto border-b border-slate-200 p-3 text-sm dark:border-slate-700">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold">{exercise.title}</span>
        <DifficultyBadge difficulty={exercise.difficulty} />
      </div>

      <details open={!submission}>
        <summary className="cursor-pointer text-slate-500 dark:text-slate-400">Instructions</summary>
        <p className="mt-1 whitespace-pre-wrap">{exercise.instructions}</p>
      </details>

      {result && (
        <div role="status" className="space-y-1">
          <div className="flex items-center gap-2">
            {result.passed === true && <Badge tone="green">Passed</Badge>}
            {result.passed === false && <Badge tone="red">Not yet</Badge>}
            {result.passed === null && <Badge tone="slate">Submitted</Badge>}
          </div>
          <p>{result.feedback}</p>
          {submission && submission.source !== currentSource && (
            <p className="text-xs text-amber-700 dark:text-amber-300">
              You changed the code after submitting. Submit again to check it.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
