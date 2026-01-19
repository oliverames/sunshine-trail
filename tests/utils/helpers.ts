import { Page, expect, Locator } from '@playwright/test';
import { selectors, DEMO_PASSWORD } from './selectors';

/**
 * Sunshine Trail E2E Test Helpers
 *
 * Utility functions for common test operations using REAL user interactions,
 * not JavaScript simulation.
 */

/**
 * Authenticates through the password overlay using actual user interactions
 */
export async function authenticateUser(page: Page): Promise<void> {
  const overlay = page.locator(selectors.password.overlay);
  const isVisible = await overlay.isVisible().catch(() => false);

  if (isVisible) {
    // Type password using actual keyboard input
    await page.locator(selectors.password.input).click();
    await page.locator(selectors.password.input).fill(DEMO_PASSWORD);
    await page.locator(selectors.password.submitButton).click();

    // Wait for overlay to fade out
    await expect(overlay).toHaveCSS('opacity', '0', { timeout: 3000 });
  }
}

/**
 * Dismisses the email modal if it appears
 * Includes retry logic since modal may appear after initial check
 */
export async function dismissEmailModal(page: Page): Promise<void> {
  const modal = page.locator(selectors.emailModal.overlay);

  // Check multiple times since modal may appear with delay
  for (let attempt = 0; attempt < 3; attempt++) {
    const isVisible = await modal.isVisible().catch(() => false);

    if (isVisible) {
      const closeButton = page.locator(selectors.emailModal.closeButton);
      // Wait for close button to be clickable
      await closeButton.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});
      await closeButton.click({ force: true });
      await expect(modal).not.toBeVisible({ timeout: 2000 });
      return;
    }

    // Brief wait before retry
    if (attempt < 2) {
      await page.waitForTimeout(200);
    }
  }
}

/**
 * Sets up the page by authenticating and dismissing modal
 */
export async function setupPage(page: Page): Promise<void> {
  await page.goto('/');
  await authenticateUser(page);
  // Give small buffer for any animations
  await page.waitForTimeout(500);
}

/**
 * Waits for the map to be fully loaded and interactive
 */
export async function waitForMapReady(page: Page): Promise<void> {
  // Wait for Leaflet map container to exist
  await page.waitForSelector(selectors.map.container);
  // Wait for map tiles to load
  await page.waitForSelector('.leaflet-tile-loaded', { timeout: 10000 });
  // Wait for markers or clusters to appear
  await page.waitForSelector(`${selectors.map.marker}, ${selectors.map.markerCluster}`, {
    timeout: 10000,
  });
}

/**
 * Performs a quick click on an element (for emoji burst trigger)
 * Quick click = mousedown + mouseup within 200ms with <10px movement
 */
export async function quickClick(page: Page, selector: string): Promise<void> {
  // Ensure email modal is dismissed first
  await dismissEmailModal(page);

  const element = page.locator(selector);

  // Wait for element to be visible and not blocked
  await element.waitFor({ state: 'visible', timeout: 5000 });

  const box = await element.boundingBox();
  if (!box) throw new Error(`Element not found: ${selector}`);

  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;

  // Perform a real quick click using mouse events
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.waitForTimeout(50); // Stay under 200ms threshold
  await page.mouse.up();
}

/**
 * Performs a real hover interaction (not JavaScript-triggered)
 */
export async function hoverElement(page: Page, selector: string): Promise<void> {
  const element = page.locator(selector);
  await element.hover({ force: true });
}

/**
 * Checks if a popup is fully visible within the viewport
 * This is critical for Issue #27 (popup centering)
 * Uses .last() to handle cases where multiple popups may be visible
 */
export async function isPopupFullyVisible(page: Page): Promise<boolean> {
  const popups = page.locator(selectors.map.popup);
  const count = await popups.count();
  if (count === 0) return false;

  // Use last popup (most recently opened) when multiple exist
  const popup = popups.last();
  const isVisible = await popup.isVisible();
  if (!isVisible) return false;

  const viewport = page.viewportSize();
  if (!viewport) return false;

  const popupBox = await popup.boundingBox();
  if (!popupBox) return false;

  // Check all edges are within viewport
  const isWithinViewport =
    popupBox.x >= 0 &&
    popupBox.y >= 0 &&
    popupBox.x + popupBox.width <= viewport.width &&
    popupBox.y + popupBox.height <= viewport.height;

  return isWithinViewport;
}

/**
 * Gets the visible portion of a popup (for partial visibility testing)
 * Uses .last() to handle cases where multiple popups may be visible
 */
export async function getPopupVisibility(
  page: Page
): Promise<{ visible: boolean; fullyVisible: boolean; visiblePercent: number }> {
  const popups = page.locator(selectors.map.popup);
  const count = await popups.count();
  if (count === 0) {
    return { visible: false, fullyVisible: false, visiblePercent: 0 };
  }

  // Use last popup (most recently opened) when multiple exist
  const popup = popups.last();
  const isVisible = await popup.isVisible();
  if (!isVisible) {
    return { visible: false, fullyVisible: false, visiblePercent: 0 };
  }

  const viewport = page.viewportSize();
  const popupBox = await popup.boundingBox();
  if (!viewport || !popupBox) {
    return { visible: true, fullyVisible: false, visiblePercent: 0 };
  }

  // Calculate visible area
  const visibleLeft = Math.max(0, popupBox.x);
  const visibleTop = Math.max(0, popupBox.y);
  const visibleRight = Math.min(viewport.width, popupBox.x + popupBox.width);
  const visibleBottom = Math.min(viewport.height, popupBox.y + popupBox.height);

  const visibleWidth = Math.max(0, visibleRight - visibleLeft);
  const visibleHeight = Math.max(0, visibleBottom - visibleTop);
  const visibleArea = visibleWidth * visibleHeight;
  const totalArea = popupBox.width * popupBox.height;

  const visiblePercent = totalArea > 0 ? (visibleArea / totalArea) * 100 : 0;
  const fullyVisible = visiblePercent >= 99.9; // Allow tiny rounding errors

  return { visible: true, fullyVisible, visiblePercent };
}

/**
 * Clicks a marker cluster and waits for it to expand
 */
export async function clickCluster(page: Page, clusterIndex: number = 0): Promise<void> {
  const clusters = page.locator(selectors.map.markerCluster);
  const count = await clusters.count();
  if (count === 0) throw new Error('No marker clusters found');

  const cluster = clusters.nth(clusterIndex);
  await cluster.click();
  // Wait for zoom animation
  await page.waitForTimeout(500);
}

/**
 * Opens a marker popup by clicking on a marker
 */
export async function openMarkerPopup(page: Page, markerIndex: number = 0): Promise<void> {
  const markers = page.locator(selectors.map.marker);
  const count = await markers.count();
  if (count === 0) throw new Error('No markers found');

  const marker = markers.nth(markerIndex);
  await marker.click();

  // Wait for popup to appear
  await expect(page.locator(selectors.map.popup)).toBeVisible({ timeout: 5000 });
}

/**
 * Expands the search input if it's collapsed (common on mobile viewports)
 * On mobile, the search input starts hidden and the button expands it
 */
export async function expandSearchInput(page: Page): Promise<void> {
  const searchInput = page.locator(selectors.map.searchInput);
  const searchButton = page.locator(selectors.map.searchButton);

  // Small delay to let any animations settle
  await page.waitForTimeout(200);

  // Check if input is already visible
  const isInputVisible = await searchInput.isVisible().catch(() => false);

  if (!isInputVisible) {
    // Click the search button to expand/show the input
    await searchButton.click();

    // Wait for the input to become visible, with retry
    try {
      await expect(searchInput).toBeVisible({ timeout: 2000 });
    } catch {
      // If first click didn't work, try clicking again (toggle behavior)
      await page.waitForTimeout(300);
      await searchButton.click();
      await expect(searchInput).toBeVisible({ timeout: 3000 });
    }
  }
}

/**
 * Searches for a location using the map search
 * Automatically expands the search input if collapsed
 */
export async function searchLocation(page: Page, query: string): Promise<void> {
  await expandSearchInput(page);
  await page.locator(selectors.map.searchInput).click();
  await page.locator(selectors.map.searchInput).fill(query);
  await page.locator(selectors.map.searchButton).click();
  // Wait for results
  await page.waitForTimeout(500);
}

/**
 * Toggles a category filter by clicking its checkbox
 */
export async function toggleCategoryFilter(
  page: Page,
  category: keyof typeof selectors.filters
): Promise<void> {
  const checkbox = page.locator(selectors.filters[category]);
  await checkbox.click();
  // Wait for map markers to update
  await page.waitForTimeout(300);
}

/**
 * Selects a state filter by clicking its button
 */
export async function selectStateFilter(page: Page, state: string): Promise<void> {
  const button = page.locator(selectors.stateFilters.buttonByState(state));
  await button.click();
  // Wait for markers to filter
  await page.waitForTimeout(500);
}

/**
 * Gets the current count of visible markers
 */
export async function getVisibleMarkerCount(page: Page): Promise<number> {
  const markers = page.locator(selectors.map.marker);
  return await markers.count();
}

/**
 * Gets the current count of visible clusters
 */
export async function getVisibleClusterCount(page: Page): Promise<number> {
  const clusters = page.locator(selectors.map.markerCluster);
  return await clusters.count();
}

/**
 * Checks if sidebar is visible (responsive layout test)
 */
export async function isSidebarVisible(page: Page): Promise<boolean> {
  const sidebar = page.locator(selectors.sidebar.container);
  return await sidebar.isVisible();
}

/**
 * Gets current viewport category based on width
 */
export function getViewportCategory(page: Page): 'mobile' | 'tablet' | 'desktop' {
  const viewport = page.viewportSize();
  if (!viewport) return 'desktop';

  if (viewport.width < 768) return 'mobile';
  if (viewport.width <= 1024) return 'tablet'; // Include iPad Pro 12.9" (1024px)
  return 'desktop';
}

/**
 * Checks if the current viewport represents a touch device (mobile or tablet)
 * Touch devices don't support hover interactions reliably
 */
export function isTouchViewport(page: Page): boolean {
  const category = getViewportCategory(page);
  return category === 'mobile' || category === 'tablet';
}

/**
 * Waits for snowflakes to appear after cold beer hover
 */
export async function waitForSnowflakes(page: Page, timeout: number = 3000): Promise<number> {
  await page.waitForSelector(selectors.effects.snowflakes, { timeout });
  const snowflakes = page.locator(selectors.effects.snowflakes);
  return await snowflakes.count();
}

/**
 * Waits for god rays effect to appear
 */
export async function waitForGodRays(page: Page, timeout: number = 3000): Promise<boolean> {
  try {
    await page.waitForSelector(selectors.effects.godRays, { state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Waits for emoji burst effect
 */
export async function waitForEmojiBurst(page: Page, timeout: number = 3000): Promise<number> {
  try {
    await page.waitForSelector(selectors.effects.emojiBurst, { timeout });
    const emojis = page.locator(selectors.effects.emojiBurst);
    return await emojis.count();
  } catch {
    return 0;
  }
}
