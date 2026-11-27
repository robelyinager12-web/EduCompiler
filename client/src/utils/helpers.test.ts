import { AxiosError, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { getErrorMessage } from "../services/api";
import { formatDate, previewSource } from "./formatDate";

describe("formatDate", () => {
  it("returns an empty string for an invalid date", () => {
    expect(formatDate("not a date")).toBe("");
  });

  it("formats a valid date", () => {
    expect(formatDate("2026-01-15T10:30:00Z")).not.toBe("");
  });
});

describe("previewSource", () => {
  it("returns the first non-empty line", () => {
    expect(previewSource("\n\nint a = 1;\nprint(a);")).toBe("int a = 1;");
  });

  it("describes an empty program", () => {
    expect(previewSource("  \n ")).toBe("(empty program)");
  });

  it("shortens long lines", () => {
    const result = previewSource("x".repeat(70));
    expect(result).toBe(`${"x".repeat(60)}...`);
  });
});

describe("getErrorMessage", () => {
  it("uses the message sent by the server", () => {
    const response = { status: 400, data: { message: "Bad input." } } as AxiosResponse;
    const error = new AxiosError("failed", "ERR_BAD_REQUEST", undefined, undefined, response);
    expect(getErrorMessage(error)).toBe("Bad input.");
  });

  it("falls back to the status code", () => {
    const response = { status: 500, data: {} } as AxiosResponse;
    const error = new AxiosError("failed", "ERR_BAD_RESPONSE", undefined, undefined, response);
    expect(getErrorMessage(error)).toBe("Request failed (500).");
  });

  it("explains a network failure", () => {
    expect(getErrorMessage(new AxiosError("Network Error"))).toContain("Cannot reach the server");
  });

  it("handles an unknown error", () => {
    expect(getErrorMessage(new Error("boom"))).toBe("Something went wrong.");
  });
});
