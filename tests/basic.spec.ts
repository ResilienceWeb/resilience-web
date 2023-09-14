import { test, expect } from '@playwright/test'

test('Homepage is displayed as expected', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(/Resilience Web/)

  await expect(
    page.getByRole('heading', {
      name: 'Celebrating place-based community action',
    }),
  ).toBeVisible()
})

