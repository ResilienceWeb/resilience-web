import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  // Go to Cambridge web - it has more listings for better testing
  await page.goto('http://cambridge.localhost:3000')
  // Switch to list view to see all listings
  await page.getByRole('tab', { name: 'List' }).click()
})

test('Search filtering works correctly', async ({ page }) => {
  // Initially all listings should be visible
  await expect(page.getByText('Cambridge Community Kitchen')).toBeVisible()
  await expect(page.getByText('Cambridge Carbon Footprint')).toBeVisible()
  await expect(page.getByText('Cambridge Sustainable Food')).toBeVisible()
  await expect(page.getByText('Cambridge Cycling Campaign')).toBeVisible()

  // Type in search box
  await page.getByPlaceholder('Search').fill('Something else')

  // Only listings with "food" in the name should be visible
  await expect(page.getByText('Cambridge Sustainable Food')).toBeVisible()

  // Other listings should be hidden
  await expect(page.getByText('Cambridge Community Kitchen')).not.toBeVisible()
  await expect(page.getByText('Cambridge Carbon Footprint')).not.toBeVisible()
  await expect(page.getByText('Cambridge Cycling Campaign')).not.toBeVisible()

  // Clear search
  await page.getByRole('button', { name: 'Clear search input' }).click()

  // All listings should be visible again
  await expect(page.getByText('Cambridge Community Kitchen')).toBeVisible()
  await expect(page.getByText('Cambridge Carbon Footprint')).toBeVisible()
  await expect(page.getByText('Cambridge Sustainable Food')).toBeVisible()
  await expect(page.getByText('Cambridge Cycling Campaign')).toBeVisible()
})
// <div class="css-hswi9h">
// <div class="css-1nmdiq5-menu">
//  <div class="css-qr46ko" role="listbox" aria-multiselectable="true" id="react-select-3-listbox">
//    <div class="css-c23um8-option" aria-disabled="false" id="react-select-3-option-0" tabindex="-1" role="option">Animal rights</div>
//    <div class="css-16sb7s1-option" aria-disabled="false" id="react-select-3-option-1" tabindex="-1" role="option">Community</div>
//    <div class="css-1ltgk43-option" aria-disabled="false" id="react-select-3-option-2" tabindex="-1" role="option">Environment</div>
//    <div class="css-xuqdds-option" aria-disabled="false" id="react-select-3-option-3" tabindex="-1" role="option">Housing</div>
//    <div class="css-piopj5-option" aria-disabled="false" id="react-select-3-option-4" tabindex="-1" role="option">Social business</div>
//    <div class="css-oe4jjn-option" aria-disabled="false" id="react-select-3-option-5" tabindex="-1" role="option">Social justice</div>
//    <div class="css-19h1o6v-option" aria-disabled="false" id="react-select-3-option-6" tabindex="-1" role="option">Transportation</div>
// </div></div></div>
test('Category filtering works correctly', async ({ page }) => {
  // Initially all listings should be visible
  await expect(page.getByText('Cambridge Community Kitchen')).toBeVisible()
  await expect(page.getByText('Cambridge Carbon Footprint')).toBeVisible()
  await expect(page.getByText('Cambridge Cycling Campaign')).toBeVisible()

  // Select Environment category
  await page.locator('#category-select').click()
  await page
    .locator('div[role="option"]')
    .filter({ hasText: /^Environment$/ })
    .click()

  // Only Environment category listings should be visible
  await expect(page.getByText('Cambridge Carbon Footprint')).toBeVisible()
  await expect(page.getByText('Cambridge Sustainable Food')).toBeVisible()

  // Other category listings should be hidden
  await expect(page.getByText('Cambridge Cycling Campaign')).not.toBeVisible()
  await expect(page.getByText('Cambridge Community Kitchen')).not.toBeVisible()

  // Select Transportation category additionally
  await page.locator('#category-select').click()
  await page
    .locator('div[role="option"]')
    .filter({ hasText: /^Transportation$/ })
    .click()

  // Now both Environment and Transportation listings should be visible
  await expect(page.getByText('Cambridge Carbon Footprint')).toBeVisible()
  await expect(page.getByText('Cambridge Sustainable Food')).toBeVisible()
  await expect(page.getByText('Cambridge Cycling Campaign')).toBeVisible()

  // But Community category listings should still be hidden
  await expect(page.getByText('Cambridge Community Kitchen')).not.toBeVisible()

  // Clear filters by removing selected categories
  // First remove Environment
  await page.getByLabel('Remove Environment').click()
  // Then remove Transportation
  await page.getByLabel('Remove Transportation').click()

  // All listings should be visible again
  await expect(page.getByText('Cambridge Community Kitchen')).toBeVisible()
  await expect(page.getByText('Cambridge Carbon Footprint')).toBeVisible()
  await expect(page.getByText('Cambridge Sustainable Food')).toBeVisible()
  await expect(page.getByText('Cambridge Cycling Campaign')).toBeVisible()
})

test('Combined search and category filtering works correctly', async ({
  page,
}) => {
  // Initially all listings should be visible
  await expect(page.getByText('Cambridge Community Kitchen')).toBeVisible()
  await expect(page.getByText('Cambridge Carbon Footprint')).toBeVisible()
  await expect(page.getByText('Cambridge Sustainable Food')).toBeVisible()

  // Type in search box
  await page.getByPlaceholder('Search').fill('cambridge')

  // All listings should still be visible as they all contain "cambridge"
  await expect(page.getByText('Cambridge Community Kitchen')).toBeVisible()
  await expect(page.getByText('Cambridge Carbon Footprint')).toBeVisible()
  await expect(page.getByText('Cambridge Sustainable Food')).toBeVisible()

  // Now add category filter
  await page.locator('#category-select').click()
  await page
    .locator('div[role="option"]')
    .filter({ hasText: /^Environment$/ })
    .click()

  // Only Environment listings with "cambridge" in name should be visible
  await expect(page.getByText('Cambridge Carbon Footprint')).toBeVisible()
  await expect(page.getByText('Cambridge Sustainable Food')).toBeVisible()

  // Community category listings should be hidden
  await expect(page.getByText('Cambridge Community Kitchen')).not.toBeVisible()

  // Refine search further
  await page.getByPlaceholder('Search').fill('carbon')

  // Only listings with "carbon" in name and in Environment category should be visible
  await expect(page.getByText('Cambridge Carbon Footprint')).toBeVisible()

  // Other Environment listings should now be hidden
  await expect(page.getByText('Cambridge Sustainable Food')).not.toBeVisible()

  // Clear all filters
  await page.getByRole('button', { name: 'Clear search input' }).click()
  await page.getByLabel('Remove Environment').click()

  // All listings should be visible again
  await expect(page.getByText('Cambridge Community Kitchen')).toBeVisible()
  await expect(page.getByText('Cambridge Carbon Footprint')).toBeVisible()
  await expect(page.getByText('Cambridge Sustainable Food')).toBeVisible()
})
