import type { OptimizationStep, OptimizationStats } from "../../types/compiler.types";
import Badge from "../common/Badge";
import CodeBlock from "../common/CodeBlock";

interface Props {
  before: string;
  after: string;
  steps: OptimizationStep[];
  stats: OptimizationStats;
}

const labels: Record<OptimizationStep["kind"], string> = {
  "constant-propagation": "Propagation",
  "constant-folding": "Folding",
  "dead-code-elimination": "Dead code",
};

export default function OptimizationView({ before, after, steps, stats }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm">
        {stats.instructionsBefore} instructions became {stats.instructionsAfter}:{" "}
        {stats.propagations} propagations, {stats.foldings} foldings, {stats.eliminations} removals.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <h3 className="mb-1 text-sm font-semibold">Before</h3>
          <CodeBlock code={before} label="Code before optimization" />
        </div>
        <div>
          <h3 className="mb-1 text-sm font-semibold">After</h3>
          <CodeBlock code={after} label="Code after optimization" />
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">What changed, and why</h3>
        {steps.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nothing could be optimized safely in this program.
          </p>
        ) : (
          <ul className="space-y-3 text-sm">
            {steps.map((step, i) => (
              <li key={i} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <div className="mb-1 flex items-center gap-2">
                  <Badge tone="blue">{labels[step.kind]}</Badge>
                  <span className="text-xs text-slate-500">line {step.line}</span>
                </div>
                <p className="font-mono text-xs">
                  {step.before} {step.after === null ? "(removed)" : `→ ${step.after}`}
                </p>
                <p className="mt-1 text-slate-600 dark:text-slate-300">{step.explanation}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
