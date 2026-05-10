# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: guest-booking.spec.ts >> Guest booking — failure path >> booking POST 500 surfaces error to user
- Location: e2e\guest-booking.spec.ts:60:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/
Call log:
  - navigating to "http://localhost:5173/", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { loginAsGuest, clearAuth } from "./fixtures/auth";
  3  | import { mockBookingFailure } from "./fixtures/api-mocks";
  4  | 
  5  | test.describe("Guest booking — happy path", () => {
  6  |   test.beforeEach(async ({ page }) => {
  7  |     await page.goto("/");
  8  |     await clearAuth(page);
  9  |     await loginAsGuest(page);
  10 |   });
  11 | 
  12 |   test("guest browses → selects departure → checks out → sees confirmation", async ({ page }) => {
  13 |     // 1. Land on home, navigate to /tours
  14 |     await page.goto("/tours");
  15 |     await expect(page).toHaveURL(/\/tours/);
  16 | 
  17 |     // 2. Click first tour card link
  18 |     const firstTourLink = page.locator('a[href^="/tours/"]').first();
  19 |     await expect(firstTourLink).toBeVisible({ timeout: 10_000 });
  20 |     await firstTourLink.click();
  21 |     await page.waitForURL(/\/tours\/\d+/);
  22 | 
  23 |     // 3. Wait for detail to render and pick the first available departure
  24 |     await expect(page.getByRole("button", { name: /^đặt ngay$/i })).toBeVisible({
  25 |       timeout: 10_000,
  26 |     });
  27 |     // Departure cards are clickable divs that render formatDate(start_date) text;
  28 |     // pick the first one available.
  29 |     const firstDeparture = page.locator('button:has-text("chỗ")').first();
  30 |     if (await firstDeparture.count()) {
  31 |       await firstDeparture.click();
  32 |     }
  33 | 
  34 |     // 4. Click "Đặt ngay"
  35 |     await page.getByRole("button", { name: /^đặt ngay$/i }).click();
  36 |     await page.waitForURL(/\/checkout/, { timeout: 10_000 });
  37 | 
  38 |     // 5. Fill checkout contact form
  39 |     await page.getByPlaceholder(/nhập họ và tên/i).fill("Khách Test");
  40 |     await page.getByPlaceholder(/email@example/i).fill("khach@test.com");
  41 |     await page.getByPlaceholder(/0xxx/i).fill("0987654321");
  42 | 
  43 |     // 6. Submit booking (Step 1 → Step 2)
  44 |     await page.getByRole("button", { name: /tiếp tục/i }).click();
  45 | 
  46 |     // 7. Assert step-2 (payment method) appears, confirming booking_id was returned
  47 |     await expect(page.getByText(/phương thức thanh toán/i)).toBeVisible({
  48 |       timeout: 10_000,
  49 |     });
  50 |   });
  51 | });
  52 | 
  53 | test.describe("Guest booking — failure path", () => {
  54 |   test.beforeEach(async ({ page }) => {
> 55 |     await page.goto("/");
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/
  56 |     await clearAuth(page);
  57 |     await loginAsGuest(page);
  58 |   });
  59 | 
  60 |   test("booking POST 500 surfaces error to user", async ({ page }) => {
  61 |     await mockBookingFailure(page);
  62 | 
  63 |     // jump straight to checkout with a synthetic bookingState via window.history
  64 |     await page.goto("/tours");
  65 |     const firstTourLink = page.locator('a[href^="/tours/"]').first();
  66 |     await firstTourLink.click();
  67 |     await page.waitForURL(/\/tours\/\d+/);
  68 |     await expect(page.getByRole("button", { name: /^đặt ngay$/i })).toBeVisible();
  69 | 
  70 |     const firstDeparture = page.locator('button:has-text("chỗ")').first();
  71 |     if (await firstDeparture.count()) await firstDeparture.click();
  72 | 
  73 |     await page.getByRole("button", { name: /^đặt ngay$/i }).click();
  74 |     await page.waitForURL(/\/checkout/);
  75 | 
  76 |     await page.getByPlaceholder(/nhập họ và tên/i).fill("Khách Lỗi");
  77 |     await page.getByPlaceholder(/email@example/i).fill("loi@test.com");
  78 |     await page.getByPlaceholder(/0xxx/i).fill("0987654321");
  79 | 
  80 |     // CheckoutPage uses window.alert for errors — capture it.
  81 |     const dialogPromise = page.waitForEvent("dialog", { timeout: 5_000 }).catch(() => null);
  82 |     await page.getByRole("button", { name: /tiếp tục/i }).click();
  83 | 
  84 |     const dialog = await dialogPromise;
  85 |     if (dialog) {
  86 |       expect(dialog.message()).toMatch(/lỗi|error|máy chủ/i);
  87 |       await dialog.dismiss();
  88 |     } else {
  89 |       // Fallback: assert we did NOT progress past Step 1
  90 |       await expect(page.getByText(/thông tin liên hệ/i)).toBeVisible();
  91 |       await expect(page.getByText(/phương thức thanh toán/i)).not.toBeVisible();
  92 |     }
  93 |   });
  94 | });
  95 | 
```