export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

// First non-empty line of a program, shortened for list views.
export function previewSource(source: string, max = 60): string {
  const line = source.split("\n").find((l) => l.trim() !== "") ?? "(empty program)";
  return line.length > max ? `${line.slice(0, max)}...` : line;
}
