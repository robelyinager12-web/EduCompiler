import Card from "../../components/common/Card";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="mt-4 text-3xl font-bold">About EduCompiler</h1>

      <Card title="What it is">
        <p className="leading-relaxed">
          EduCompiler is an interactive learning system that helps Software Engineering students
          understand how a compiler works. Students write programs in a small teaching language
          called EduLang, run them through every compiler phase, and inspect the result of each
          phase.
        </p>
      </Card>

      <Card title="What it is not">
        <p className="leading-relaxed">
          EduCompiler is an academic project. It analyses EduLang programs and shows educational
          output. It does not run your programs, and the target code it displays is pseudo-assembly
          for an imaginary machine, not real machine code.
        </p>
      </Card>

      <Card title="Built with">
        <ul className="list-inside list-disc space-y-1">
          <li>React, TypeScript, Vite and Tailwind CSS on the client</li>
          <li>Monaco Editor and React Flow for the editor and the diagrams</li>
          <li>Node.js, Express and TypeScript on the server</li>
          <li>PostgreSQL (Neon) with Prisma</li>
          <li>A hand-written lexer, recursive-descent parser and semantic analyzer</li>
        </ul>
      </Card>
    </main>
  );
}
