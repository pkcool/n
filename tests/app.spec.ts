import { test, expect } from '@playwright/test';

test.describe('Neural Network Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002');
    // Wait until the network is idle, a strong signal that client-side rendering is complete.
    await page.waitForLoadState('networkidle');
  });

  test('should render the neural network diagram', async ({ page }) => {
    // Wait for the main visualization container
    const visualization = page.locator('#nn-visualization');
    await expect(visualization).toBeVisible();

    // Wait for the SVG element to be rendered
    const svg = visualization.locator('svg');
    await expect(svg).toBeVisible();

    // Wait for the first node to appear
    const firstNode = visualization.locator('.nn-node').first();
    await expect(firstNode).toBeVisible();

    // Wait for the first weight label to appear
    const firstWeightLabel = visualization.locator('.nn-weight-label').first();
    await expect(firstWeightLabel).toBeVisible();
  });

  test('should render the stepper component', async ({ page }) => {
    await expect(page.locator('#stepper')).toBeVisible();
    await expect(page.locator('text=Step 1 of 26')).toBeVisible();
  });

  test('should render KaTeX math formulas', async ({ page }) => {
    // The first step should have a formula
    await expect(page.locator('.katex')).toBeVisible();
  });

  test('should navigate through steps', async ({ page }) => {
    await expect(page.locator('h3')).toHaveText('Forward Pass: Calculate Hidden Layer Net Input');
    
    // Click next
    await page.click('button:has-text("Next")');

    // Verify step 2 content
    await expect(page.locator('text=Step 2 of 26')).toBeVisible();
    await expect(page.locator('h3')).toHaveText('Forward Pass: Calculate Hidden Layer Output');
  });

  test('should render the summary chart', async ({ page }) => {
    await expect(page.locator('#summary-chart')).toBeVisible();
    await expect(page.locator('#summary-chart canvas')).toBeVisible();
  });
});
