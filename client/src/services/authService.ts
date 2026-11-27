import type { ApiResponse, AuthResponse, User } from "../types/auth.types";
import { api } from "./api";

export async function loginRequest(email: string, password: string): Promise<AuthResponse> {
  const res = await api.post<ApiResponse<AuthResponse>>("/auth/login", { email, password });
  return res.data.data;
}

export async function registerRequest(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await api.post<ApiResponse<AuthResponse>>("/auth/register", {
    name,
    email,
    password,
  });
  return res.data.data;
}

export async function fetchCurrentUser(): Promise<User> {
  const res = await api.get<ApiResponse<{ user: User }>>("/auth/me");
  return res.data.data.user;
}
