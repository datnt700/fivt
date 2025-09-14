import { test, expect } from '@playwright/test'

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/')
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle')
  
  // Check if the page title is correct
  await expect(page).toHaveTitle(/Financial App/)
  
  // Check if main navigation is present
  const nav = page.locator('nav')
  await expect(nav).toBeVisible()
})

test('navigation works', async ({ page }) => {
  await page.goto('/')
  
  // Test navigation to different pages
  // Add specific navigation tests based on your app structure
  
  // Example: Click on a navigation link
  // await page.click('text=Dashboard')
  // await expect(page).toHaveURL('/dashboard')
})