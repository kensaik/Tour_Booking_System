import { test, expect } from "@playwright/test";
import { loginAsCompany, clearAuth } from "./fixtures/auth";

test.describe("Company tour CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearAuth(page);
    await loginAsCompany(page);
  });

  test("company can add a new tour and see it in /company/tours list", async ({ page }) => {
    const tourName = `E2E Tour ${Date.now()}`;

    await page.goto("/company/tours/new");
    await expect(page.getByRole("heading", { name: /thêm tour mới/i })).toBeVisible();

    // Tên Tour
    await page.getByPlaceholder(/tour đà lạt 3 ngày 2 đêm/i).fill(tourName);

    // Điểm đến (select) — pick the first non-empty option
    const destinationSelect = page.locator("select").first();
    await destinationSelect.selectOption({ index: 1 });

    // Giá tour
    await page.getByPlaceholder(/1500000/).fill("2000000");

    // Mô tả tổng quát
    await page.getByPlaceholder(/giới thiệu sơ lược về tour/i).fill("Mô tả E2E test");

    // Lịch trình ngày 1
    await page
      .getByPlaceholder(/tiêu đề ngày/i)
      .first()
      .fill("Ngày 1: Khởi hành");
    await page
      .getByPlaceholder(/những hoạt động chính/i)
      .first()
      .fill("Hoạt động ngày 1");

    // Submit
    await page.getByRole("button", { name: /lưu và đăng tour/i }).click();

    // Should redirect to /company/tours and show the new tour
    await page.waitForURL(/\/company\/tours(\?|$)/, { timeout: 15_000 });
    await expect(page.getByText(tourName)).toBeVisible({ timeout: 10_000 });
  });
});
