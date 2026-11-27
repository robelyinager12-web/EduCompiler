import { useEffect, useRef, useState } from "react";
import { getErrorMessage } from "../services/api";

interface Settled<T> {
  id: string;
  data: T | null;
  error: string | null;
}

// Loads data when "key" changes. Change the key to load something else;
// call reload() to try again. Loading is derived, so no state is set during render.
export function useFetch<T>(fetcher: () => Promise<T>, key: string) {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const fetcherRef = useRef(fetcher);
  const requestId = `${key}#${attempt}`;

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    let cancelled = false;
    fetcherRef
      .current()
      .then((data) => {
        if (!cancelled) setSettled({ id: requestId, data, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) setSettled({ id: requestId, data: null, error: getErrorMessage(err) });
      });
    return () => {
      cancelled = true;
    };
  }, [requestId]);

  const done = settled !== null && settled.id === requestId;
  return {
    data: done ? settled.data : null,
    error: done ? settled.error : null,
    loading: !done,
    reload: () => setAttempt((n) => n + 1),
  };
}
