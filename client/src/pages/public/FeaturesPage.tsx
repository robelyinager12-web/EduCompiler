import { Link } from "react-router-dom";
import Card from "../../components/common/Card";

const phases = [
  { title: "Lexical analysis", text: "Source text becomes tokens, each with a type, line and column." },
  { title: "Syntax analysis", text: "A recursive-descent parser checks the grammar and builds an abstract syntax tree." },
  { title: "Semantic analysis", text: "Checks declarations and types, and builds the symbol table." },
  { title: "Intermediate code", text: "Three-address code: one simple operation per line." },
  { title: "Optimization", text: "Constant folding, constant propagation and dead code removal, each explained." },
  { title: "Target code", text: "Educational pseudo-assembly, shown next to the code it came from." },
];

const extras = [
  "Error messages with exact line and column, shown as marks in the editor",
  "Save programs and review your compilation history",
  "Lessons with progress tracking, and practice exercises",
  "Light and dark themes",
];

export default function FeaturesPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <h1 className="mt-4 text-3xl font-bold">Compiler features</h1>

      <section aria-label="Compiler phases" className="grid gap-4 md:grid-cols-2">
        {phases.map((phase, index) => (
          <Card key={phase.title} title={`${index + 1}. ${phase.title}`}>
            <p className="text-sm text-slate-600 dark:text-slate-300">{phase.text}</p>
          </Card>
        ))}
      </section>

      <Card title="Also included">
        <ul className="list-inside list-disc space-y-1 text-sm">
          {extras.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <Link to="/register" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">
          Create a free student account
        </Link>
      </Card>
    </main>
  );
}
