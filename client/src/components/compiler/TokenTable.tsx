import type { Token } from "../../types/compiler.types";

const MAX_ROWS = 500;

export default function TokenTable({ tokens }: { tokens: Token[] }) {
  const shown = tokens.slice(0, MAX_ROWS);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-slate-500 dark:text-slate-400">
            <tr>
              <th className="py-2 pr-4">Lexeme</th>
              <th className="py-2 pr-4">Token type</th>
              <th className="py-2 pr-4">Line</th>
              <th className="py-2">Col</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {shown.map((t, i) => (
              <tr key={i}>
                <td className="py-1.5 pr-4 font-mono">{t.type === "EOF" ? "(end)" : t.lexeme}</td>
                <td className="py-1.5 pr-4 font-mono text-xs">{t.type}</td>
                <td className="py-1.5 pr-4">{t.line}</td>
                <td className="py-1.5">{t.column}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {tokens.length > MAX_ROWS && (
        <p className="mt-2 text-xs text-slate-500">
          Showing the first {MAX_ROWS} of {tokens.length} tokens.
        </p>
      )}
    </div>
  );
}
