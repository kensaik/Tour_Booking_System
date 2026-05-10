import { test, expect } from '@playwright/test'

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
] as const

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'tours', path: '/tours' },
] as const

test.describe('Visual responsive smoke', () => {
  for (const viewport of VIEWPORTS) {
    for (const pageDef of PAGES) {
      test(`${pageDef.name} @ ${viewport.name} (${viewport.width}px)`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        await page.goto(pageDef.path)
        await page.waitForLoadState('networkidle')
        await page.evaluate(() => (document as unknown as { fonts?: { ready: Promise<void> } }).fonts?.ready)

        // No horizontal scroll smoke check — allow 1px rounding tolerance
        const overflow = await page.evaluate(
          () => document.body.scrollWidth - window.innerWidth,
        )
        expect(overflow).toBeLessThanOrEqual(1)

        await expect(page).toHaveScreenshot(
          `${pageDef.name}-${viewport.width}.png`,
          {
            fullPage: true,
            maxDiffPixelRatio: 0.02,
            animations: 'disabled',
          },
        )
      })
    }
  }
})
