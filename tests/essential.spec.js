// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Essential Functionality Tests', () => {
  // Test that all tools load correctly
  test('all tools load their main UI components', async ({ page }) => {
    // Test video tool
    await page.goto('/video/resize');
    await expect(page.locator('.tool-container')).toBeVisible();
    await expect(page.locator('.tool-container h1')).toContainText('Video Resize');
    await expect(page.locator('.file-select-btn')).toBeVisible();
    
    // Test image tool
    await page.goto('/image/resize');
    await expect(page.locator('.tool-container')).toBeVisible();
    await expect(page.locator('.tool-container h1')).toContainText('Image Resize');
    await expect(page.locator('.file-select-btn')).toBeVisible();
    
    // Test text tool
    await page.goto('/text/yaml');
    await expect(page.locator('.tool-container')).toBeVisible();
    await expect(page.locator('.tool-container h1')).toContainText('YAML Validator');
    await expect(page.locator('textarea')).toBeVisible();
  });
  
  // Test responsive UI for mobile
  test('responsive layout works on mobile viewports', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check homepage responsive elements
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    // Check the tool container or tool card instead
    await expect(page.locator('.tool-container')).toBeVisible();
    
    // Check that tool pages are responsive
    await page.goto('/video/resize');
    await expect(page.locator('.tool-container')).toBeVisible();
    await expect(page.locator('.file-select-btn')).toBeVisible();
    
    // Check footer is visible and properly formatted
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('.author-content')).toBeVisible();
  });
  
  // Test 404 page
  test('404 page appears for invalid routes', async ({ page }) => {
    await page.goto('/invalid-route');
    await expect(page.locator('.tool-container h1')).toContainText('Not Found');
    // Use a more specific selector for the home link
    await expect(page.locator('.tool-container a[href="/"]')).toBeVisible();
  });
  
  // Test error handling for a basic case
  test('displays error for incorrect tool path', async ({ page }) => {
    await page.goto('/video/nonexistent-tool');
    await expect(page).toHaveURL('/video/nonexistent-tool');
    // Accept "Not Found" instead of "Error" since that's how the site is actually built
    await expect(page.locator('.tool-container h1')).toContainText('Not Found');
    await expect(page.locator('main')).toContainText('does not exist');
  });
}); 