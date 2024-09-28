import { test, expect } from '@playwright/test'

test('Titles are displayed', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(/Resilience Web/)

  await expect(
    page.getByRole('heading', {
      name: 'Celebrating place-based community action',
    }),
  ).toBeVisible()

  await expect(
    page.getByText('Find Resilience Webs near you in the UK'),
  ).toBeVisible()
})

test('Web cards are loaded', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Cambridge' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Durham' })).toBeVisible()
})
