import type { Diagnostic } from "../../types/compiler.types";
import Badge from "../common/Badge";

export default function ErrorList({ diagnostics }: { diagnostics: Diagnostic[] }) {
  if (diagnostics.length === 0) return null;

  return (
    <ul className="space-y-2 text-sm">
      {diagnostics.map((d, i) => (
        <li key={i} className="flex flex-wrap items-start gap-2">
          <Badge tone={d.severity === "error" ? "red" : "amber"}>
            {d.severity === "error" ? `${d.phase} error` : "warning"}
          </Badge>
          <span>
            Line {d.line}, column {d.column}: {d.message}
          </span>
        </li>
      ))}
    </ul>
  );
}
