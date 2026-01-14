// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Issue #11 - Zoom Hint Visibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for map to fully load
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(500);
  });

  test('zoom hint should be visible initially', async ({ page }) => {
    const zoomHint = page.locator('#zoom-hint');
    await expect(zoomHint).toBeVisible();
    // Should NOT have hidden class initially
    await expect(zoomHint).not.toHaveClass(/hidden/);
  });

  test('zoom hint should hide when clicking zoom-in button', async ({ page }) => {
    const zoomHint = page.locator('#zoom-hint');
    const zoomInButton = page.locator('.leaflet-control-zoom-in');

    await expect(zoomHint).not.toHaveClass(/hidden/);
    await zoomInButton.click();
    await page.waitForTimeout(300);
    // Check for hidden class (uses opacity: 0 animation)
    await expect(zoomHint).toHaveClass(/hidden/);
  });

  test('zoom hint should hide when clicking zoom-out button', async ({ page }) => {
    const zoomHint = page.locator('#zoom-hint');
    const zoomOutButton = page.locator('.leaflet-control-zoom-out');

    await expect(zoomHint).not.toHaveClass(/hidden/);
    await zoomOutButton.click();
    await page.waitForTimeout(300);
    // Check for hidden class (uses opacity: 0 animation)
    await expect(zoomHint).toHaveClass(/hidden/);
  });

  test('zoom hint should hide when search is activated', async ({ page }) => {
    const zoomHint = page.locator('#zoom-hint');
    const searchButton = page.locator('#map-search-btn');
    const searchInput = page.locator('#map-search-input');

    await expect(zoomHint).not.toHaveClass(/hidden/);
    // Click search button to expand the search input first
    await searchButton.click();
    await page.waitForTimeout(200);
    await searchInput.fill('Vermont');
    await page.waitForTimeout(500);
    // Check for hidden class (uses opacity: 0 animation)
    await expect(zoomHint).toHaveClass(/hidden/);
  });

  test('zoom hint should hide on scroll/wheel zoom', async ({ page }) => {
    const zoomHint = page.locator('#zoom-hint');
    const map = page.locator('#map');

    await expect(zoomHint).not.toHaveClass(/hidden/);
    // Simulate wheel zoom
    await map.hover();
    await page.mouse.wheel(0, -100);
    await page.waitForTimeout(500);
    // Check for hidden class (uses opacity: 0 animation)
    await expect(zoomHint).toHaveClass(/hidden/);
  });
});

test.describe('Issue #13 - Search Result Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);
  });

  test('clicking search result should navigate map and open popup', async ({ page }) => {
    const searchButton = page.locator('#map-search-btn');
    const searchInput = page.locator('#map-search-input');

    // Click search button to expand, then type search
    await searchButton.click();
    await page.waitForTimeout(200);
    await searchInput.fill('Lawson');
    await page.waitForTimeout(500);

    // Wait for search results
    const searchResults = page.locator('#map-search-results');
    await expect(searchResults).toHaveClass(/visible/);

    // Click first result
    const firstResult = page.locator('.search-result-item').first();
    await firstResult.click();

    // Search should close
    await expect(searchResults).not.toHaveClass(/visible/);

    // Wait for map animation and popup
    await page.waitForTimeout(1500);

    // A popup should be open
    const popup = page.locator('.leaflet-popup');
    await expect(popup).toBeVisible({ timeout: 5000 });
  });

  test('selecting search result should close any existing popup', async ({ page }) => {
    // First, click a marker to open a popup
    const cluster = page.locator('.marker-cluster-pill').first();
    if (await cluster.isVisible()) {
      await cluster.click();
      await page.waitForTimeout(1000);
    }

    // Now search and select
    const searchButton = page.locator('#map-search-btn');
    const searchInput = page.locator('#map-search-input');
    await searchButton.click();
    await page.waitForTimeout(200);
    await searchInput.fill('Lawson');
    await page.waitForTimeout(500);

    const firstResult = page.locator('.search-result-item').first();
    if (await firstResult.isVisible()) {
      await firstResult.click();
      await page.waitForTimeout(2000);

      // Only one popup should be visible
      const popups = page.locator('.leaflet-popup');
      const count = await popups.count();
      expect(count).toBeLessThanOrEqual(1);
    }
  });
});

test.describe('Initial Map View', () => {
  test('map should fit all markers within visible area on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1500);

    // Check that marker clusters are visible (not hidden under sidebar)
    const clusters = page.locator('.marker-cluster-pill');
    const count = await clusters.count();
    expect(count).toBeGreaterThan(0);

    // At least some clusters should be in the visible map area
    const firstCluster = clusters.first();
    const box = await firstCluster.boundingBox();
    if (box) {
      // Cluster should be to the right of sidebar (sidebar is ~400px)
      expect(box.x).toBeGreaterThan(350);
    }
  });

  test('map should show markers on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1500);

    const clusters = page.locator('.marker-cluster-pill');
    const count = await clusters.count();
    expect(count).toBeGreaterThan(0);
  });

  test('map should show markers on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1500);

    const clusters = page.locator('.marker-cluster-pill');
    const count = await clusters.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Issue #12 - Mobile Auto-scroll', () => {
  test('selecting a state should scroll map into view on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    // Get initial scroll position
    const initialScroll = await page.evaluate(() => window.scrollY);

    // Click a state filter button
    const stateButton = page.locator('.state-button').first();
    if (await stateButton.isVisible()) {
      await stateButton.click();
      await page.waitForTimeout(800);

      // Check if map element is in viewport
      const map = page.locator('#map');
      await expect(map).toBeInViewport();
    }
  });
});

test.describe('Snowflake Animation', () => {
  test('snowflakes should have variable durations for continuous effect', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(500);

    // Click the cold beer element to trigger snow
    const coldBeer = page.locator('#cold-beer');
    if (await coldBeer.isVisible()) {
      await coldBeer.click();
      await page.waitForTimeout(2000);

      // Check snowflakes exist
      const snowflakes = page.locator('.snowflake');
      const count = await snowflakes.count();

      if (count > 3) {
        // Get animation durations of multiple snowflakes
        const durations = await page.evaluate(() => {
          const flakes = document.querySelectorAll('.snowflake');
          return Array.from(flakes).slice(0, 5).map(f => {
            const style = window.getComputedStyle(f);
            return parseFloat(style.animationDuration);
          });
        });

        // Durations should vary (not all the same)
        const uniqueDurations = new Set(durations.map(d => Math.round(d)));
        expect(uniqueDurations.size).toBeGreaterThan(1);
      }
    }
  });
});

test.describe('Core Functionality', () => {
  test('map should initialize without JavaScript errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));

    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(2000);

    // Filter out non-critical errors
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('ResizeObserver')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('category filters should toggle marker visibility', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1500);

    // Get initial cluster count
    const initialCount = await page.locator('.marker-cluster-pill').count();

    // Toggle off breweries
    const breweryFilter = page.locator('#filter-breweries');
    await breweryFilter.uncheck();
    await page.waitForTimeout(500);

    // Toggle off retailers
    const retailerFilter = page.locator('#filter-retailers');
    await retailerFilter.uncheck();
    await page.waitForTimeout(500);

    // Count should change
    const newCount = await page.locator('.marker-cluster-pill').count();
    expect(newCount).not.toBe(initialCount);
  });

  test('popup should display location information', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1500);

    // Click on a cluster to zoom in
    const cluster = page.locator('.marker-cluster-pill').first();
    if (await cluster.isVisible()) {
      await cluster.click();
      await page.waitForTimeout(1500);

      // Try clicking again if still clustered
      const marker = page.locator('.leaflet-marker-icon:not(.marker-cluster-pill)').first();
      if (await marker.isVisible()) {
        await marker.click();
        await page.waitForTimeout(500);

        // Check popup content
        const popup = page.locator('.leaflet-popup-content');
        if (await popup.isVisible()) {
          const content = await popup.textContent();
          expect(content.length).toBeGreaterThan(0);
        }
      }
    }
  });
});

test.describe('Viewport Utilities', () => {
  test('sidebar width should be calculated correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(500);

    const sidebarWidth = await page.evaluate(() => {
      // Access the getSidebarWidth function if exposed, or calculate
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        const style = window.getComputedStyle(sidebar);
        return parseFloat(style.width);
      }
      return 0;
    });

    // Sidebar should have width on desktop
    expect(sidebarWidth).toBeGreaterThan(300);
  });

  test('sidebar should not overlay map on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(500);

    const sidebarWidth = await page.evaluate(() => {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        const rect = sidebar.getBoundingClientRect();
        const mapRect = document.getElementById('map')?.getBoundingClientRect();
        // Check if sidebar overlaps map
        if (mapRect && rect.right > mapRect.left && rect.left < mapRect.right) {
          return rect.width;
        }
      }
      return 0;
    });

    // On mobile, sidebar should not significantly overlap the map
    expect(sidebarWidth).toBeLessThan(100);
  });
});
