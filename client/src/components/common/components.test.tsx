import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProgressBar from "../dashboard/ProgressBar";
import PageState from "./PageState";

describe("ProgressBar", () => {
  it("shows the value, the maximum and the percentage", () => {
    render(<ProgressBar value={1} max={4} label="Lessons" />);
    expect(screen.getByRole("progressbar", { name: "Lessons" })).toHaveAttribute("aria-valuenow", "1");
    expect(screen.getByText("1 of 4 (25%)")).toBeInTheDocument();
  });

  it("does not divide by zero", () => {
    render(<ProgressBar value={0} max={0} label="Lessons" />);
    expect(screen.getByText("0 of 0 (0%)")).toBeInTheDocument();
  });
});

describe("PageState", () => {
  it("shows a loader while loading", () => {
    render(
      <PageState loading error={null}>
        content
      </PageState>,
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("content")).not.toBeInTheDocument();
  });

  it("shows the error and a working retry button", () => {
    const onRetry = vi.fn();
    render(
      <PageState loading={false} error="Boom" onRetry={onRetry}>
        content
      </PageState>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Boom");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("shows the content when there is nothing to wait for", () => {
    render(
      <PageState loading={false} error={null}>
        content
      </PageState>,
    );
    expect(screen.getByText("content")).toBeInTheDocument();
  });
});
