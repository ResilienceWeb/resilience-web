import { test, expect } from '@playwright/test'

test('Web title is displayed', async ({ page }) => {
  await page.goto('http://durham.localhost:3000')

  await expect(
    page.getByRole('heading', { level: 2, exact: true, name: 'Durham' }),
  ).toBeVisible()
})

test('Listings are loaded', async ({ page }) => {
  await page.goto('http://durham.localhost:3000')

  await page.getByRole('tab', { name: 'List' }).click()

  await expect(page.getByText('Conservation Research Institute')).toBeVisible()
  await expect(page.getByText('Durham Community Kitchen')).toBeVisible()
})
