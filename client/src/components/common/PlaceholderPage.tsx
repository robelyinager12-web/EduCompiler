import Card from "./Card";

// Temporary page. Each one is replaced by a real page in a later phase.
export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">{title}</h1>
      <Card>
        <p className="text-slate-600 dark:text-slate-300">
          This page will be built in a later phase.
        </p>
      </Card>
    </div>
  );
}
