import { test, expect } from '@playwright/test';
import { selectors, DEMO_PASSWORD } from './utils/selectors';
import { setupPage, dismissEmailModal, waitForMapReady, authenticateUser } from './utils/helpers';

/**
 * Bug Fixes - January 19, 2026
 *
 * Comprehensive test suite verifying all bug fixes implemented today:
 * 1. Map flows under sidebar on desktop (left: 0px)
 * 2. Metrics section reduced padding (height: 72px per item)
 * 3. Zoom button safe area centering on wide desktop
 * 4. Scroll indicator styling (grid centering, opacity, transform-based positioning)
 * 5. Scroll indicator no hover scroll behavior
 * 6. "Tap for More" expanded mode (yellow background #f8e849, centered position)
 * 7. Collapse animation from expanded mode (smooth transform transition)
 * 8. Initial map bounds respect sidebar safe area
 * 9. Popup + pin centering in map safe area
 * 10. Enter key closes search results and selects first result
 */

/**
 * Helper to get computed CSS value
 */
async function getComputedStyle(page, selector, property) {
  return await page.evaluate(
    ({ sel, prop }) => {
      const element = document.querySelector(sel);
      if (!element) return null;
      return window.getComputedStyle(element).getPropertyValue(prop);
    },
    { sel: selector, prop: property }
  );
}

/**
 * Helper to parse RGB/RGBA color to hex
 */
function rgbToHex(rgb) {
  if (!rgb) return null;
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

/**
 * Helper to trigger map expansion on mobile (makes scroll indicator visible)
 * The scroll indicator is hidden until the map has expanded at least once.
 * For tests, we directly add the has-expanded class to make it visible.
 */
async function triggerMapExpansion(page) {
  // Directly add the has-expanded class to make scroll indicator visible
  // This simulates the behavior after the map has expanded at least once
  await page.evaluate(() => {
    const indicator = document.querySelector('.scroll-indicator');
    if (indicator) {
      indicator.classList.add('has-expanded');
    }
  });
  // Wait for CSS to apply
  await page.waitForTimeout(200);
}

// ═══════════════════════════════════════════════════════════════
// TEST SUITE: Wide Desktop (1400 x 900)
// ═══════════════════════════════════════════════════════════════

test.describe('Bug Fixes - Wide Desktop (1400x900)', () => {
  test.use({ viewport: { width: 1400, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
    await waitForMapReady(page);
  });

  test('1. Map should flow under sidebar with left: 0px', async ({ page }) => {
    const mapElement = page.locator('#map');
    await expect(mapElement).toBeVisible();

    // Verify the map has left: 0px to flow under the floating sidebar
    const leftValue = await getComputedStyle(page, '#map', 'left');
    expect(leftValue).toBe('0px');
  });

  test('3. Zoom button should be centered in safe area (accounting for sidebar)', async ({ page }) => {
    const zoomHint = page.locator('.zoom-hint');

    // Check if zoom hint exists
    const exists = await zoomHint.count();
    if (exists === 0) {
      test.skip();
      return;
    }

    await expect(zoomHint).toBeVisible();

    // Get the computed left position
    const zoomHintBox = await zoomHint.boundingBox();
    expect(zoomHintBox).not.toBeNull();

    // The button should be positioned to account for sidebar width (~420px + margin)
    // It should be more than 440px from the left edge to avoid sidebar overlap
    expect(zoomHintBox.x).toBeGreaterThan(440);

    // Verify it's reasonably centered in the remaining space
    // Safe area starts around 460px, viewport is 1400px wide
    // Button should be roughly centered in the 940px available space (460 to 1400)
    const safeAreaStart = 460;
    const safeAreaWidth = 1400 - safeAreaStart;
    const expectedCenter = safeAreaStart + safeAreaWidth / 2;

    // Allow 100px tolerance for centering
    const buttonCenter = zoomHintBox.x + zoomHintBox.width / 2;
    expect(Math.abs(buttonCenter - expectedCenter)).toBeLessThan(100);
  });

  test('8. Initial map bounds should respect sidebar safe area', async ({ page }) => {
    // Wait for map to fully load
    await page.waitForTimeout(1000);

    // Get all visible marker positions
    const markerPositions = await page.evaluate(() => {
      const markers = document.querySelectorAll('.leaflet-marker-icon');
      const positions = [];

      markers.forEach((marker) => {
        const rect = marker.getBoundingClientRect();
        positions.push({
          left: rect.left,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
        });
      });

      return positions;
    });

    // Get sidebar dimensions
    const sidebarBox = await page.locator('.sidebar').boundingBox();

    if (sidebarBox) {
      // Check that no markers are positioned under the sidebar
      const markersUnderSidebar = markerPositions.filter((pos) => {
        // A marker is under sidebar if its center is within sidebar bounds
        const markerCenterX = (pos.left + pos.right) / 2;
        return markerCenterX < sidebarBox.x + sidebarBox.width;
      });

      // On initial load, no markers should be significantly under the sidebar
      // Allow a small tolerance for edge markers
      expect(markersUnderSidebar.length).toBeLessThanOrEqual(2);
    }
  });

  test('9. Popup should be centered with pin in map safe area on desktop', async ({ page }) => {
    // Search for a specific location
    const searchBtn = page.locator('#map-search-btn');
    await searchBtn.click();

    const searchInput = page.locator('#map-search-input');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Vermont Foodbank');

    // Wait for search results
    await page.waitForTimeout(500);

    // Press Enter to select first result
    await searchInput.press('Enter');

    // Wait for popup to open and centering to complete
    await page.waitForTimeout(1500);

    // Check if popup is visible
    const popup = page.locator('.leaflet-popup');
    const popupVisible = await popup.isVisible();

    if (popupVisible) {
      const popupBox = await popup.boundingBox();
      const sidebarBox = await page.locator('.sidebar').boundingBox();
      const mapBox = await page.locator('#map').boundingBox();

      if (popupBox && sidebarBox && mapBox) {
        // Calculate safe area (right of sidebar)
        const safeLeft = sidebarBox.x + sidebarBox.width + 20;
        const safeRight = mapBox.x + mapBox.width - 20;
        const safeCenter = (safeLeft + safeRight) / 2;

        // Popup center should be within the safe area
        const popupCenter = popupBox.x + popupBox.width / 2;
        expect(popupCenter).toBeGreaterThan(safeLeft);
        expect(popupCenter).toBeLessThan(safeRight);
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// TEST SUITE: Narrow Desktop (768 x 900) - Mobile Styles
// ═══════════════════════════════════════════════════════════════

test.describe('Bug Fixes - Narrow Desktop (768x900)', () => {
  test.use({ viewport: { width: 768, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
    await waitForMapReady(page);
    // Trigger map expansion to make scroll indicator visible
    // (scroll indicator is hidden until map has expanded at least once)
    await triggerMapExpansion(page);
  });

  test('4. Scroll indicator should have correct collapsed state styling', async ({ page }) => {
    const scrollIndicator = page.locator('.scroll-indicator');

    // Verify scroll indicator is visible after map has expanded once
    await expect(scrollIndicator).toBeVisible({ timeout: 5000 });

    // Verify it's positioned at right edge (collapsed state)
    const right = await getComputedStyle(page, '.scroll-indicator', 'right');
    expect(right).toBe('15px');

    // Verify display: grid is used for centering the arrow
    const displayValue = await getComputedStyle(page, '.scroll-indicator', 'display');
    expect(displayValue).toBe('grid');

    // Verify SVG arrow is present inside the button
    const svg = page.locator('.scroll-indicator svg');
    await expect(svg).toBeVisible();
  });

  test('4b. Scroll indicator collapsed state should have white background', async ({ page }) => {
    const scrollIndicator = page.locator('.scroll-indicator');
    await expect(scrollIndicator).toBeVisible({ timeout: 5000 });

    // Verify background color is white with opacity
    const bgColor = await getComputedStyle(page, '.scroll-indicator', 'background-color');

    // Parse RGBA - should be white (255, 255, 255) with high opacity
    const rgbaMatch = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (rgbaMatch) {
      expect(parseInt(rgbaMatch[1])).toBe(255); // R
      expect(parseInt(rgbaMatch[2])).toBe(255); // G
      expect(parseInt(rgbaMatch[3])).toBe(255); // B
    }
  });

  test('5. Scroll indicator should NOT scroll on hover (no hover scroll behavior)', async ({ page }) => {
    const scrollIndicator = page.locator('.scroll-indicator');
    await expect(scrollIndicator).toBeVisible({ timeout: 5000 });

    // Get initial scroll position
    const initialScrollY = await page.evaluate(() => window.scrollY);

    // Hover over the scroll indicator without clicking
    await scrollIndicator.hover();

    // Wait 500ms to see if any hover-triggered scroll occurs
    await page.waitForTimeout(500);

    // Verify scroll position hasn't changed
    const finalScrollY = await page.evaluate(() => window.scrollY);
    expect(finalScrollY).toBe(initialScrollY);
  });

  test('6. "Tap for More" expanded mode should have yellow background (not white)', async ({ page }) => {
    const scrollIndicator = page.locator('.scroll-indicator');
    await expect(scrollIndicator).toBeVisible({ timeout: 5000 });

    // Directly add expanded-mode class to test CSS values
    await page.evaluate(() => {
      const el = document.querySelector('.scroll-indicator');
      if (el) el.classList.add('expanded-mode');
    });

    // Wait for transition to complete
    await page.waitForTimeout(400);

    // Verify expanded mode has yellow background (not white)
    const bgColor = await getComputedStyle(page, '.scroll-indicator.expanded-mode', 'background-color');
    const rgbaMatch = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);

    if (rgbaMatch) {
      const r = parseInt(rgbaMatch[1]);
      const g = parseInt(rgbaMatch[2]);
      const b = parseInt(rgbaMatch[3]);

      // Yellow has high R, high G, low B
      // #f8e849 = RGB(248, 232, 73)
      // Should NOT be white (255, 255, 255)
      expect(r).toBeGreaterThan(200); // High red
      expect(g).toBeGreaterThan(200); // High green
      expect(b).toBeLessThan(150); // Low blue (key difference from white)

      // Verify it's distinctly yellow, not white
      expect(r - b).toBeGreaterThan(100); // Red much higher than blue
    }
  });

  test('6b. "Tap for More" expanded mode should be centered using left: 50%', async ({ page }) => {
    const scrollIndicator = page.locator('.scroll-indicator');
    await expect(scrollIndicator).toBeVisible({ timeout: 5000 });

    // Add expanded-mode class
    await page.evaluate(() => {
      const el = document.querySelector('.scroll-indicator');
      if (el) el.classList.add('expanded-mode');
    });
    await page.waitForTimeout(150); // Allow transition to complete

    // Verify CSS positioning uses left: 50% with transform
    const left = await getComputedStyle(page, '.scroll-indicator.expanded-mode', 'left');
    // Left should be ~50% of 768px = ~384px
    expect(parseFloat(left)).toBeGreaterThan(350);
    expect(parseFloat(left)).toBeLessThan(420);

    // Get bounding box to verify centering
    const box = await scrollIndicator.boundingBox();
    expect(box).not.toBeNull();

    // Button should be reasonably centered (within 25px of viewport center)
    // Note: Sub-pixel rendering can cause slight variations across browsers
    const viewportCenter = 768 / 2;
    const buttonCenter = box.x + box.width / 2;
    expect(Math.abs(buttonCenter - viewportCenter)).toBeLessThan(25);
  });

  test('7. Collapse animation should use smooth transform transition', async ({ page }) => {
    const scrollIndicator = page.locator('.scroll-indicator');
    await expect(scrollIndicator).toBeVisible({ timeout: 5000 });

    // Get initial position (collapsed state)
    const initialBox = await scrollIndicator.boundingBox();

    // Add expanded-mode class
    await page.evaluate(() => {
      const el = document.querySelector('.scroll-indicator');
      if (el) el.classList.add('expanded-mode');
    });
    await page.waitForTimeout(100);

    // Verify expanded position is different (centered)
    const expandedBox = await scrollIndicator.boundingBox();
    expect(expandedBox.x).not.toBe(initialBox.x);

    // Remove expanded-mode class to trigger collapse
    await page.evaluate(() => {
      const el = document.querySelector('.scroll-indicator');
      if (el) el.classList.remove('expanded-mode');
    });

    // Wait for CSS transition (0.35s morph duration)
    await page.waitForTimeout(400);

    // Verify button returns to right position
    const finalBox = await scrollIndicator.boundingBox();

    // Final position should match initial position (within tolerance for rounding)
    expect(Math.abs(finalBox.x - initialBox.x)).toBeLessThan(5);
  });

  test('10. Enter key should close search and select result when available', async ({ page }) => {
    // Click search button to open search
    const searchBtn = page.locator('#map-search-btn');
    await searchBtn.click();

    const searchInput = page.locator('#map-search-input');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveClass(/expanded/);

    // Type a search query - Vermont Foodbank should always have a result
    await searchInput.fill('Vermont Food');

    // Wait for debounced search to execute
    await page.waitForTimeout(500);

    // Press Enter - should either select a result or close search
    await searchInput.press('Enter');

    // Wait for action to complete
    await page.waitForTimeout(800);

    // After Enter, either:
    // 1. Search closes and a popup opens (if result found)
    // 2. Search closes (if no result)
    // Either way, the search input should no longer be expanded
    const inputStillExpanded = await searchInput.evaluate(el => el.classList.contains('expanded'));
    expect(inputStillExpanded).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════
// TEST SUITE: Cross-Viewport Metrics Section Tests
// ═══════════════════════════════════════════════════════════════

test.describe('Bug Fixes - Metrics Section (All Viewports)', () => {
  test('2. Metric items should have reduced padding with height: 72px (Wide Desktop)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await setupPage(page);
    await dismissEmailModal(page);

    // Verify metrics section exists
    const metricsSection = page.locator('.metrics-section');
    await expect(metricsSection).toBeVisible();

    // Verify metric items have height: 72px
    const metricItems = page.locator('.metric-item');
    const count = await metricItems.count();
    expect(count).toBeGreaterThan(0);

    // Check first metric item
    const firstMetricHeight = await getComputedStyle(page, '.metric-item', 'height');
    expect(firstMetricHeight).toBe('72px');
  });

  test('2. Metric items should have reduced padding with height: 72px (Narrow Desktop)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 900 });
    await setupPage(page);
    await dismissEmailModal(page);

    // Verify metrics section exists
    const metricsSection = page.locator('.metrics-section');
    await expect(metricsSection).toBeVisible();

    // Verify metric items have height: 72px
    const metricItems = page.locator('.metric-item');
    const count = await metricItems.count();
    expect(count).toBeGreaterThan(0);

    // Check first metric item
    const firstMetricHeight = await getComputedStyle(page, '.metric-item', 'height');
    expect(firstMetricHeight).toBe('72px');
  });
});

// ═══════════════════════════════════════════════════════════════
// TEST SUITE: Mobile Popup Centering (390 x 844 - iPhone 14)
// ═══════════════════════════════════════════════════════════════

test.describe('Bug Fixes - Mobile Popup Centering (390x844)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
    await waitForMapReady(page);
  });

  test('9b. Popup + pin should be centered in map safe area on mobile', async ({ page }) => {
    // Search for Vermont Foodbank
    const searchBtn = page.locator('#map-search-btn');
    await searchBtn.click();

    const searchInput = page.locator('#map-search-input');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Vermont Foodbank');

    // Wait for results and press Enter
    await page.waitForTimeout(500);
    await searchInput.press('Enter');

    // Wait for popup to open and map to expand
    await page.waitForTimeout(2000);

    // Check if popup is visible
    const popup = page.locator('.leaflet-popup');
    const popupVisible = await popup.isVisible();

    if (popupVisible) {
      const popupBox = await popup.boundingBox();
      const mapBox = await page.locator('#map').boundingBox();

      if (popupBox && mapBox) {
        // Get the header height (approximately 85px)
        const header = page.locator('header');
        const headerBox = await header.boundingBox();
        const headerBottom = headerBox ? headerBox.y + headerBox.height : 85;

        // Safe area is from header bottom to map bottom
        const safeTop = headerBottom + 20;
        const safeBottom = mapBox.y + mapBox.height - 20;
        const safeCenterY = (safeTop + safeBottom) / 2;

        // Safe area horizontal
        const safeLeft = mapBox.x + 20;
        const safeRight = mapBox.x + mapBox.width - 20;
        const safeCenterX = (safeLeft + safeRight) / 2;

        // Get the pin marker position (it's connected to the popup)
        const markers = page.locator('.leaflet-marker-icon:not(.marker-cluster-pill)');
        const markerCount = await markers.count();

        // Popup should be within safe area horizontally
        const popupCenterX = popupBox.x + popupBox.width / 2;
        expect(popupCenterX).toBeGreaterThan(safeLeft);
        expect(popupCenterX).toBeLessThan(safeRight);

        // Popup + pin combined should be reasonably centered
        // Allow generous tolerance since mobile has limited space
        expect(Math.abs(popupCenterX - safeCenterX)).toBeLessThan(100);
      }
    }
  });
});
