import { Page } from '@playwright/test'

/**
 * Force the booking POST to return 500 so we can assert error UI without
 * depending on backend state. Uses Playwright `page.route()` per-spec
 * (no MSW — see brainstorm §4.5).
 */
export async function mockBookingFailure(page: Page): Promise<void> {
  await page.route('**/api/guest/departures/*/book', (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Lỗi máy chủ' }),
    }),
  )
  // Older clients may post to /api/bookings — cover both shapes.
  await page.route('**/api/bookings', (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Lỗi máy chủ' }),
    }),
  )
}
