import { test, expect } from '@playwright/test'
import { loginAsAdmin, clearAuth, SEED_USERS } from './fixtures/auth'

test.describe('Admin company management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await clearAuth(page)
    await loginAsAdmin(page)
  })

  test('admin can approve the pending seed company', async ({ page }) => {
    await page.goto('/admin/companies')
    await expect(page.getByRole('heading', { name: /công ty/i })).toBeVisible({
      timeout: 10_000,
    })

    // Filter to pending companies (the table renders all by default; use the
    // status select if present)
    const statusSelect = page.locator('select').filter({ hasText: /chờ duyệt/i })
    if (await statusSelect.count()) {
      await statusSelect.selectOption('pending')
    }

    // Find the row containing pending@travel.com
    const pendingRow = page.locator('tr', {
      hasText: SEED_USERS.pendingCompany.email,
    })
    await expect(pendingRow).toBeVisible({ timeout: 10_000 })

    // Click the approve button (title="Duyệt công ty")
    const approveBtn = pendingRow.locator('button[title*="Duyệt" i]')
    await approveBtn.click()

    // After approval the row drops out of the "pending" filter, so switch
    // back to "all" before asserting the status badge flipped.
    if (await statusSelect.count()) {
      await statusSelect.selectOption('all')
    }

    // Status badge should flip — wait for "Đã duyệt" inside the row
    await expect(pendingRow.getByText(/đã duyệt/i)).toBeVisible({
      timeout: 10_000,
    })
  })

  // TODO: Destination CRUD — admin destination UI not present in this build.
  // Re-enable once /admin/destinations page is implemented.
  test.skip('admin destination CRUD (UI not yet implemented)', async () => {})
})
