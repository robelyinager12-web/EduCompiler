export type Role = "STUDENT" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Every successful API response has this shape.
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}
