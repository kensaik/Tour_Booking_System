import { describe, it, expect } from "vitest";
import {
  BOOKING_STATUS,
  PAYMENT_STATUS,
  TOUR_STATUS,
  COMPANY_STATUS,
  DEPARTURE_STATUS,
} from "./status";

const registries = [
  ["BOOKING_STATUS", BOOKING_STATUS, ["confirmed", "pending", "cancelled", "completed"]],
  ["PAYMENT_STATUS", PAYMENT_STATUS, ["paid", "pending", "refunded"]],
  ["TOUR_STATUS", TOUR_STATUS, ["active", "approved", "draft", "inactive"]],
  ["COMPANY_STATUS", COMPANY_STATUS, ["approved", "pending", "rejected"]],
  ["DEPARTURE_STATUS", DEPARTURE_STATUS, ["active", "full", "draft"]],
] as const;

describe("status registries", () => {
  for (const [name, registry, keys] of registries) {
    describe(name, () => {
      for (const key of keys) {
        it(`'${key}' resolves to a non-empty label and colorClass`, () => {
          const entry = (registry as Record<string, { label: string; colorClass: string }>)[key];
          expect(entry).toBeDefined();
          expect(typeof entry.label).toBe("string");
          expect(entry.label.length).toBeGreaterThan(0);
          expect(typeof entry.colorClass).toBe("string");
          expect(entry.colorClass.length).toBeGreaterThan(0);
        });
      }
    });
  }

  it("BOOKING_STATUS entries expose an icon component", () => {
    for (const key of Object.keys(BOOKING_STATUS)) {
      expect(BOOKING_STATUS[key].icon).toBeDefined();
    }
  });
});
