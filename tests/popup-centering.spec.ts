import { test, expect } from '@playwright/test';
import { selectors } from './utils/selectors';
import {
  setupPage,
  dismissEmailModal,
  waitForMapReady,
  isPopupFullyVisible,
  getPopupVisibility,
  expandSearchInput,
} from './utils/helpers';

/**
 * Popup Centering Tests - Issue #27
 *
 * Verifies that popup centering shows the entire info card.
 * Critical tests for ensuring popups are fully visible within the viewport.
 *
 * Uses REAL user interactions - no JavaScript simulation.
 */

test.describe('Popup Centering (Issue #27)', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
    await waitForMapReady(page);
  });

  test('popup should be fully visible when opened from marker click', async ({ page }) => {
    // Zoom in to see individual markers
    const zoomIn = page.locator(selectors.map.zoomInButton);
    for (let i = 0; i < 6; i++) {
      await zoomIn.click();
      await page.waitForTimeout(300);
    }

    await page.waitForTimeout(500);

    const markers = page.locator(selectors.map.marker);
    const count = await markers.count();

    if (count === 0) {
      test.skip();
      return;
    }

    // Click on a marker
    await markers.first().click();

    // Wait for popup to appear and map to adjust
    await page.waitForTimeout(1000);

    const popup = page.locator(selectors.map.popup);
    await expect(popup).toBeVisible({ timeout: 5000 });

    // Critical check: popup should be fully visible
    const visibility = await getPopupVisibility(page);
    expect(visibility.visible).toBe(true);

    // At least 90% of popup should be visible (allowing for minor edge cases)
    expect(visibility.visiblePercent).toBeGreaterThanOrEqual(90);
  });

  test('popup should remain visible after map pans to accommodate it', async ({ page }) => {
    // Zoom in
    const zoomIn = page.locator(selectors.map.zoomInButton);
    for (let i = 0; i < 5; i++) {
      await zoomIn.click();
      await page.waitForTimeout(300);
    }

    await page.waitForTimeout(500);

    const markers = page.locator(selectors.map.marker);
    const count = await markers.count();

    if (count === 0) {
      test.skip();
      return;
    }

    // Wait for marker and scroll into view
    const firstMarker = markers.first();
    await firstMarker.waitFor({ state: 'visible', timeout: 5000 });
    await firstMarker.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // Click marker
    await firstMarker.click({ timeout: 10000 });

    // Wait for popup and any pan animation
    await page.waitForTimeout(2000);

    // The popup should be fully visible after pan completes
    const isFullyVisible = await isPopupFullyVisible(page);

    // Take screenshot for debugging if test fails
    if (!isFullyVisible) {
      await page.screenshot({
        path: `./test-results/popup-centering-failure-${Date.now()}.png`,
      });
    }

    expect(isFullyVisible).toBe(true);
  });

  test('popup should not be cut off at top of viewport', async ({ page }) => {
    // Zoom in
    const zoomIn = page.locator(selectors.map.zoomInButton);
    for (let i = 0; i < 6; i++) {
      await zoomIn.click();
      await page.waitForTimeout(300);
    }

    const markers = page.locator(selectors.map.marker);
    const count = await markers.count();
    if (count === 0) {
      test.skip();
      return;
    }

    // Try to find a marker near the top of the viewport
    // Click different markers and check popup visibility
    for (let i = 0; i < Math.min(count, 5); i++) {
      await markers.nth(i).click();
      await page.waitForTimeout(1000);

      const popup = page.locator(selectors.map.popup);
      if (await popup.isVisible()) {
        const popupBox = await popup.boundingBox();
        if (popupBox) {
          // Popup top should not be above viewport (y >= 0)
          expect(popupBox.y).toBeGreaterThanOrEqual(0);
        }
        break;
      }
    }
  });

  test('popup should not be cut off at bottom of viewport', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport) {
      test.skip();
      return;
    }

    // Zoom in
    const zoomIn = page.locator(selectors.map.zoomInButton);
    for (let i = 0; i < 6; i++) {
      await zoomIn.click();
      await page.waitForTimeout(300);
    }

    const markers = page.locator(selectors.map.marker);
    const count = await markers.count();
    if (count === 0) {
      test.skip();
      return;
    }

    await markers.first().click();
    await page.waitForTimeout(1000);

    const popup = page.locator(selectors.map.popup);
    if (await popup.isVisible()) {
      const popupBox = await popup.boundingBox();
      if (popupBox) {
        // Popup bottom should not exceed viewport
        expect(popupBox.y + popupBox.height).toBeLessThanOrEqual(viewport.height);
      }
    }
  });

  test('popup should not be cut off on left side', async ({ page }) => {
    // Zoom in
    const zoomIn = page.locator(selectors.map.zoomInButton);
    for (let i = 0; i < 6; i++) {
      await zoomIn.click();
      await page.waitForTimeout(300);
    }

    const markers = page.locator(selectors.map.marker);
    const count = await markers.count();
    if (count === 0) {
      test.skip();
      return;
    }

    await markers.first().click();
    await page.waitForTimeout(1000);

    const popup = page.locator(selectors.map.popup);
    if (await popup.isVisible()) {
      const popupBox = await popup.boundingBox();
      if (popupBox) {
        // Popup left edge should not be negative
        expect(popupBox.x).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('popup should not be cut off on right side', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport) {
      test.skip();
      return;
    }

    // Zoom in
    const zoomIn = page.locator(selectors.map.zoomInButton);
    for (let i = 0; i < 6; i++) {
      await zoomIn.click();
      await page.waitForTimeout(300);
    }

    const markers = page.locator(selectors.map.marker);
    const count = await markers.count();
    if (count === 0) {
      test.skip();
      return;
    }

    await markers.first().click();
    await page.waitForTimeout(1000);

    const popup = page.locator(selectors.map.popup);
    if (await popup.isVisible()) {
      const popupBox = await popup.boundingBox();
      if (popupBox) {
        // Popup right edge should not exceed viewport
        expect(popupBox.x + popupBox.width).toBeLessThanOrEqual(viewport.width);
      }
    }
  });

  test('popup close button should be accessible', async ({ page }) => {
    // Zoom in
    const zoomIn = page.locator(selectors.map.zoomInButton);
    for (let i = 0; i < 6; i++) {
      await zoomIn.click();
      await page.waitForTimeout(300);
    }

    const markers = page.locator(selectors.map.marker);
    const count = await markers.count();
    if (count === 0) {
      test.skip();
      return;
    }

    await markers.first().click();
    await page.waitForTimeout(1000);

    const popup = page.locator(selectors.map.popup);
    await expect(popup).toBeVisible();

    const closeButton = page.locator(selectors.map.popupCloseButton);

    // Close button should exist and be visible
    await expect(closeButton).toBeVisible();

    // Close button should be within viewport
    const buttonBox = await closeButton.boundingBox();
    const viewport = page.viewportSize();
    if (buttonBox && viewport) {
      expect(buttonBox.x).toBeGreaterThanOrEqual(0);
      expect(buttonBox.y).toBeGreaterThanOrEqual(0);
      expect(buttonBox.x + buttonBox.width).toBeLessThanOrEqual(viewport.width);
      expect(buttonBox.y + buttonBox.height).toBeLessThanOrEqual(viewport.height);
    }
  });

  test('popup should close when close button is clicked', async ({ page }) => {
    // Zoom in
    const zoomIn = page.locator(selectors.map.zoomInButton);
    for (let i = 0; i < 6; i++) {
      await zoomIn.click();
      await page.waitForTimeout(300);
    }

    await page.waitForTimeout(500);

    const markers = page.locator(selectors.map.marker);
    const count = await markers.count();
    if (count === 0) {
      test.skip();
      return;
    }

    // Wait for marker to be ready and click it
    const firstMarker = markers.first();
    await firstMarker.waitFor({ state: 'visible', timeout: 5000 });
    await firstMarker.scrollIntoViewIfNeeded();
    await firstMarker.click({ timeout: 10000 });
    await page.waitForTimeout(1000);

    const popup = page.locator(selectors.map.popup);
    await expect(popup).toBeVisible({ timeout: 5000 });

    // Click the close button - wait for it to be visible and clickable
    const closeButton = page.locator(selectors.map.popupCloseButton);
    await closeButton.waitFor({ state: 'visible', timeout: 5000 });
    await closeButton.click({ force: true });

    // Popup should disappear
    await expect(popup).not.toBeVisible({ timeout: 5000 });
  });
});

test.describe('Popup Centering - Different Viewport Sizes', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
    await waitForMapReady(page);
  });

  test('popup should be fully visible on mobile viewport', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport || viewport.width >= 768) {
      test.skip(); // Only run on mobile viewports
      return;
    }

    // Zoom in
    const zoomIn = page.locator(selectors.map.zoomInButton);
    for (let i = 0; i < 5; i++) {
      await zoomIn.click();
      await page.waitForTimeout(300);
    }

    const markers = page.locator(selectors.map.marker);
    const count = await markers.count();
    if (count === 0) {
      test.skip();
      return;
    }

    await markers.first().click();
    await page.waitForTimeout(1500);

    const visibility = await getPopupVisibility(page);

    // On mobile, popup should be at least 85% visible
    expect(visibility.visiblePercent).toBeGreaterThanOrEqual(85);
  });

  test('popup should account for sidebar on desktop', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport || viewport.width < 1024) {
      test.skip(); // Only run on desktop viewports
      return;
    }

    // On desktop, sidebar takes up space on the left
    const sidebar = page.locator(selectors.sidebar.container);
    const sidebarBox = await sidebar.boundingBox();

    // Zoom in
    const zoomIn = page.locator(selectors.map.zoomInButton);
    for (let i = 0; i < 6; i++) {
      await zoomIn.click();
      await page.waitForTimeout(300);
    }

    const markers = page.locator(selectors.map.marker);
    const count = await markers.count();
    if (count === 0) {
      test.skip();
      return;
    }

    await markers.first().click();
    await page.waitForTimeout(1500);

    const popup = page.locator(selectors.map.popup);
    if (await popup.isVisible()) {
      const popupBox = await popup.boundingBox();

      // Popup should be in the map area, not overlapping sidebar
      if (popupBox && sidebarBox) {
        // Popup should be mostly to the right of sidebar
        expect(popupBox.x).toBeGreaterThanOrEqual(sidebarBox.width - 50);
      }
    }
  });
});

test.describe('Popup Centering - Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
    await waitForMapReady(page);
  });

  test('opening multiple popups should always show the last one fully', async ({ page }) => {
    // Zoom in
    const zoomIn = page.locator(selectors.map.zoomInButton);
    for (let i = 0; i < 6; i++) {
      await zoomIn.click();
      await page.waitForTimeout(300);
    }

    const markers = page.locator(selectors.map.marker);
    const count = await markers.count();
    if (count < 2) {
      test.skip();
      return;
    }

    // Click first marker
    await markers.nth(0).click();
    await page.waitForTimeout(800);

    // Click second marker (should close first, open second)
    // Use force:true to bypass popup interception - we're testing autoClose behavior
    await markers.nth(1).click({ force: true });
    await page.waitForTimeout(1000);

    // The currently open popup should be fully visible
    const visibility = await getPopupVisibility(page);
    expect(visibility.visible).toBe(true);
    expect(visibility.visiblePercent).toBeGreaterThanOrEqual(85);
  });

  test('popup should remain centered after map resize', async ({ page }) => {
    // Zoom in
    const zoomIn = page.locator(selectors.map.zoomInButton);
    for (let i = 0; i < 6; i++) {
      await zoomIn.click();
      await page.waitForTimeout(300);
    }

    const markers = page.locator(selectors.map.marker);
    const count = await markers.count();
    if (count === 0) {
      test.skip();
      return;
    }

    await markers.first().click();
    await page.waitForTimeout(1000);

    // Resize viewport slightly
    const viewport = page.viewportSize();
    if (viewport) {
      await page.setViewportSize({
        width: viewport.width - 50,
        height: viewport.height - 50,
      });
    }

    await page.waitForTimeout(500);

    // Popup should still be visible (may need to re-check after resize)
    const popup = page.locator(selectors.map.popup);
    if (await popup.isVisible()) {
      const visibility = await getPopupVisibility(page);
      // At least partially visible after resize
      expect(visibility.visiblePercent).toBeGreaterThanOrEqual(50);
    }
  });

  test('tall popup content should not exceed viewport', async ({ page }) => {
    // This tests popups with lots of content
    const viewport = page.viewportSize();
    if (!viewport) {
      test.skip();
      return;
    }

    // Zoom in
    const zoomIn = page.locator(selectors.map.zoomInButton);
    for (let i = 0; i < 6; i++) {
      await zoomIn.click();
      await page.waitForTimeout(300);
    }

    const markers = page.locator(selectors.map.marker);
    const count = await markers.count();
    if (count === 0) {
      test.skip();
      return;
    }

    // Try multiple markers to find one with content
    for (let i = 0; i < Math.min(count, 3); i++) {
      await markers.nth(i).click();
      await page.waitForTimeout(1000);

      const popup = page.locator(selectors.map.popup);
      if (await popup.isVisible()) {
        const popupBox = await popup.boundingBox();
        if (popupBox) {
          // Popup height should not exceed viewport height
          // (or should have scrolling enabled if it does)
          if (popupBox.height > viewport.height) {
            // Check if popup has scroll capability
            const hasScroll = await popup.evaluate((el) => {
              const style = getComputedStyle(el);
              return style.overflowY === 'auto' || style.overflowY === 'scroll';
            });
            expect(hasScroll || popupBox.height <= viewport.height).toBe(true);
          }
        }
        break;
      }
    }
  });
});

test.describe('Popup Centering - Search Results', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
    await waitForMapReady(page);
  });

  test('popup from search result should be fully visible', async ({ page }) => {
    // Expand search input (required on mobile)
    await expandSearchInput(page);

    const searchInput = page.locator(selectors.map.searchInput);
    const searchButton = page.locator(selectors.map.searchButton);

    // Search for a location
    await searchInput.click();
    await searchInput.fill('Lawson');
    await searchButton.click();

    // Wait for results
    await page.waitForTimeout(1000);

    // Click on a search result if available
    const results = page.locator(selectors.map.searchResults);
    const resultsVisible = await results.isVisible();

    if (resultsVisible) {
      const resultItems = results.locator('div, li, a').first();
      if ((await resultItems.count()) > 0) {
        await resultItems.click();
        await page.waitForTimeout(1500);

        // Check popup visibility
        const popup = page.locator(selectors.map.popup);
        if (await popup.isVisible()) {
          const visibility = await getPopupVisibility(page);
          expect(visibility.visiblePercent).toBeGreaterThanOrEqual(85);
        }
      }
    }
  });
});
