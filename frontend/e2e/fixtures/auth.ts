import { Page, expect } from '@playwright/test'

/**
 * Seed credentials. MUST mirror `backend/database/seed.py` exactly.
 * These are TEST FIXTURES — they MUST never appear in production seeds.
 */
export const SEED_USERS = {
  guest: { email: 'a@gmail.com', password: 'Guest@123' },
  company: { email: 'abc@travel.com', password: 'Company@123' },
  admin: { email: 'admin@test.com', password: 'Admin@123' },
  pendingCompany: { email: 'pending@travel.com', password: 'Company@123' },
} as const

export type SeedRole = keyof typeof SEED_USERS

/**
 * Drive the LoginPage form for the given seeded role.
 * Waits for the post-login navigation away from /login.
 */
export async function login(page: Page, role: SeedRole): Promise<void> {
  const { email, password } = SEED_USERS[role]
  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Mật khẩu').fill(password)
  await page.getByRole('button', { name: /^đăng nhập$/i }).click()
  // Wait for redirect away from /login
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
    timeout: 10_000,
  })
}

export const loginAsGuest = (page: Page) => login(page, 'guest')
export const loginAsCompany = (page: Page) => login(page, 'company')
export const loginAsAdmin = (page: Page) => login(page, 'admin')
export const loginAsPendingCompany = (page: Page) => login(page, 'pendingCompany')

/**
 * Reset client storage between tests to keep them isolated.
 */
export async function clearAuth(page: Page): Promise<void> {
  await page.context().clearCookies()
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
}

export { expect }
