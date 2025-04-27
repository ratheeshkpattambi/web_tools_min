// @ts-check
import { test, expect } from '@playwright/test';
import { tools, categories } from '../src/common/metadata.js';

test.describe('SafeWebTool Tests', () => {
  // Basic navigation tests
  test('homepage navigation and elements', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('SafeWebTool');
    await expect(page.locator('.logo')).toBeVisible();
    await expect(page.locator('header h1')).toContainText('SafeWebTool');
    await expect(page.locator('nav a[href="/"]')).toBeVisible();
    await expect(page.locator('.author-avatar')).toBeVisible();
    await expect(page.locator('.author-content')).toContainText('Dr. Ratheesh Kalarot');
  });
  
  // Auto-generate tests for all tool pages
  for (const [toolPath, toolInfo] of Object.entries(tools)) {
    test(`tool: ${toolInfo.name}`, async ({ page }) => {
      await page.goto(`/${toolPath}`);
      await expect(page.locator('.tool-container')).toBeVisible();
      await expect(page.locator('.tool-container h1')).toContainText(toolInfo.name);
      
      if (toolPath.startsWith('video/') || toolPath.startsWith('image/')) {
        await expect(page.locator('.file-select-btn')).toBeVisible();
      }
      
      if (toolPath.startsWith('text/')) {
        await expect(page.locator('textarea')).toBeVisible();
      }
    });
  }
  
  // Auto-generate tests for category pages
  for (const [categoryId, categoryInfo] of Object.entries(categories)) {
    test(`category: ${categoryInfo.name}`, async ({ page }) => {
      await page.goto(`/${categoryId}`);
      await expect(page.locator('.tool-container')).toBeVisible();
      await expect(page.locator('.tool-container h1')).toContainText(categoryInfo.name);
    });
  }
  
  // Responsive tests - desktop and mobile
  test('responsive design', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('.tool-container')).toBeVisible();
    
    // Test a tool page on mobile
    const firstToolPath = Object.keys(tools)[0];
    await page.goto(`/${firstToolPath}`);
    await expect(page.locator('.tool-container')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });
  
  // Error pages
  test('404 page', async ({ page }) => {
    await page.goto('/invalid-route');
    await expect(page.locator('.tool-container h1')).toContainText('Not Found');
    await expect(page.locator('.tool-container a[href="/"]')).toBeVisible();
  });
  
  // SEO tests
  test('homepage metadata', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('SafeWebTool');
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDescription).not.toBeNull();
  });
  
  // Generate metadata tests for tools
  for (const [toolPath, toolInfo] of Object.entries(tools)) {
    test(`metadata: ${toolInfo.name}`, async ({ page }) => {
      await page.goto(`/${toolPath}`);
      
      // Skip title check as it might not change on all pages
      const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
      expect(metaDescription).not.toBeNull();
      
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
      expect(ogTitle).not.toBeNull();
    });
  }
  
  // Sitemap test
  test('sitemap', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response).not.toBeNull();
    expect(response?.status()).toBe(200);
    const content = await page.content();
    expect(content).toContain('urlset');
    
    // Check for tool and category paths
    for (const toolPath of Object.keys(tools)) {
      const [category, toolId] = toolPath.split('/');
      expect(content).toContain(category);
      expect(content).toContain(toolId);
    }
  });
}); 