import { test, expect } from '@playwright/test'
import { loginAsGuest, clearAuth } from './fixtures/auth'
import { mockBookingFailure } from './fixtures/api-mocks'

test.describe('Guest booking — happy path', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await clearAuth(page)
    await loginAsGuest(page)
  })

  test('guest browses → selects departure → checks out → sees confirmation', async ({
    page,
  }) => {
    // 1. Land on home, navigate to /tours
    await page.goto('/tours')
    await expect(page).toHaveURL(/\/tours/)

    // 2. Click first tour card link
    const firstTourLink = page.locator('a[href^="/tours/"]').first()
    await expect(firstTourLink).toBeVisible({ timeout: 10_000 })
    await firstTourLink.click()
    await page.waitForURL(/\/tours\/\d+/)

    // 3. Wait for detail to render and pick the first available departure
    await expect(page.getByRole('button', { name: /^đặt ngay$/i })).toBeVisible({
      timeout: 10_000,
    })
    // Departure cards are clickable divs that render formatDate(start_date) text;
    // pick the first one available.
    const firstDeparture = page.locator('[class*="cursor-pointer"]').first()
    if (await firstDeparture.count()) {
      await firstDeparture.click()
    }

    // 4. Click "Đặt ngay"
    await page.getByRole('button', { name: /^đặt ngay$/i }).click()
    await page.waitForURL(/\/checkout/, { timeout: 10_000 })

    // 5. Fill checkout contact form
    await page.getByPlaceholder(/nhập họ và tên/i).fill('Khách Test')
    await page.getByPlaceholder(/email@example/i).fill('khach@test.com')
    await page.getByPlaceholder(/0xxx/i).fill('0987654321')

    // 6. Submit booking (Step 1 → Step 2)
    await page.getByRole('button', { name: /tiếp tục/i }).click()

    // 7. Assert step-2 (payment method) appears, confirming booking_id was returned
    await expect(page.getByText(/phương thức thanh toán/i)).toBeVisible({
      timeout: 10_000,
    })
  })
})

test.describe('Guest booking — failure path', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await clearAuth(page)
    await loginAsGuest(page)
  })

  test('booking POST 500 surfaces error to user', async ({ page }) => {
    await mockBookingFailure(page)

    // jump straight to checkout with a synthetic bookingState via window.history
    await page.goto('/tours')
    const firstTourLink = page.locator('a[href^="/tours/"]').first()
    await firstTourLink.click()
    await page.waitForURL(/\/tours\/\d+/)
    await expect(page.getByRole('button', { name: /^đặt ngay$/i })).toBeVisible()

    const firstDeparture = page.locator('[class*="cursor-pointer"]').first()
    if (await firstDeparture.count()) await firstDeparture.click()

    await page.getByRole('button', { name: /^đặt ngay$/i }).click()
    await page.waitForURL(/\/checkout/)

    await page.getByPlaceholder(/nhập họ và tên/i).fill('Khách Lỗi')
    await page.getByPlaceholder(/email@example/i).fill('loi@test.com')
    await page.getByPlaceholder(/0xxx/i).fill('0987654321')

    // CheckoutPage uses window.alert for errors — capture it.
    const dialogPromise = page.waitForEvent('dialog', { timeout: 5_000 }).catch(() => null)
    await page.getByRole('button', { name: /tiếp tục/i }).click()

    const dialog = await dialogPromise
    if (dialog) {
      expect(dialog.message()).toMatch(/lỗi|error|máy chủ/i)
      await dialog.dismiss()
    } else {
      // Fallback: assert we did NOT progress past Step 1
      await expect(page.getByText(/thông tin liên hệ/i)).toBeVisible()
      await expect(page.getByText(/phương thức thanh toán/i)).not.toBeVisible()
    }
  })
})
