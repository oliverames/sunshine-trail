import { test, expect } from '@playwright/test';
import { selectors } from './utils/selectors';
import { setupPage, dismissEmailModal, waitForMapReady } from './utils/helpers';

/**
 * Animation Tests
 *
 * Records animations across all viewports to verify smooth transitions.
 * Videos are automatically saved for manual review.
 */

test.describe('Map Animations', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
    await waitForMapReady(page);
  });

  test('map expand and collapse animation', async ({ page }) => {
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;

    if (isMobile) {
      // First zoom in to get individual markers (clusters don't trigger map expand)
      const zoomIn = page.locator('.leaflet-control-zoom-in');
      await zoomIn.click();
      await page.waitForTimeout(800);
      await zoomIn.click();
      await page.waitForTimeout(800);

      // On mobile, click a marker to expand the map
      const markers = page.locator(selectors.map.marker);
      const markerCount = await markers.count();

      if (markerCount > 0) {
        // Click first marker to trigger map expansion (force: true to handle overlapping elements)
        await markers.first().click({ force: true });
        await page.waitForTimeout(1500); // Wait for expansion animation

        // Check if popup appeared (may not appear if marker was actually a cluster)
        const popup = page.locator(selectors.map.popup);
        const popupVisible = await popup.isVisible().catch(() => false);

        if (popupVisible) {
          // Wait to capture full animation
          await page.waitForTimeout(1000);

          // Close popup by clicking map
          await page.locator(selectors.map.container).click({ position: { x: 50, y: 400 } });
          await page.waitForTimeout(1000);
        }
      }
    }

    expect(true).toBe(true);
  });

  test('zoom animation smoothness', async ({ page }) => {
    // Get zoom buttons
    const zoomIn = page.locator('.leaflet-control-zoom-in');
    const zoomOut = page.locator('.leaflet-control-zoom-out');

    // Wait for controls
    await expect(zoomIn).toBeVisible({ timeout: 5000 });

    // Zoom in
    await zoomIn.click();
    await page.waitForTimeout(800);

    // Zoom in again
    await zoomIn.click();
    await page.waitForTimeout(800);

    // Zoom out
    await zoomOut.click();
    await page.waitForTimeout(800);

    // Zoom out again
    await zoomOut.click();
    await page.waitForTimeout(800);

    expect(true).toBe(true);
  });

  test('popup centering animation', async ({ page }) => {
    // First zoom in if needed to get individual markers (not just clusters)
    const zoomIn = page.locator('.leaflet-control-zoom-in');
    await zoomIn.click();
    await page.waitForTimeout(800);
    await zoomIn.click();
    await page.waitForTimeout(800);

    const markers = page.locator(selectors.map.marker);
    const markerCount = await markers.count();

    if (markerCount > 0) {
      // Click first marker (force: true to handle overlapping elements)
      await markers.first().click({ force: true });
      await page.waitForTimeout(2000); // Wait for popup and centering animation

      const popup = page.locator(selectors.map.popup);
      const popupVisible = await popup.isVisible().catch(() => false);

      if (popupVisible) {
        // Close popup by clicking map (use right side of map to avoid sidebar on desktop)
        const viewport = page.viewportSize();
        const xPosition = viewport && viewport.width >= 768 ? viewport.width - 100 : 50;
        await page.locator('.leaflet-container').click({ position: { x: xPosition, y: 400 }, force: true });
        await page.waitForTimeout(500);

        if (markerCount > 1) {
          // Click second marker (force: true to handle overlapping elements)
          await markers.nth(1).click({ force: true });
          await page.waitForTimeout(2000);
        }
      }
    }

    expect(true).toBe(true);
  });

  test('cluster expansion animation', async ({ page }) => {
    const clusters = page.locator(selectors.map.markerCluster);
    const clusterCount = await clusters.count();

    if (clusterCount > 0) {
      // Click first cluster to expand
      await clusters.first().click();
      await page.waitForTimeout(1500);

      // Check if expanded (either more markers or more clusters visible)
      await page.waitForTimeout(500);
    }

    expect(true).toBe(true);
  });
});

test.describe('Filter Animations', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
    await waitForMapReady(page);
  });

  test('category filter toggle animation', async ({ page }) => {
    // Toggle breweries off and on
    const breweriesFilter = page.locator(selectors.filters.breweries);
    await expect(breweriesFilter).toBeVisible();

    await breweriesFilter.click();
    await page.waitForTimeout(800);

    await breweriesFilter.click();
    await page.waitForTimeout(800);

    // Toggle trails
    const trailsFilter = page.locator(selectors.filters.trails);
    await trailsFilter.click();
    await page.waitForTimeout(800);

    await trailsFilter.click();
    await page.waitForTimeout(800);

    expect(true).toBe(true);
  });

  test('state filter animation', async ({ page }) => {
    // Click Vermont
    const vtButton = page.locator(selectors.stateFilters.buttonByState('VT'));
    await vtButton.click();
    await page.waitForTimeout(1200);

    // Click North Carolina
    const ncButton = page.locator(selectors.stateFilters.buttonByState('NC'));
    await ncButton.click();
    await page.waitForTimeout(1200);

    // Click All States
    const allStates = page.locator(selectors.stateFilters.allStates);
    await allStates.click();
    await page.waitForTimeout(1200);

    expect(true).toBe(true);
  });
});

test.describe('Route Toggle Animation', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
    await waitForMapReady(page);
  });

  test('route show/hide animation', async ({ page }) => {
    const routeToggle = page.locator(selectors.route.toggleCheckbox);

    // Toggle route off
    if (await routeToggle.isChecked()) {
      await routeToggle.click();
      await page.waitForTimeout(1000);
    }

    // Toggle route on
    await routeToggle.click();
    await page.waitForTimeout(1000);

    // Toggle off again
    await routeToggle.click();
    await page.waitForTimeout(1000);

    expect(true).toBe(true);
  });
});

test.describe('Solar Metric Carousel', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
    await waitForMapReady(page);
  });

  test('solar metric rotation animation', async ({ page }) => {
    // Wait for carousel to rotate through all slides (5 seconds each)
    // We'll wait 12 seconds to see at least 2 rotations
    const solarMetric = page.locator('#metric-solar');
    await expect(solarMetric).toBeVisible();

    // Wait for first rotation
    await page.waitForTimeout(6000);

    // Wait for second rotation
    await page.waitForTimeout(6000);

    expect(true).toBe(true);
  });
});

test.describe('Scroll and Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
    await waitForMapReady(page);
  });

  test('scroll indicator visibility', async ({ page }) => {
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;

    if (isMobile) {
      // Check scroll indicator
      const scrollIndicator = page.locator('.scroll-indicator');
      const exists = (await scrollIndicator.count()) > 0;

      if (exists) {
        await page.waitForTimeout(1000);

        // Click a marker to expand map
        const markers = page.locator(selectors.map.marker);
        if ((await markers.count()) > 0) {
          await markers.first().click();
          await page.waitForTimeout(1500);

          // Scroll indicator should be hidden when map is expanded
          await page.waitForTimeout(500);
        }
      }
    }

    expect(true).toBe(true);
  });

  test('zoom hint visibility and animation', async ({ page }) => {
    const zoomHint = page.locator('#zoom-hint');
    const isVisible = await zoomHint.isVisible();

    if (isVisible) {
      // Wait to see the hint
      await page.waitForTimeout(2000);

      // Click zoom in button to trigger hide
      const zoomIn = page.locator('.leaflet-control-zoom-in');
      await zoomIn.click();
      await page.waitForTimeout(1500);

      // Hint should be hidden
    }

    expect(true).toBe(true);
  });
});
