# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: company-crud.spec.ts >> Company tour CRUD >> company can add a new tour and see it in /company/tours list
- Location: e2e\company-crud.spec.ts:11:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/
Call log:
  - navigating to "http://localhost:5173/", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { loginAsCompany, clearAuth } from "./fixtures/auth";
  3  |
  4  | test.describe("Company tour CRUD", () => {
  5  |   test.beforeEach(async ({ page }) => {
> 6  |     await page.goto("/");
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/
  7  |     await clearAuth(page);
  8  |     await loginAsCompany(page);
  9  |   });
  10 |
  11 |   test("company can add a new tour and see it in /company/tours list", async ({ page }) => {
  12 |     const tourName = `E2E Tour ${Date.now()}`;
  13 |
  14 |     await page.goto("/company/tours/new");
  15 |     await expect(page.getByRole("heading", { name: /thêm tour mới/i })).toBeVisible();
  16 |
  17 |     // Tên Tour
  18 |     await page.getByPlaceholder(/tour đà lạt 3 ngày 2 đêm/i).fill(tourName);
  19 |
  20 |     // Điểm đến (select) — pick the first non-empty option
  21 |     const destinationSelect = page.locator("select").first();
  22 |     await destinationSelect.selectOption({ index: 1 });
  23 |
  24 |     // Giá tour
  25 |     await page.getByPlaceholder(/1\.?500\.?000/).fill("2000000");
  26 |
  27 |     // Mô tả tổng quát
  28 |     await page.getByPlaceholder(/giới thiệu sơ lược về tour/i).fill("Mô tả E2E test");
  29 |
  30 |     // Lịch trình ngày 1
  31 |     await page
  32 |       .getByPlaceholder(/tiêu đề ngày/i)
  33 |       .first()
  34 |       .fill("Ngày 1: Khởi hành");
  35 |     await page
  36 |       .getByPlaceholder(/những hoạt động chính/i)
  37 |       .first()
  38 |       .fill("Hoạt động ngày 1");
  39 |
  40 |     // Submit
  41 |     await page.getByRole("button", { name: /lưu và đăng tour/i }).click();
  42 |
  43 |     // Should redirect to /company/tours and show the new tour
  44 |     await page.waitForURL(/\/company\/tours(\?|$)/, { timeout: 15_000 });
  45 |     await expect(page.getByText(tourName)).toBeVisible({ timeout: 10_000 });
  46 |   });
  47 | });
  48 |
```
