import axios from "axios";
import { AUTH_EXPIRED_EVENT, TOKEN_KEY } from "../utils/constants";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000/api",
  timeout: 20000,
});

// Attach the token to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// A 401 while we hold a token means it expired or the account is gone.
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      localStorage.getItem(TOKEN_KEY)
    ) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    return Promise.reject(error);
  },
);

// Turns any error into a message that is safe to show to the student.
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const message = (error.response.data as { message?: unknown } | undefined)?.message;
      if (typeof message === "string") return message;
      return `Request failed (${error.response.status}).`;
    }
    return "Cannot reach the server. Check your connection and try again.";
  }
  return "Something went wrong.";
}
