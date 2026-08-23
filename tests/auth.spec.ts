import { expect, test } from '@playwright/test'

test('an anonymous visitor is sent to sign in', async ({ page }) => {
  await page.goto('/admin')

  await expect(page).toHaveURL(/\/auth\/signin/)
})
