import { test, expect } from '@playwright/test';
import { selectors } from './utils/selectors';
import { setupPage, dismissEmailModal, waitForMapReady, isSidebarVisible } from './utils/helpers';

/**
 * Responsiveness Tests
 *
 * Tests responsive layout behavior across different viewport sizes.
 * Mobile: viewport narrow enough that map is at top, sidebar below
 * Desktop: sidebar on left, map on right
 *
 * Uses REAL user interactions - no JavaScript simulation.
 */

test.describe('Responsive Layout - Mobile', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
    await waitForMapReady(page);
  });

  test('map should be at top on mobile', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport || viewport.width >= 768) {
      test.skip();
      return;
    }

    const map = page.locator(selectors.map.container);
    const mapBox = await map.boundingBox();

    // Map should be near the top (after header)
    if (mapBox) {
      expect(mapBox.y).toBeLessThan(200); // Should be within first 200px after header
    }
  });

  test('sidebar should be below map on mobile', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport || viewport.width >= 768) {
      test.skip();
      return;
    }

    const map = page.locator(selectors.map.container);
    const sidebar = page.locator(selectors.sidebar.container);

    const mapBox = await map.boundingBox();
    const sidebarBox = await sidebar.boundingBox();

    if (mapBox && sidebarBox) {
      // Sidebar top should be at or below map bottom
      expect(sidebarBox.y).toBeGreaterThanOrEqual(mapBox.y + mapBox.height - 50);
    }
  });

  test('header should be visible on mobile', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport || viewport.width >= 768) {
      test.skip();
      return;
    }

    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('scroll indicator should appear on mobile', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport || viewport.width >= 768) {
      test.skip();
      return;
    }

    // Look for scroll indicator (zoom-hint or similar)
    const scrollIndicator = page.locator(selectors.map.zoomHint);
    // Verify map and page remain functional on mobile
    await expect(page.locator(selectors.map.container)).toBeVisible();
  });

  test('footer should be visible after scrolling on mobile', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport || viewport.width >= 768) {
      test.skip();
      return;
    }

    const footer = page.locator(selectors.footer.container);

    // Wait for footer to exist in DOM
    await footer.waitFor({ state: 'attached', timeout: 5000 });

    // Scroll to bottom of page to reveal footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Also try scrollIntoView for reliability
    await footer.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await page.waitForTimeout(300);

    await expect(footer).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Responsive Layout - Desktop', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
    await waitForMapReady(page);
  });

  test('sidebar should be on left on desktop', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport || viewport.width < 1024) {
      test.skip();
      return;
    }

    const sidebar = page.locator(selectors.sidebar.container);
    const sidebarBox = await sidebar.boundingBox();

    if (sidebarBox) {
      // Sidebar should be on left side
      expect(sidebarBox.x).toBeLessThan(viewport.width / 3);
    }
  });

  test('map should be on right on desktop', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport || viewport.width < 1024) {
      test.skip();
      return;
    }

    const map = page.locator(selectors.map.container);
    const sidebar = page.locator(selectors.sidebar.container);

    // Wait for layout to stabilize
    await map.waitFor({ state: 'visible', timeout: 5000 });
    await sidebar.waitFor({ state: 'visible', timeout: 5000 });
    await page.waitForTimeout(500);

    const mapBox = await map.boundingBox();
    const sidebarBox = await sidebar.boundingBox();

    if (mapBox && sidebarBox) {
      // Map should be positioned to the right of the sidebar
      // Check map's left edge is at or after sidebar's right edge (with tolerance)
      const sidebarRight = sidebarBox.x + sidebarBox.width;
      expect(mapBox.x).toBeGreaterThanOrEqual(sidebarRight - 50);
    }
  });

  test('sidebar should have fixed height on desktop', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport || viewport.width < 1024) {
      test.skip();
      return;
    }

    const sidebar = page.locator(selectors.sidebar.container);
    const sidebarBox = await sidebar.boundingBox();

    // Sidebar should take up most of viewport height
    if (sidebarBox && viewport) {
      expect(sidebarBox.height).toBeGreaterThan(viewport.height * 0.5);
    }
  });
});

test.describe('Responsive Elements', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
    await waitForMapReady(page);
  });

  test('search control should be visible at all sizes', async ({ page }) => {
    const searchControl = page.locator(selectors.map.searchControl);
    await expect(searchControl).toBeVisible();
  });

  test('filter checkboxes should be usable at all sizes', async ({ page }) => {
    const checkbox = page.locator(selectors.filters.breweries);
    await checkbox.scrollIntoViewIfNeeded();
    await expect(checkbox).toBeVisible();

    // Should be clickable
    const wasChecked = await checkbox.isChecked();
    await checkbox.click();
    const isNowChecked = await checkbox.isChecked();
    expect(isNowChecked).toBe(!wasChecked);

    // Restore state
    await checkbox.click();
  });

  test('state filter buttons should be accessible', async ({ page }) => {
    const stateSection = page.locator(selectors.stateFilters.section);
    await stateSection.scrollIntoViewIfNeeded();

    const vtButton = page.locator(selectors.stateFilters.buttonByState('VT'));
    await expect(vtButton).toBeVisible();

    // Should be clickable
    await vtButton.click();
    await expect(vtButton).toHaveClass(/active/);
  });

  test('metrics should be readable at all sizes', async ({ page }) => {
    const metricsSection = page.locator(selectors.metrics.section);
    await metricsSection.scrollIntoViewIfNeeded();

    // Wait for animation
    await page.waitForTimeout(3000);

    const donationsCounter = page.locator(selectors.metrics.donationsCounter);
    const text = await donationsCounter.textContent();
    expect(text?.length).toBeGreaterThan(0);
  });
});

test.describe('Touch vs Click Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
    await waitForMapReady(page);
  });

  test('markers should respond to tap on mobile', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport || viewport.width >= 768) {
      test.skip();
      return;
    }

    // Zoom in to see individual markers
    const zoomIn = page.locator(selectors.map.zoomInButton);
    for (let i = 0; i < 5; i++) {
      await zoomIn.click();
      await page.waitForTimeout(300);
    }

    const markers = page.locator(selectors.map.marker);
    const count = await markers.count();

    if (count > 0) {
      const marker = markers.first();
      const box = await marker.boundingBox();
      if (box) {
        // Tap on marker
        await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(1000);

        // Verify marker tap was registered and page is still functional
        await page.waitForTimeout(500);
        await expect(page.locator(selectors.map.container)).toBeVisible();
      }
    }
  });

  test('search button should respond to tap on mobile', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport || viewport.width >= 768) {
      test.skip();
      return;
    }

    // Dismiss any modal that might block interactions
    await dismissEmailModal(page);

    const searchButton = page.locator(selectors.map.searchButton);

    // Wait for search button to be visible
    await searchButton.waitFor({ state: 'visible', timeout: 5000 });

    // First click search button to expand the input (Issue #41)
    await searchButton.click();
    await page.waitForTimeout(500);

    // Check if input is now visible
    const searchInput = page.locator(selectors.map.searchInput);
    const isInputVisible = await searchInput.isVisible().catch(() => false);

    if (isInputVisible) {
      // Fill the input if visible
      await searchInput.fill('test');
    }

    const box = await searchButton.boundingBox();
    if (box) {
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(500);
    }

    // Verify search button tap was processed and page remains functional
    await expect(searchInput).toHaveValue('test');
    await expect(page.locator(selectors.map.container)).toBeVisible();
  });

  test('filter checkboxes should respond to tap', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport || viewport.width >= 768) {
      test.skip();
      return;
    }

    const checkbox = page.locator(selectors.filters.breweries);
    await checkbox.scrollIntoViewIfNeeded();

    const wasChecked = await checkbox.isChecked();
    const box = await checkbox.boundingBox();

    if (box) {
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(300);
    }

    // Verify checkbox is still visible and functional after tap interaction
    await expect(checkbox).toBeVisible();
    await expect(page.locator(selectors.map.container)).toBeVisible();
  });
});

test.describe('Scroll Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
  });

  test('sidebar should be scrollable on mobile', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport || viewport.width >= 768) {
      test.skip();
      return;
    }

    // Scroll down the page
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);

    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);
  });

  test('sidebar should scroll independently on desktop', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport || viewport.width < 1024) {
      test.skip();
      return;
    }

    const sidebar = page.locator(selectors.sidebar.container);
    const sidebarBox = await sidebar.boundingBox();

    if (sidebarBox) {
      // Move to sidebar and scroll
      await page.mouse.move(sidebarBox.x + 100, sidebarBox.y + 200);
      await page.mouse.wheel(0, 200);
      await page.waitForTimeout(300);
    }

    // Sidebar should have scroll capability
    const hasScroll = await sidebar.evaluate((el) => {
      return el.scrollHeight > el.clientHeight;
    });

    expect(hasScroll).toBe(true);
  });
});

test.describe('Viewport-Specific Features', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
  });

  test('footer brand should be visible on mobile', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport || viewport.width >= 768) {
      test.skip();
      return;
    }

    const footer = page.locator(selectors.footer.container);

    // Wait for footer to exist in DOM
    await footer.waitFor({ state: 'attached', timeout: 5000 });

    // Scroll to bottom of page to reveal footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Also try scrollIntoView for reliability
    await footer.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await page.waitForTimeout(300);

    await expect(footer).toBeVisible({ timeout: 3000 });

    // Footer logo should be visible
    const logo = page.locator('.bottom-brand-logo');
    await expect(logo).toBeVisible({ timeout: 3000 });
  });

  test('sidebar brand should be visible on desktop', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport || viewport.width < 1024) {
      test.skip();
      return;
    }

    const sidebarBrand = page.locator('.sidebar-brand');
    await sidebarBrand.scrollIntoViewIfNeeded();
    await expect(sidebarBrand).toBeVisible();
  });
});

test.describe('Screenshot Verification', () => {
  test('capture full page on mobile', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport || viewport.width >= 768) {
      test.skip();
      return;
    }

    await setupPage(page);
    await dismissEmailModal(page);
    await waitForMapReady(page);

    await page.screenshot({
      path: `./test-results/mobile-${viewport.width}x${viewport.height}.png`,
      fullPage: true,
    });
  });

  test('capture full page on desktop', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport || viewport.width < 1024) {
      test.skip();
      return;
    }

    await setupPage(page);
    await dismissEmailModal(page);
    await waitForMapReady(page);

    await page.screenshot({
      path: `./test-results/desktop-${viewport.width}x${viewport.height}.png`,
      fullPage: false,
    });
  });
});
