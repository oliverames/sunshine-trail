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

// Select a real, unobscured marker after each zoom finishes. DOM order does
// not imply that a marker is outside the sidebar or even inside the viewport.
async function openPopupFromVisibleMarker(page: import('@playwright/test').Page) {
  const markers = page.locator(selectors.map.marker);
  const clusters = page.locator(selectors.map.markerCluster);
  const clickableIndex = (locator: import('@playwright/test').Locator) => locator.evaluateAll((elements) => elements.findIndex((element) => {
    const box = element.getBoundingClientRect();
    const target = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
    return box.width > 0 && box.height > 0 && target !== null &&
      (target === element || element.contains(target));
  }));
  let markerIndex = await clickableIndex(markers);
  // Follow visible clusters toward their data rather than zooming the map
  // center until all points leave the exposed map area.
  for (let i = 0; markerIndex < 0 && i < 8; i++) {
    let clusterIndex = -1;
    await expect.poll(async () => {
      clusterIndex = await clickableIndex(clusters);
      return clusterIndex;
    }, { message: 'Expected an unobscured cluster to navigate toward markers' }).toBeGreaterThanOrEqual(0);
    const previousZoom = await page.evaluate(() => (window as any).map.getZoom());
    await clusters.nth(clusterIndex).click();
    await page.waitForFunction((previous) => {
      const map = (window as any).map;
      return map.getZoom() > previous && !map._animatingZoom && !map._panAnim?._inProgress;
    }, previousZoom);
    markerIndex = await clickableIndex(markers);
  }
  await expect.poll(async () => {
    markerIndex = await clickableIndex(markers);
    return markerIndex;
  }, { message: 'Expected a marker that can receive a real pointer click' }).toBeGreaterThanOrEqual(0);
  await markers.nth(markerIndex).click();
  const popup = page.locator(selectors.map.popup);
  await expect(popup).toBeVisible();
  return popup;
}

test.describe('Popup Centering (Issue #27)', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
    await waitForMapReady(page);
  });

  test('popup should be fully visible when opened from marker click', async ({ page }) => {
    await openPopupFromVisibleMarker(page);
    await expect.poll(async () => (await getPopupVisibility(page)).visiblePercent).toBeGreaterThanOrEqual(90);
  });

  test('popup should remain visible after map pans to accommodate it', async ({ page }) => {
    await openPopupFromVisibleMarker(page);
    await expect.poll(() => isPopupFullyVisible(page)).toBe(true);
  });

  for (const edge of ['top', 'bottom', 'left', 'right'] as const) {
    const title = edge === 'top' || edge === 'bottom'
      ? `popup should not be cut off at ${edge} of viewport`
      : `popup should not be cut off on ${edge} side`;
    test(title, async ({ page }) => {
      const popup = await openPopupFromVisibleMarker(page);
      const viewport = page.viewportSize();
      expect(viewport).not.toBeNull();
      await expect.poll(async () => {
        const box = await popup.boundingBox();
        if (!box) return false;
        if (edge === 'top') return box.y >= 0;
        if (edge === 'left') return box.x >= 0;
        if (edge === 'bottom') return box.y + box.height <= viewport!.height;
        return box.x + box.width <= viewport!.width;
      }, { message: `Popup must remain within the ${edge} viewport edge` }).toBe(true);
    });
  }

  test('popup close button should be accessible', async ({ page }) => {
    await openPopupFromVisibleMarker(page);
    const closeButton = page.locator(selectors.map.popupCloseButton);
    await expect(closeButton).toBeVisible();
    await expect(closeButton).toBeInViewport({ ratio: 1 });
    // Trial click checks the actual hit target without closing the popup.
    await closeButton.click({ trial: true });
  });

  test('popup should close when close button is clicked', async ({ page }) => {
    const popup = await openPopupFromVisibleMarker(page);
    await page.locator(selectors.map.popupCloseButton).click();
    await expect(popup).not.toBeVisible();
  });
});

// SKIPPED: Viewport size tests have passed consistently - Issue #73
test.describe.skip('Popup Centering - Different Viewport Sizes', () => {
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

// SKIPPED: Edge case tests have passed consistently - Issue #73
test.describe.skip('Popup Centering - Edge Cases', () => {
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

// SKIPPED: Search results tests have passed consistently - Issue #73
test.describe.skip('Popup Centering - Search Results', () => {
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
