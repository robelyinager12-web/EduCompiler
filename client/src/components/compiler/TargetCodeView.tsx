import type { TargetMapping } from "../../types/compiler.types";
import CodeBlock from "../common/CodeBlock";

interface Props {
  text: string;
  note: string;
  mapping: TargetMapping[];
  registersUsed: number;
}

export default function TargetCodeView({ text, note, mapping, registersUsed }: Props) {
  return (
    <div className="space-y-4">
      <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
        {note}
      </p>

      <div>
        <h3 className="mb-1 text-sm font-semibold">Target code ({registersUsed} registers)</h3>
        <CodeBlock code={text} label="Educational target code" />
        <p className="mt-1 text-xs text-slate-500">
          R1, R2... are registers. [a] is a variable in memory. #10 is a constant.
        </p>
      </div>

      {mapping.length > 0 && (
        <div className="overflow-x-auto">
          <h3 className="mb-1 text-sm font-semibold">How each intermediate instruction was translated</h3>
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-2 pr-4">Line</th>
                <th className="py-2 pr-4">Intermediate code</th>
                <th className="py-2">Target code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {mapping.map((m) => (
                <tr key={m.tacIndex}>
                  <td className="py-1.5 pr-4">{m.line}</td>
                  <td className="py-1.5 pr-4 font-mono">{m.tac}</td>
                  <td className="py-1.5 font-mono">{m.target.join("; ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
