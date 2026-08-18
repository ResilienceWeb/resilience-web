import { expect, test } from '@playwright/test'

test('the admin dashboard loads for a signed-in web owner', async ({
  page,
}) => {
  await page.goto('/admin')

  // The admin layout redirects anonymous visitors to /auth/signin, so simply
  // arriving here proves the saved session is valid.
  await expect(page).toHaveURL(/\/admin$/)
  await expect(page.getByRole('button', { name: 'New listing' })).toBeVisible()
})

test('the listings of the web the user owns are shown', async ({ page }) => {
  await page.goto('/admin')

  await expect(page.getByText('Cambridge Community Kitchen')).toBeVisible()
})

test('the pending edits page loads', async ({ page }) => {
  await page.goto('/admin/listing-edits')

  await expect(page).toHaveURL(/\/admin\/listing-edits$/)
})
