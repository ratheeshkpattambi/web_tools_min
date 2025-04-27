// @ts-check
import { test, expect } from '@playwright/test';

test.describe('SafeWebTool Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('homepage has correct title and elements', async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle('SafeWebTool');
    
    // Verify logo and heading
    await expect(page.locator('.logo')).toBeVisible();
    await expect(page.locator('h1')).toContainText('SafeWebTool');
    
    // Verify navigation links
    await expect(page.locator('nav a[href="/"]')).toBeVisible();
    await expect(page.locator('nav a[href="/video"]')).toBeVisible();
    await expect(page.locator('nav a[href="/image"]')).toBeVisible();
    await expect(page.locator('nav a[href="/text"]')).toBeVisible();
    
    // Verify footer elements
    await expect(page.locator('.author-avatar')).toBeVisible();
    await expect(page.locator('.author-content')).toContainText('Dr. Ratheesh Kalarot');
    await expect(page.locator('.author-links a')).toHaveCount(3);
  });

  test('video page loads correctly', async ({ page }) => {
    // Navigate to video page
    await page.locator('nav a[href="/video"]').click();
    
    // Verify URL
    await expect(page).toHaveURL(/.*\/video/);
    
    // Ensure navigation class is updated
    await expect(page.locator('nav a[href="/video"]')).toHaveClass(/active/);
    
    // Verify page content (this will need to be updated based on actual page content)
    await expect(page.locator('main')).toBeVisible();
  });

  test('image page loads correctly', async ({ page }) => {
    // Navigate to image page
    await page.locator('nav a[href="/image"]').click();
    
    // Verify URL
    await expect(page).toHaveURL(/.*\/image/);
    
    // Ensure navigation class is updated
    await expect(page.locator('nav a[href="/image"]')).toHaveClass(/active/);
    
    // Verify page content (this will need to be updated based on actual page content)
    await expect(page.locator('main')).toBeVisible();
  });

  test('text page loads correctly', async ({ page }) => {
    // Navigate to text page
    await page.locator('nav a[href="/text"]').click();
    
    // Verify URL
    await expect(page).toHaveURL(/.*\/text/);
    
    // Ensure navigation class is updated
    await expect(page.locator('nav a[href="/text"]')).toHaveClass(/active/);
    
    // Verify page content (this will need to be updated based on actual page content)
    await expect(page.locator('main')).toBeVisible();
  });
}); 