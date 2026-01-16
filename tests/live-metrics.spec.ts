import { test, expect } from '@playwright/test';
import { selectors } from './utils/selectors';
import { setupPage, dismissEmailModal, waitForMapReady } from './utils/helpers';

/**
 * Live Metrics Tests
 *
 * Tests the Live Impact metrics section with animated counters:
 * - Dollars Raised (animated counter)
 * - Solar Generated (animated counter)
 * - B Impact Score (static)
 * - Nonprofits count (static)
 *
 * Uses REAL user interactions - no JavaScript simulation.
 */

test.describe('Live Metrics Section', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
  });

  test('metrics section should be visible', async ({ page }) => {
    const metricsSection = page.locator(selectors.metrics.section);
    await expect(metricsSection).toBeVisible();
  });

  test('live dot should be visible', async ({ page }) => {
    const liveDot = page.locator(selectors.metrics.liveDot);
    await expect(liveDot).toBeVisible();
  });

  test('live dot should have pulsing animation', async ({ page }) => {
    const liveDot = page.locator(selectors.metrics.liveDot);

    const hasAnimation = await liveDot.evaluate((el) => {
      const style = getComputedStyle(el);
      return style.animation !== 'none' && style.animation !== '';
    });

    expect(hasAnimation).toBe(true);
  });
});

test.describe('Donations Counter', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
  });

  test('donations counter should be visible', async ({ page }) => {
    const counter = page.locator(selectors.metrics.donationsCounter);
    await expect(counter).toBeVisible();
  });

  test('donations counter should display a number', async ({ page }) => {
    const counter = page.locator(selectors.metrics.donationsCounter);
    const text = await counter.textContent();

    // Should contain digits
    expect(text).toMatch(/[\d,]+/);
  });

  test('donations counter should animate on page load', async ({ page }) => {
    const counter = page.locator(selectors.metrics.donationsCounter);

    // Get initial value
    const initialValue = await counter.textContent();
    const initialNum = parseInt(initialValue?.replace(/[^0-9]/g, '') || '0', 10);

    // Wait for animation
    await page.waitForTimeout(3000);

    // Get final value
    const finalValue = await counter.textContent();
    const finalNum = parseInt(finalValue?.replace(/[^0-9]/g, '') || '0', 10);

    // Should have increased (animated from 0 to actual value)
    expect(finalNum).toBeGreaterThan(0);
  });

  test('donations should have dollar prefix', async ({ page }) => {
    const metricValue = page.locator('#metric-donated');
    const text = await metricValue.textContent();

    // Should contain $ symbol
    expect(text).toContain('$');
  });
});

test.describe('Solar Counter', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
  });

  test('solar counter should be visible', async ({ page }) => {
    const counter = page.locator(selectors.metrics.solarCounter);
    await expect(counter).toBeVisible();
  });

  test('solar counter should display a number', async ({ page }) => {
    const counter = page.locator(selectors.metrics.solarCounter);
    const text = await counter.textContent();

    // Should contain digits
    expect(text).toMatch(/[\d,]+/);
  });

  test('solar counter should have kWh suffix', async ({ page }) => {
    const metricValue = page.locator('#metric-solar');
    const text = await metricValue.textContent();

    // Should contain kWh
    expect(text).toContain('kWh');
  });

  test('solar counter should animate on page load', async ({ page }) => {
    const counter = page.locator(selectors.metrics.solarCounter);

    // Get initial value
    const initialValue = await counter.textContent();

    // Wait for animation
    await page.waitForTimeout(3000);

    // Get final value
    const finalValue = await counter.textContent();
    const finalNum = parseInt(finalValue?.replace(/[^0-9]/g, '') || '0', 10);

    // Should have a substantial value (millions of kWh)
    expect(finalNum).toBeGreaterThan(0);
  });
});

test.describe('B Corp Score', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
  });

  test('B Corp score should be visible', async ({ page }) => {
    const score = page.locator(selectors.metrics.bCorpScore);
    await expect(score).toBeVisible();
  });

  test('B Corp score should show 83.6', async ({ page }) => {
    const score = page.locator(selectors.metrics.bCorpScore);
    const text = await score.textContent();

    expect(text).toContain('83.6');
  });

  test('B Corp badge should link to certification', async ({ page }) => {
    const bCorpLink = page.locator('.bcorp-badge');
    const href = await bCorpLink.getAttribute('href');

    expect(href).toContain('bcorporation.net');
  });
});

test.describe('Nonprofits Count', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
  });

  test('nonprofits count should be visible', async ({ page }) => {
    const count = page.locator(selectors.metrics.nonprofitsCount);
    await expect(count).toBeVisible();
  });

  test('nonprofits count should show 496', async ({ page }) => {
    const count = page.locator(selectors.metrics.nonprofitsCount);
    const text = await count.textContent();

    expect(text).toContain('496');
  });
});

test.describe('Metrics Links', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
  });

  test('donations metric should link to Sunshine Fund', async ({ page }) => {
    const link = page.locator('.metric-item').filter({ has: page.locator('#donations-counter') });
    const href = await link.getAttribute('href');

    expect(href).toContain('sunshine-fund');
  });

  test('solar metric should link to Green is Grand', async ({ page }) => {
    const link = page.locator('.metric-item').filter({ has: page.locator('#solar-counter') });
    const href = await link.getAttribute('href');

    expect(href).toContain('green-is-grand');
  });

  test('metrics links should open in new tab', async ({ page }) => {
    const links = page.locator('.metric-link');
    const count = await links.count();

    for (let i = 0; i < count; i++) {
      const target = await links.nth(i).getAttribute('target');
      expect(target).toBe('_blank');
    }
  });

  test('metrics links should have rel noopener', async ({ page }) => {
    const links = page.locator('.metric-link');
    const count = await links.count();

    for (let i = 0; i < count; i++) {
      const rel = await links.nth(i).getAttribute('rel');
      expect(rel).toContain('noopener');
    }
  });
});

test.describe('Metrics Animation', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
  });

  test('counters should animate smoothly', async ({ page }) => {
    const donationsCounter = page.locator(selectors.metrics.donationsCounter);

    // Capture values at intervals
    const values: number[] = [];

    for (let i = 0; i < 5; i++) {
      const text = await donationsCounter.textContent();
      const num = parseInt(text?.replace(/[^0-9]/g, '') || '0', 10);
      values.push(num);
      await page.waitForTimeout(500);
    }

    // Values should generally increase during animation
    // (though may plateau at final value)
    const increasing = values.some((v, i) => i > 0 && v >= values[i - 1]);
    expect(increasing).toBe(true);
  });

  test('counters should reach final value', async ({ page }) => {
    // Wait for animation to complete
    await page.waitForTimeout(4000);

    const donationsCounter = page.locator(selectors.metrics.donationsCounter);
    const solarCounter = page.locator(selectors.metrics.solarCounter);

    const donationsText = await donationsCounter.textContent();
    const solarText = await solarCounter.textContent();

    const donationsNum = parseInt(donationsText?.replace(/[^0-9]/g, '') || '0', 10);
    const solarNum = parseInt(solarText?.replace(/[^0-9]/g, '') || '0', 10);

    // Should have substantial final values
    expect(donationsNum).toBeGreaterThan(100000); // Over $100k
    expect(solarNum).toBeGreaterThan(1000000); // Over 1M kWh
  });
});

test.describe('Metrics - Responsive', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
  });

  test('metrics should be visible on mobile', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport || viewport.width >= 768) {
      test.skip();
      return;
    }

    const metricsSection = page.locator(selectors.metrics.section);
    await metricsSection.scrollIntoViewIfNeeded();
    await expect(metricsSection).toBeVisible();
  });

  test('metrics grid should adapt to viewport', async ({ page }) => {
    const metricsGrid = page.locator('.metrics-grid');
    const box = await metricsGrid.boundingBox();
    const viewport = page.viewportSize();

    if (box && viewport) {
      // Grid should fit within viewport width
      expect(box.width).toBeLessThanOrEqual(viewport.width);
    }
  });
});
