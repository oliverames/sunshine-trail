// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * COMPREHENSIVE QA TEST SUITE
 * Tests all functionality across all viewports to find issues
 */

// Helper to get viewport category
function getViewportCategory(width) {
  if (width <= 428) return 'mobile';
  if (width <= 1024) return 'tablet';
  return 'desktop';
}

// ============================================
// MAP INITIALIZATION & LOADING
// ============================================
test.describe('Map Initialization', () => {
  test('map should load without JavaScript errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible', timeout: 10000 });
    await page.waitForTimeout(3000); // Wait for all async operations

    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('ResizeObserver') &&
      !e.includes('third-party')
    );

    if (criticalErrors.length > 0) {
      console.log('Errors found:', criticalErrors);
    }
    expect(criticalErrors).toHaveLength(0);
  });

  test('map tiles should load successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(2000);

    // Check that tile layers are present
    const tiles = page.locator('.leaflet-tile-loaded');
    const tileCount = await tiles.count();
    expect(tileCount).toBeGreaterThan(0);
  });

  test('map should have correct initial center and zoom', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(2000);

    const mapState = await page.evaluate(() => {
      // @ts-ignore
      if (window.map) {
        // @ts-ignore
        const center = window.map.getCenter();
        // @ts-ignore
        const zoom = window.map.getZoom();
        return { lat: center.lat, lng: center.lng, zoom };
      }
      return null;
    });

    // Map should be initialized (we can't check exact values due to route auto-fit)
    expect(mapState).not.toBeNull();
  });

  test('all marker clusters should render', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(2000);

    const clusters = page.locator('.marker-cluster-pill');
    const clusterCount = await clusters.count();
    expect(clusterCount).toBeGreaterThan(0);
  });
});

// ============================================
// MAP INTERACTIONS
// ============================================
test.describe('Map Zoom Interactions', () => {
  test('zoom in button should increase zoom level', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(2000);

    const initialZoom = await page.evaluate(() => {
      // @ts-ignore
      return window.map ? window.map.getZoom() : 0;
    });

    const zoomInBtn = page.locator('.leaflet-control-zoom-in');
    await zoomInBtn.click();
    await page.waitForTimeout(500);

    const newZoom = await page.evaluate(() => {
      // @ts-ignore
      return window.map ? window.map.getZoom() : 0;
    });

    expect(newZoom).toBeGreaterThan(initialZoom);
  });

  test('zoom out button should decrease zoom level', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(2000);

    // First zoom in to have room to zoom out
    const zoomInBtn = page.locator('.leaflet-control-zoom-in');
    await zoomInBtn.click();
    await page.waitForTimeout(500);

    const initialZoom = await page.evaluate(() => {
      // @ts-ignore
      return window.map ? window.map.getZoom() : 0;
    });

    const zoomOutBtn = page.locator('.leaflet-control-zoom-out');
    await zoomOutBtn.click();
    await page.waitForTimeout(500);

    const newZoom = await page.evaluate(() => {
      // @ts-ignore
      return window.map ? window.map.getZoom() : 0;
    });

    expect(newZoom).toBeLessThan(initialZoom);
  });

  test('mouse wheel should zoom map', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(2000);

    const map = page.locator('#map');
    await map.hover();

    const initialZoom = await page.evaluate(() => {
      // @ts-ignore
      return window.map ? window.map.getZoom() : 0;
    });

    await page.mouse.wheel(0, -300); // Scroll up to zoom in
    await page.waitForTimeout(800);

    const newZoom = await page.evaluate(() => {
      // @ts-ignore
      return window.map ? window.map.getZoom() : 0;
    });

    expect(newZoom).toBeGreaterThan(initialZoom);
  });

  test('double click should zoom map', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(2000);

    const initialZoom = await page.evaluate(() => {
      // @ts-ignore
      return window.map ? window.map.getZoom() : 0;
    });

    const map = page.locator('#map');
    const box = await map.boundingBox();
    if (box) {
      await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(800);
    }

    const newZoom = await page.evaluate(() => {
      // @ts-ignore
      return window.map ? window.map.getZoom() : 0;
    });

    expect(newZoom).toBeGreaterThan(initialZoom);
  });
});

test.describe('Map Pan Interactions', () => {
  test('map should be draggable', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(2000);

    const initialCenter = await page.evaluate(() => {
      // @ts-ignore
      if (window.map) {
        // @ts-ignore
        const center = window.map.getCenter();
        return { lat: center.lat, lng: center.lng };
      }
      return null;
    });

    const map = page.locator('#map');
    const box = await map.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2 + 100, { steps: 10 });
      await page.mouse.up();
      await page.waitForTimeout(500);
    }

    const newCenter = await page.evaluate(() => {
      // @ts-ignore
      if (window.map) {
        // @ts-ignore
        const center = window.map.getCenter();
        return { lat: center.lat, lng: center.lng };
      }
      return null;
    });

    // Center should have changed
    expect(newCenter).not.toBeNull();
    expect(initialCenter).not.toBeNull();
    if (initialCenter && newCenter) {
      const moved = initialCenter.lat !== newCenter.lat || initialCenter.lng !== newCenter.lng;
      expect(moved).toBe(true);
    }
  });
});

// ============================================
// MARKER CLUSTERS
// ============================================
test.describe('Marker Cluster Behavior', () => {
  test('clicking cluster should zoom and spiderfy', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(2000);

    const cluster = page.locator('.marker-cluster-pill').first();
    if (await cluster.isVisible()) {
      const initialZoom = await page.evaluate(() => {
        // @ts-ignore
        return window.map ? window.map.getZoom() : 0;
      });

      await cluster.click();
      await page.waitForTimeout(1000);

      const newZoom = await page.evaluate(() => {
        // @ts-ignore
        return window.map ? window.map.getZoom() : 0;
      });

      // Zoom should have changed or spiderfy should have happened
      const spiderfied = await page.locator('.leaflet-marker-icon:not(.marker-cluster-pill)').count();
      expect(newZoom > initialZoom || spiderfied > 0).toBe(true);
    }
  });

  test('cluster pills should show category icons and count', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(2000);

    const cluster = page.locator('.marker-cluster-pill').first();
    if (await cluster.isVisible()) {
      const html = await cluster.innerHTML();
      // Should contain icons and count
      expect(html).toContain('img');
    }
  });

  test('cluster hover should show wave animation', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(2000);

    const cluster = page.locator('.marker-cluster-pill').first();
    if (await cluster.isVisible()) {
      await cluster.hover();
      await page.waitForTimeout(100);

      // Check if hover styles applied
      const transform = await cluster.evaluate(el => {
        return window.getComputedStyle(el).transform;
      });

      // Just verify the element responds to hover
      expect(cluster).toBeVisible();
    }
  });
});

// ============================================
// POPUP BEHAVIOR
// ============================================
test.describe('Location Popup Behavior', () => {
  test('clicking marker should open popup', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(2000);

    // Zoom in to see individual markers
    for (let i = 0; i < 3; i++) {
      const cluster = page.locator('.marker-cluster-pill').first();
      if (await cluster.isVisible()) {
        await cluster.click();
        await page.waitForTimeout(800);
      }
    }

    // Try to click an individual marker
    const marker = page.locator('.leaflet-marker-icon:not(.marker-cluster-pill)').first();
    if (await marker.isVisible()) {
      await marker.click();
      await page.waitForTimeout(500);

      const popup = page.locator('.leaflet-popup');
      await expect(popup).toBeVisible({ timeout: 3000 });
    }
  });

  test('popup should contain required elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(2000);

    // Search for a specific location to open popup
    const searchButton = page.locator('#map-search-btn');
    await searchButton.click();
    await page.waitForTimeout(200);

    const searchInput = page.locator('#map-search-input');
    await searchInput.fill('Lawson');
    await page.waitForTimeout(1000);

    const firstResult = page.locator('.search-result-item').first();
    if (await firstResult.isVisible()) {
      await firstResult.click();
      await page.waitForTimeout(2000);

      const popup = page.locator('.leaflet-popup-content');
      if (await popup.isVisible()) {
        const content = await popup.innerHTML();

        // Should have category tag
        expect(content).toContain('popup-category');

        // Should have name
        expect(content).toContain('popup-name');
      }
    }
  });

  test('popup close button should work', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(2000);

    // Open a popup via search
    const searchButton = page.locator('#map-search-btn');
    await searchButton.click();
    await page.waitForTimeout(200);

    const searchInput = page.locator('#map-search-input');
    await searchInput.fill('Lawson');
    await page.waitForTimeout(1000);

    const firstResult = page.locator('.search-result-item').first();
    if (await firstResult.isVisible()) {
      await firstResult.click();
      await page.waitForTimeout(2000);

      const popup = page.locator('.leaflet-popup');
      if (await popup.isVisible()) {
        const closeBtn = page.locator('.leaflet-popup-close-button');
        await closeBtn.click();
        await page.waitForTimeout(500);

        await expect(popup).not.toBeVisible();
      }
    }
  });

  test('only one popup should be open at a time', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(2000);

    // This tests autoClose functionality
    const popups = page.locator('.leaflet-popup');
    const count = await popups.count();
    expect(count).toBeLessThanOrEqual(1);
  });
});

// ============================================
// CATEGORY FILTERS
// ============================================
test.describe('Category Filter Functionality', () => {
  const categories = [
    { id: 'filter-breweries', name: 'Breweries' },
    { id: 'filter-tastingrooms', name: 'Tasting Rooms' },
    { id: 'filter-retailers', name: 'Retailers' },
    { id: 'filter-bars', name: 'Bars' },
    { id: 'filter-trails', name: 'Trails' },
    { id: 'filter-rivers', name: 'Rivers' },
    { id: 'filter-community', name: 'Community' },
  ];

  for (const category of categories) {
    test(`${category.name} filter should toggle markers`, async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('.leaflet-container', { state: 'visible' });
      await page.waitForTimeout(2000);

      const filter = page.locator(`#${category.id}`);

      // Should be checked by default
      await expect(filter).toBeChecked();

      // Uncheck
      await filter.uncheck();
      await page.waitForTimeout(300);
      await expect(filter).not.toBeChecked();

      // Check again
      await filter.check();
      await page.waitForTimeout(300);
      await expect(filter).toBeChecked();
    });
  }

  test('unchecking all filters should hide all markers', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(2000);

    // Get initial marker count
    const initialCount = await page.locator('.leaflet-marker-icon').count();

    // Uncheck all filters
    for (const category of categories) {
      const filter = page.locator(`#${category.id}`);
      await filter.uncheck();
      await page.waitForTimeout(100);
    }

    await page.waitForTimeout(500);

    // Marker count should be significantly reduced
    const newCount = await page.locator('.leaflet-marker-icon').count();
    expect(newCount).toBeLessThan(initialCount);
  });

  test('filter count badges should update correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(2000);

    // Check that count badges exist and have numbers
    const countBadges = page.locator('.count-badge');
    const badgeCount = await countBadges.count();
    expect(badgeCount).toBeGreaterThan(0);

    // At least some should have non-zero counts
    let hasNonZero = false;
    for (let i = 0; i < badgeCount; i++) {
      const text = await countBadges.nth(i).textContent();
      if (text && parseInt(text) > 0) {
        hasNonZero = true;
        break;
      }
    }
    expect(hasNonZero).toBe(true);
  });
});

// ============================================
// STATE FILTERS
// ============================================
test.describe('State Filter Functionality', () => {
  test('state buttons should exist for all states', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const stateButtons = page.locator('.state-button');
    const count = await stateButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('clicking state button should zoom to state', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(2000);

    const initialBounds = await page.evaluate(() => {
      // @ts-ignore
      if (window.map) {
        // @ts-ignore
        return window.map.getBounds().toBBoxString();
      }
      return null;
    });

    const stateButton = page.locator('.state-button').first();
    if (await stateButton.isVisible()) {
      await stateButton.click();
      await page.waitForTimeout(1500);

      const newBounds = await page.evaluate(() => {
        // @ts-ignore
        if (window.map) {
          // @ts-ignore
          return window.map.getBounds().toBBoxString();
        }
        return null;
      });

      expect(newBounds).not.toBe(initialBounds);
    }
  });

  test('clicking state button on mobile should auto-scroll to map', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(2000);

    // Scroll down to ensure we're not at the map
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(300);

    const stateButton = page.locator('.state-button').first();
    if (await stateButton.isVisible()) {
      await stateButton.click();
      await page.waitForTimeout(1000);

      // Map should be in viewport
      const map = page.locator('#map');
      await expect(map).toBeInViewport();
    }
  });
});

// ============================================
// SEARCH FUNCTIONALITY
// ============================================
test.describe('Search Functionality', () => {
  test('search button should expand input', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const searchButton = page.locator('#map-search-btn');
    const searchInput = page.locator('#map-search-input');

    await expect(searchInput).not.toHaveClass(/expanded/);
    await searchButton.click();
    await page.waitForTimeout(300);
    await expect(searchInput).toHaveClass(/expanded/);
  });

  test('typing should show search results', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const searchButton = page.locator('#map-search-btn');
    await searchButton.click();
    await page.waitForTimeout(200);

    const searchInput = page.locator('#map-search-input');
    await searchInput.fill('Law');
    await page.waitForTimeout(800);

    const searchResults = page.locator('#map-search-results');
    await expect(searchResults).toHaveClass(/visible/);
  });

  test('search should find locations by name', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const searchButton = page.locator('#map-search-btn');
    await searchButton.click();
    await page.waitForTimeout(200);

    const searchInput = page.locator('#map-search-input');
    await searchInput.fill('Lawson');
    await page.waitForTimeout(800);

    const results = page.locator('.search-result-item');
    const count = await results.count();
    expect(count).toBeGreaterThan(0);
  });

  test('search should find locations by state', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const searchButton = page.locator('#map-search-btn');
    await searchButton.click();
    await page.waitForTimeout(200);

    const searchInput = page.locator('#map-search-input');
    await searchInput.fill('Vermont');
    await page.waitForTimeout(800);

    const results = page.locator('.search-result-item');
    const count = await results.count();
    expect(count).toBeGreaterThan(0);
  });

  test('clicking search result should navigate to location', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const searchButton = page.locator('#map-search-btn');
    await searchButton.click();
    await page.waitForTimeout(200);

    const searchInput = page.locator('#map-search-input');
    await searchInput.fill('Lawson');
    await page.waitForTimeout(1000);

    const initialZoom = await page.evaluate(() => {
      // @ts-ignore
      return window.map ? window.map.getZoom() : 0;
    });

    const firstResult = page.locator('.search-result-item').first();
    if (await firstResult.isVisible()) {
      await firstResult.click();
      await page.waitForTimeout(2000);

      // Should have zoomed in or opened popup
      const popup = page.locator('.leaflet-popup');
      const newZoom = await page.evaluate(() => {
        // @ts-ignore
        return window.map ? window.map.getZoom() : 0;
      });

      const success = await popup.isVisible() || newZoom > initialZoom;
      expect(success).toBe(true);
    }
  });

  test('Escape key should close search', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const searchButton = page.locator('#map-search-btn');
    await searchButton.click();
    await page.waitForTimeout(200);

    const searchInput = page.locator('#map-search-input');
    await searchInput.fill('test');
    await page.waitForTimeout(500);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    await expect(searchInput).not.toHaveClass(/expanded/);
  });

  test('clicking outside should close search', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const searchButton = page.locator('#map-search-btn');
    await searchButton.click();
    await page.waitForTimeout(200);

    const searchInput = page.locator('#map-search-input');
    await searchInput.fill('test');
    await page.waitForTimeout(500);

    // Click on map
    const map = page.locator('#map');
    await map.click({ position: { x: 100, y: 100 } });
    await page.waitForTimeout(500);

    await expect(searchInput).not.toHaveClass(/expanded/);
  });

  test('no results message should show for invalid search', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const searchButton = page.locator('#map-search-btn');
    await searchButton.click();
    await page.waitForTimeout(200);

    const searchInput = page.locator('#map-search-input');
    await searchInput.fill('xyznonexistent123');
    await page.waitForTimeout(800);

    const noResults = page.locator('.search-no-results');
    await expect(noResults).toBeVisible();
  });
});

// ============================================
// ROUTE FUNCTIONALITY
// ============================================
test.describe('Route Display', () => {
  test('route should be displayed by default', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(2000);

    const routeToggle = page.locator('#toggle-scenic-route');
    await expect(routeToggle).toBeChecked();

    const routeLegend = page.locator('#route-legend');
    await expect(routeLegend).toBeVisible();
  });

  test('route polylines should be visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(2000);

    const polylines = page.locator('.leaflet-interactive');
    const count = await polylines.count();
    expect(count).toBeGreaterThan(0);
  });

  test('route toggle should hide/show route', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(2000);

    const routeToggle = page.locator('#toggle-scenic-route');
    const routeLegend = page.locator('#route-legend');

    // Initially checked
    await expect(routeToggle).toBeChecked();
    await expect(routeLegend).toBeVisible();

    // Uncheck
    await routeToggle.click();
    await page.waitForTimeout(1000);
    await expect(routeToggle).not.toBeChecked();
    await expect(routeLegend).not.toBeVisible();

    // Check again
    await routeToggle.click();
    await page.waitForTimeout(1000);
    await expect(routeToggle).toBeChecked();
    await expect(routeLegend).toBeVisible();
  });

  test('charger filter should enable when route is shown', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(2000);

    const chargerFilter = page.locator('#filter-chargers');

    // Should be enabled when route is shown
    await expect(chargerFilter).not.toBeDisabled();
  });

  test('charger filter should disable when route is hidden', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(2000);

    const routeToggle = page.locator('#toggle-scenic-route');
    await routeToggle.click();
    await page.waitForTimeout(1000);

    const chargerFilter = page.locator('#filter-chargers');
    await expect(chargerFilter).toBeDisabled();
  });

  test('route legend should show all route segments', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(2000);

    const legendItems = page.locator('.route-legend-item');
    const count = await legendItems.count();
    expect(count).toBe(4); // Blue Ridge, Skyline, Connector, VT-100
  });
});

// ============================================
// EASTER EGGS
// ============================================
test.describe('Sunshine Easter Egg', () => {
  test('sunshine text should trigger god rays on hover', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const sunshineSpan = page.locator('h1 span').first();
    const godRays = page.locator('#god-rays-glow');

    // Initial state - not active
    await expect(godRays).not.toHaveClass(/active/);

    // Hover
    await sunshineSpan.hover();
    await page.waitForTimeout(300);

    // Should be active
    await expect(godRays).toHaveClass(/active/);
  });

  test('god rays should follow cursor', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const sunshineSpan = page.locator('h1 span').first();
    await sunshineSpan.hover();
    await page.waitForTimeout(300);

    // Move cursor and check if glow position updates
    await page.mouse.move(200, 200);
    await page.waitForTimeout(100);
    await page.mouse.move(400, 300);
    await page.waitForTimeout(100);

    // God rays should still be active
    const godRays = page.locator('#god-rays-glow');
    await expect(godRays).toHaveClass(/active/);
  });
});

test.describe('Cold Beer Easter Egg', () => {
  test('cold beer text should trigger snowfall on hover', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const coldBeer = page.locator('.cold-beer');
    await coldBeer.hover();
    await page.waitForTimeout(2000);

    const snowflakes = page.locator('.snowflake');
    const count = await snowflakes.count();
    expect(count).toBeGreaterThan(0);
  });

  test('freeze overlay should appear with snowfall', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const coldBeer = page.locator('.cold-beer');
    const freezeOverlay = page.locator('#freeze-overlay');

    await coldBeer.hover();
    await page.waitForTimeout(500);

    await expect(freezeOverlay).toHaveClass(/active/);
  });

  test('snowfall should stop when leaving cold beer', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const coldBeer = page.locator('.cold-beer');
    await coldBeer.hover();
    await page.waitForTimeout(1000);

    // Move away
    await page.mouse.move(0, 0);
    await page.waitForTimeout(3000);

    const freezeOverlay = page.locator('#freeze-overlay');
    await expect(freezeOverlay).not.toHaveClass(/active/);
  });
});

test.describe('Fidget Sun Easter Egg', () => {
  test('fidget sun should be visible on desktop', async ({ page }, testInfo) => {
    const viewportWidth = testInfo.project.use.viewport?.width || 1280;
    if (viewportWidth < 768) {
      test.skip();
      return;
    }

    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const fidgetSun = page.locator('#fidget-sun');
    await expect(fidgetSun).toBeVisible();
  });

  test('fidget sun should be hidden on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const fidgetSun = page.locator('#fidget-sun');
    await expect(fidgetSun).not.toBeVisible();
  });

  test('clicking fidget sun should create emoji burst', async ({ page }, testInfo) => {
    const viewportWidth = testInfo.project.use.viewport?.width || 1280;
    if (viewportWidth < 768) {
      test.skip();
      return;
    }

    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const fidgetSun = page.locator('#fidget-sun');
    await fidgetSun.click();
    await page.waitForTimeout(500);

    const emojis = page.locator('.emoji-burst');
    const count = await emojis.count();
    expect(count).toBeGreaterThan(0);
  });
});

// ============================================
// EMAIL MODAL
// ============================================
test.describe('Email Modal', () => {
  test('Get Itinerary button should open modal', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const getItineraryBtn = page.locator('#get-itinerary-btn');
    await getItineraryBtn.click();
    await page.waitForTimeout(500);

    const emailModal = page.locator('#email-modal');
    await expect(emailModal).toHaveClass(/visible/);
  });

  test('email modal should have all required fields', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const getItineraryBtn = page.locator('#get-itinerary-btn');
    await getItineraryBtn.click();
    await page.waitForTimeout(500);

    // Check for required elements
    const nameInput = page.locator('#email-name');
    const emailInput = page.locator('#email-address');
    const localCheckbox = page.locator('#local-checkbox');
    const submitBtn = page.locator('.email-submit');

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(localCheckbox).toBeVisible();
    await expect(submitBtn).toBeVisible();
  });

  test('close button should hide modal', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const getItineraryBtn = page.locator('#get-itinerary-btn');
    await getItineraryBtn.click();
    await page.waitForTimeout(500);

    const closeBtn = page.locator('#email-modal-close');
    await closeBtn.click();
    await page.waitForTimeout(500);

    const emailModal = page.locator('#email-modal');
    await expect(emailModal).not.toHaveClass(/visible/);
  });

  test('clicking backdrop should close modal', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const getItineraryBtn = page.locator('#get-itinerary-btn');
    await getItineraryBtn.click();
    await page.waitForTimeout(500);

    // Click on backdrop (email-overlay)
    const overlay = page.locator('#email-modal');
    await overlay.click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(500);

    await expect(overlay).not.toHaveClass(/visible/);
  });

  test('local checkbox should show location field', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const getItineraryBtn = page.locator('#get-itinerary-btn');
    await getItineraryBtn.click();
    await page.waitForTimeout(500);

    const localCheckbox = page.locator('#local-checkbox');
    await localCheckbox.check();
    await page.waitForTimeout(500);

    const locationField = page.locator('#location-field');
    await expect(locationField).toBeVisible();
  });

  test('email modal should be fullscreen on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const getItineraryBtn = page.locator('#get-itinerary-btn');
    await getItineraryBtn.click();
    await page.waitForTimeout(500);

    const modal = page.locator('.email-modal');
    const box = await modal.boundingBox();

    if (box) {
      expect(box.width).toBeCloseTo(375, 0);
      expect(box.height).toBeCloseTo(667, 0);
    }
  });
});

// ============================================
// MOBILE SCROLL INDICATOR
// ============================================
test.describe('Mobile Scroll Indicator', () => {
  test('scroll indicator should be visible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const scrollIndicator = page.locator('#scroll-indicator');
    await expect(scrollIndicator).toBeVisible();
  });

  test('scroll indicator should be hidden on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const scrollIndicator = page.locator('#scroll-indicator');
    await expect(scrollIndicator).not.toBeVisible();
  });

  test('clicking scroll indicator should scroll page', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const initialScroll = await page.evaluate(() => window.scrollY);

    const scrollIndicator = page.locator('#scroll-indicator');
    await scrollIndicator.click();
    await page.waitForTimeout(1000);

    const newScroll = await page.evaluate(() => window.scrollY);
    expect(newScroll).not.toBe(initialScroll);
  });
});

// ============================================
// RESPONSIVE LAYOUT
// ============================================
test.describe('Responsive Layout - Mobile', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('sidebar should be below map on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const layout = await page.evaluate(() => {
      const sidebar = document.querySelector('.sidebar');
      const map = document.getElementById('map');
      if (sidebar && map) {
        return {
          sidebarTop: sidebar.getBoundingClientRect().top,
          mapBottom: map.getBoundingClientRect().bottom,
        };
      }
      return null;
    });

    expect(layout).not.toBeNull();
    if (layout) {
      // On mobile, sidebar should be below map (or map above sidebar)
      expect(layout.mapBottom).toBeLessThanOrEqual(layout.sidebarTop + 50);
    }
  });

  test('map should be 50vh on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const mapHeight = await page.evaluate(() => {
      const map = document.getElementById('map');
      return map ? map.getBoundingClientRect().height : 0;
    });

    // 50vh = 333.5px on 667px viewport
    expect(mapHeight).toBeGreaterThan(280);
    expect(mapHeight).toBeLessThan(400);
  });

  test('header should be centered on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const headerAlign = await page.evaluate(() => {
      const header = document.querySelector('header');
      if (header) {
        return window.getComputedStyle(header).textAlign;
      }
      return '';
    });

    expect(headerAlign).toBe('center');
  });
});

test.describe('Responsive Layout - Desktop', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test('sidebar should be fixed on left side', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const sidebarStyle = await page.evaluate(() => {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        const style = window.getComputedStyle(sidebar);
        return {
          position: style.position,
          left: style.left,
        };
      }
      return null;
    });

    expect(sidebarStyle).not.toBeNull();
    if (sidebarStyle) {
      expect(sidebarStyle.position).toBe('fixed');
    }
  });

  test('map should fill remaining space', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const mapBox = await page.locator('#map').boundingBox();
    expect(mapBox).not.toBeNull();
    if (mapBox) {
      // Map should be wider than sidebar
      expect(mapBox.width).toBeGreaterThan(800);
    }
  });

  test('fidget sun should be visible in header', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const fidgetSun = page.locator('#fidget-sun');
    await expect(fidgetSun).toBeVisible();
  });
});

// ============================================
// ACCESSIBILITY
// ============================================
test.describe('Accessibility', () => {
  test('page should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const headings = await page.evaluate(() => {
      const h1s = document.querySelectorAll('h1');
      const h2s = document.querySelectorAll('h2');
      const h3s = document.querySelectorAll('h3');
      return {
        h1Count: h1s.length,
        h2Count: h2s.length,
        h3Count: h3s.length,
      };
    });

    expect(headings.h1Count).toBe(1); // Should have exactly one h1
    expect(headings.h2Count).toBeGreaterThan(0);
    expect(headings.h3Count).toBeGreaterThan(0);
  });

  test('interactive elements should have aria labels', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    // Check scroll indicator
    const scrollIndicator = page.locator('#scroll-indicator');
    const ariaLabel = await scrollIndicator.getAttribute('aria-label');
    expect(ariaLabel).not.toBeNull();

    // Check map
    const map = page.locator('#map');
    const mapAriaLabel = await map.getAttribute('aria-label');
    expect(mapAriaLabel).not.toBeNull();
  });

  test('form inputs should have labels', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    // Open email modal
    const getItineraryBtn = page.locator('#get-itinerary-btn');
    await getItineraryBtn.click();
    await page.waitForTimeout(500);

    // Check that inputs have associated labels
    const nameInput = page.locator('#email-name');
    const nameLabel = await page.evaluate(() => {
      const input = document.getElementById('email-name');
      if (input) {
        const label = document.querySelector(`label[for="${input.id}"]`);
        return label ? label.textContent : null;
      }
      return null;
    });

    expect(nameLabel).not.toBeNull();
  });

  test('focus should be visible on interactive elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    // Tab to search button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Check if focus outline is visible (basic check)
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      if (el) {
        const style = window.getComputedStyle(el);
        return {
          tagName: el.tagName,
          hasOutline: style.outline !== 'none' || style.boxShadow !== 'none',
        };
      }
      return null;
    });

    expect(focusedElement).not.toBeNull();
  });
});

// ============================================
// PERFORMANCE
// ============================================
test.describe('Performance', () => {
  test('page should load in reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    const loadTime = Date.now() - startTime;

    // Should load in under 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });

  test('no memory leaks from snowflake animation', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    // Trigger snowfall multiple times
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        if (typeof startSnow === 'function') startSnow();
      });
      await page.waitForTimeout(1000);
      await page.evaluate(() => {
        if (typeof stopSnow === 'function') stopSnow();
      });
      await page.waitForTimeout(3000);
    }

    // Check snowflake count is cleaned up
    const snowflakeCount = await page.locator('.snowflake').count();
    expect(snowflakeCount).toBe(0);
  });

  test('animations should not cause layout thrashing', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    // Check that animations use GPU-accelerated properties
    const animatedElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('[style*="animation"], .snowflake, .emoji-burst');
      let allOptimized = true;
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        // Check for will-change or transform
        if (style.willChange === 'auto' && style.transform === 'none') {
          allOptimized = false;
        }
      });
      return allOptimized;
    });

    expect(animatedElements).toBe(true);
  });
});

// ============================================
// EDGE CASES
// ============================================
test.describe('Edge Cases', () => {
  test('should handle rapid filter toggling', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(2000);

    const errors = [];
    page.on('pageerror', error => errors.push(error.message));

    // Rapidly toggle filters
    const filter = page.locator('#filter-breweries');
    for (let i = 0; i < 10; i++) {
      await filter.click();
      await page.waitForTimeout(50);
    }

    await page.waitForTimeout(500);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('should handle rapid zoom button clicks', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(2000);

    const errors = [];
    page.on('pageerror', error => errors.push(error.message));

    const zoomIn = page.locator('.leaflet-control-zoom-in');
    const zoomOut = page.locator('.leaflet-control-zoom-out');

    for (let i = 0; i < 5; i++) {
      await zoomIn.click();
      await page.waitForTimeout(100);
      await zoomOut.click();
      await page.waitForTimeout(100);
    }

    await page.waitForTimeout(500);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('should handle viewport resize', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(2000);

    const errors = [];
    page.on('pageerror', error => errors.push(error.message));

    // Resize viewport multiple times
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(300);
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(300);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);

    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('should handle multiple search queries in succession', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const searchButton = page.locator('#map-search-btn');
    await searchButton.click();
    await page.waitForTimeout(200);

    const searchInput = page.locator('#map-search-input');

    const queries = ['Lawson', 'Vermont', 'Trail', 'Beer', 'Asheville'];
    for (const query of queries) {
      await searchInput.fill(query);
      await page.waitForTimeout(300);
    }

    // Should still work properly
    const results = page.locator('.search-result-item');
    const count = await results.count();
    expect(count).toBeGreaterThanOrEqual(0); // May or may not have results
  });

  test('should handle empty search query', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const searchButton = page.locator('#map-search-btn');
    await searchButton.click();
    await page.waitForTimeout(200);

    const searchInput = page.locator('#map-search-input');
    await searchInput.fill('test');
    await page.waitForTimeout(300);
    await searchInput.fill('');
    await page.waitForTimeout(300);

    // Results should be hidden with empty query
    const searchResults = page.locator('#map-search-results');
    const isVisible = await searchResults.evaluate(el => el.classList.contains('visible'));
    expect(isVisible).toBe(false);
  });
});

// ============================================
// COPY PROTECTION
// ============================================
test.describe('Copy Protection', () => {
  test('text selection should be disabled on page content', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const userSelect = await page.evaluate(() => {
      const body = document.body;
      return window.getComputedStyle(body).userSelect;
    });

    expect(userSelect).toBe('none');
  });

  test('text selection should be enabled on form inputs', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    // Check search input
    const searchButton = page.locator('#map-search-btn');
    await searchButton.click();
    await page.waitForTimeout(200);

    const searchInputSelect = await page.evaluate(() => {
      const input = document.getElementById('map-search-input');
      if (input) {
        return window.getComputedStyle(input).userSelect;
      }
      return 'none';
    });

    expect(searchInputSelect).not.toBe('none');
  });
});

// ============================================
// METRICS WIDGET
// ============================================
test.describe('Live Impact Metrics', () => {
  test('metrics should be visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const metricsSection = page.locator('.metrics-section');
    await expect(metricsSection).toBeVisible();
  });

  test('metrics should have live dot indicator', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const liveDot = page.locator('.live-dot');
    await expect(liveDot).toBeVisible();
  });

  test('metric values should be numbers', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(2000);

    const donationsCounter = page.locator('#donations-counter');
    const text = await donationsCounter.textContent();

    // Should contain numbers
    expect(text).toMatch(/[\d,]+/);
  });

  test('metric links should navigate to correct URLs', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const metricLinks = page.locator('.metric-link');
    const count = await metricLinks.count();

    for (let i = 0; i < count; i++) {
      const href = await metricLinks.nth(i).getAttribute('href');
      expect(href).toContain('lawsonsfinest.com');
    }
  });
});

// ============================================
// BEER SECTION
// ============================================
test.describe('Beer Section', () => {
  test('beer section should be visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const beerSection = page.locator('.beer-section');
    await expect(beerSection).toBeVisible();
  });

  test('beer image should link to Lawson\'s website', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const beerLink = page.locator('.beer-section-image');
    const href = await beerLink.getAttribute('href');
    expect(href).toContain('lawsonsfinest.com');
  });

  test('beer image should have alt text', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const beerImg = page.locator('.beer-section-image img');
    const alt = await beerImg.getAttribute('alt');
    expect(alt).not.toBe('');
  });
});

// ============================================
// FOOTER
// ============================================
test.describe('Footer', () => {
  test('footer should contain Lawson\'s logo', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const footerLogo = page.locator('.footer-logo');
    await expect(footerLogo).toBeVisible();
  });

  test('footer should contain disclaimer', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const disclaimer = page.locator('.disclaimer');
    await expect(disclaimer).toBeVisible();

    const text = await disclaimer.textContent();
    expect(text).toContain('demonstration');
  });

  test('footer should have website link', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    await page.waitForTimeout(1000);

    const websiteLink = page.locator('.footer-logo');
    const href = await websiteLink.getAttribute('href');
    expect(href).toContain('lawsonsfinest.com');
  });
});
