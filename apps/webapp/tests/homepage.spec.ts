import { test, expect } from '@playwright/test'

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/')
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle')
  
  // Check if the page has loaded (should have a title)
  const title = await page.title()
  expect(title).toBeTruthy()
  
  // Check for actual error pages by looking at title and status
  expect(title).not.toContain('404')
  expect(title).not.toContain('500')
  expect(title).not.toContain('Error')
  
  // Verify the page has meaningful content
  const body = await page.locator('body').textContent()
  expect(body).toBeTruthy()
  if (body) {
    expect(body.length).toBeGreaterThan(100)
  }
  
  // Check that we can see expected UI elements
  await expect(page.locator('body')).toBeVisible()
})

test('page renders without errors', async ({ page }) => {
  await page.goto('/')
  
  // Check that page doesn't have console errors that would prevent rendering
  const errors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })
  
  await page.waitForLoadState('networkidle')
  
  // Allow auth-related errors but not critical rendering errors
  const criticalErrors = errors.filter(error => 
    !error.includes('MissingSecret') && 
    !error.includes('auth') &&
    !error.includes('AUTH_SECRET')
  )
  
  expect(criticalErrors).toHaveLength(0)
})