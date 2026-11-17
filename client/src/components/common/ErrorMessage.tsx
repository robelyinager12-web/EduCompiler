export default function ErrorMessage({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
    >
      {message}
    </div>
  );
}
