import type { SymbolEntry } from "../../types/compiler.types";

function showValue(value: SymbolEntry["value"]): string {
  if (value === null) return "—";
  return typeof value === "string" ? JSON.stringify(value) : String(value);
}

export default function SymbolTableView({ symbols }: { symbols: SymbolEntry[] }) {
  if (symbols.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">No variables were declared.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase text-slate-500 dark:text-slate-400">
          <tr>
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">Type</th>
            <th className="py-2 pr-4">Value</th>
            <th className="py-2 pr-4">Scope</th>
            <th className="py-2">Line</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {symbols.map((s) => (
            <tr key={`${s.scope}-${s.name}`}>
              <td className="py-1.5 pr-4 font-mono">{s.name}</td>
              <td className="py-1.5 pr-4 font-mono">{s.type}</td>
              <td className="py-1.5 pr-4 font-mono">{showValue(s.value)}</td>
              <td className="py-1.5 pr-4">{s.scope}</td>
              <td className="py-1.5">{s.line}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
