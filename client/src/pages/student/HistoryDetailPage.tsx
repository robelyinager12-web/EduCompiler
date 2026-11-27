import { Link, useParams } from "react-router-dom";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import CodeBlock from "../../components/common/CodeBlock";
import PageState from "../../components/common/PageState";
import RunStatusBadge from "../../components/common/RunStatusBadge";
import { useFetch } from "../../hooks/useFetch";
import { fetchRun } from "../../services/compilerService";
import { formatDate } from "../../utils/formatDate";

export default function HistoryDetailPage() {
  const { id = "" } = useParams();
  const run = useFetch(() => fetchRun(id), `run-${id}`);
  const data = run.data;
  const details = data?.errors;

  return (
    <div className="space-y-4 p-6">
      <Link to="/app/history" className="text-sm text-indigo-600 hover:underline">
        Back to history
      </Link>

      <PageState loading={run.loading} error={run.error} onRetry={run.reload}>
        {data && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold">Compilation</h1>
              <RunStatusBadge status={data.status} />
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {formatDate(data.createdAt)}
              </span>
            </div>

            {details && (
              <Card title="Phases">
                <ul className="flex flex-wrap gap-2">
                  {details.phases.map((phase) => (
                    <li key={phase.phase}>
                      <Badge
                        tone={
                          phase.status === "success"
                            ? "green"
                            : phase.status === "failed"
                              ? "red"
                              : "slate"
                        }
                      >
                        {phase.label}: {phase.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {details && (details.errors.length > 0 || details.warnings.length > 0) && (
              <Card title="Messages">
                <ul className="space-y-2 text-sm">
                  {[...details.errors, ...details.warnings].map((d, i) => (
                    <li key={i} className="flex gap-2">
                      <Badge tone={d.severity === "error" ? "red" : "amber"}>{d.phase}</Badge>
                      <span>
                        Line {d.line}:{d.column} {d.message}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            <Card title="Source code">
              <CodeBlock code={data.sourceCode} label="Source code" />
            </Card>

            {data.intermediateCode && (
              <Card title="Intermediate code (TAC)">
                <CodeBlock code={data.intermediateCode.text} />
              </Card>
            )}
            {data.optimizedCode && (
              <Card title="Optimized code">
                <CodeBlock code={data.optimizedCode.text} />
              </Card>
            )}
            {data.targetCode && (
              <Card title="Educational target code">
                <CodeBlock code={data.targetCode.text} />
                {data.targetCode.note && (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {data.targetCode.note}
                  </p>
                )}
              </Card>
            )}
          </>
        )}
      </PageState>
    </div>
  );
}
