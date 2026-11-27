import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthStatus } from "../context/auth-context";
import { useAuth } from "../hooks/useAuth";
import type { Role, User } from "../types/auth.types";
import AdminRoute from "./AdminRoute";
import ProtectedRoute from "./ProtectedRoute";

vi.mock("../hooks/useAuth");

function setAuth(status: AuthStatus, role?: Role) {
  const user: User | null = role
    ? { id: "u1", name: "Abel", email: "abel@example.com", role }
    : null;
  vi.mocked(useAuth).mockReturnValue({
    user,
    status,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  });
}

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<p>Login page</p>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<p>Student area</p>} />
        </Route>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<p>Admin area</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("ProtectedRoute", () => {
  it("waits while the session is being checked", () => {
    setAuth("loading");
    renderAt("/app");
    expect(screen.getByText("Checking your session...")).toBeInTheDocument();
    expect(screen.queryByText("Login page")).not.toBeInTheDocument();
  });

  it("sends anonymous visitors to the login page", () => {
    setAuth("anonymous");
    renderAt("/app");
    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("lets a logged-in student in", () => {
    setAuth("authenticated", "STUDENT");
    renderAt("/app");
    expect(screen.getByText("Student area")).toBeInTheDocument();
  });
});

describe("AdminRoute", () => {
  it("sends anonymous visitors to the login page", () => {
    setAuth("anonymous");
    renderAt("/admin");
    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("sends a student to the student area", () => {
    setAuth("authenticated", "STUDENT");
    renderAt("/admin");
    expect(screen.getByText("Student area")).toBeInTheDocument();
    expect(screen.queryByText("Admin area")).not.toBeInTheDocument();
  });

  it("lets an administrator in", () => {
    setAuth("authenticated", "ADMIN");
    renderAt("/admin");
    expect(screen.getByText("Admin area")).toBeInTheDocument();
  });
});
