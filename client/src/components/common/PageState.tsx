import type { ReactNode } from "react";
import Button from "./Button";
import ErrorMessage from "./ErrorMessage";
import Loader from "./Loader";

interface Props {
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  children: ReactNode;
}

// Shows a loader, or an error with a retry button, or the page content.
export default function PageState({ loading, error, onRetry, children }: Props) {
  if (loading) {
    return (
      <div className="p-6">
        <Loader />
      </div>
    );
  }
  if (error) {
    return (
      <div className="space-y-3 p-6">
        <ErrorMessage message={error} />
        {onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    );
  }
  return <>{children}</>;
}
