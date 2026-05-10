import { describe, it, expect } from "vitest";
import { formatPrice, formatDate, formatDateTime } from "./format";

describe("formatPrice", () => {
  it("formats 3,500,000 with vi-VN thousands separators and đ suffix", () => {
    const result = formatPrice(3500000);
    // vi-VN locale uses '.' as thousands separator
    expect(result).toMatch(/3[.\s]500[.\s]000/);
    expect(result.endsWith("đ")).toBe(true);
  });

  it("handles zero", () => {
    expect(formatPrice(0)).toMatch(/^0đ$/);
  });

  it("handles small numbers without separators", () => {
    expect(formatPrice(500)).toMatch(/^500đ$/);
  });
});

describe("formatDate", () => {
  it("formats a valid ISO date string", () => {
    const result = formatDate("2026-05-10");
    // vi-VN locale yields dd/MM/yyyy with possible whitespace variations
    expect(result).toMatch(/10[/.\s]+0?5[/.\s]+2026/);
  });

  it("returns N/A for empty string", () => {
    expect(formatDate("")).toBe("N/A");
  });

  it("returns N/A for invalid date string", () => {
    expect(formatDate("not-a-date")).toBe("N/A");
  });

  it("accepts Date instances", () => {
    const result = formatDate(new Date("2026-01-15"));
    expect(result).toMatch(/15[/.\s]+0?1[/.\s]+2026/);
  });
});

describe("formatDateTime", () => {
  it("produces a non-empty string for a valid ISO date", () => {
    const result = formatDateTime("2026-05-10T08:30:00Z");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});
