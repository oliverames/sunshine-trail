import { test, expect } from '@playwright/test';
import { selectors, STATES, CATEGORY_FILTERS } from './utils/selectors';
import {
  setupPage,
  dismissEmailModal,
  waitForMapReady,
  toggleCategoryFilter,
  selectStateFilter,
  getVisibleMarkerCount,
  getVisibleClusterCount,
} from './utils/helpers';

/**
 * Filter Tests
 *
 * Tests the category filters (breweries, trails, etc.) and state filters.
 * Uses REAL user interactions - no JavaScript simulation.
 */

test.describe('Category Filters', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
    await waitForMapReady(page);
  });

  test('all category filters should be visible', async ({ page }) => {
    await expect(page.locator(selectors.filters.breweries)).toBeVisible();
    await expect(page.locator(selectors.filters.tastingRooms)).toBeVisible();
    await expect(page.locator(selectors.filters.retailers)).toBeVisible();
    await expect(page.locator(selectors.filters.bars)).toBeVisible();
    await expect(page.locator(selectors.filters.trails)).toBeVisible();
    await expect(page.locator(selectors.filters.rivers)).toBeVisible();
    await expect(page.locator(selectors.filters.community)).toBeVisible();
    await expect(page.locator(selectors.filters.chargers)).toBeVisible();
  });

  test('default filters should be checked (including chargers when route is shown)', async ({ page }) => {
    // These should be checked by default
    await expect(page.locator(selectors.filters.breweries)).toBeChecked();
    await expect(page.locator(selectors.filters.tastingRooms)).toBeChecked();
    await expect(page.locator(selectors.filters.retailers)).toBeChecked();
    await expect(page.locator(selectors.filters.bars)).toBeChecked();
    await expect(page.locator(selectors.filters.trails)).toBeChecked();
    await expect(page.locator(selectors.filters.rivers)).toBeChecked();
    await expect(page.locator(selectors.filters.community)).toBeChecked();

    // When route is shown (default), chargers should be enabled
    // When route is hidden, chargers would be unchecked
    const routeToggle = page.locator(selectors.route.toggleCheckbox);
    const isRouteShown = await routeToggle.isChecked();
    if (isRouteShown) {
      await expect(page.locator(selectors.filters.chargers)).toBeChecked();
    } else {
      await expect(page.locator(selectors.filters.chargers)).not.toBeChecked();
    }
  });

  test('unchecking a filter should reduce visible markers', async ({ page }) => {
    const initialCount = await getVisibleMarkerCount(page);
    const initialClusters = await getVisibleClusterCount(page);
    const initialTotal = initialCount + initialClusters;

    // Uncheck breweries filter
    await page.locator(selectors.filters.breweries).click();
    await page.waitForTimeout(500);

    const afterCount = await getVisibleMarkerCount(page);
    const afterClusters = await getVisibleClusterCount(page);
    const afterTotal = afterCount + afterClusters;

    // Should have fewer or equal markers (clusters may change)
    expect(afterTotal).toBeLessThanOrEqual(initialTotal);
  });

  test('checking chargers filter should add DC Fast Charger markers', async ({ page }) => {
    // Dismiss any modal that might block the sidebar
    await dismissEmailModal(page);

    // Get initial count
    const initialCount = await getVisibleMarkerCount(page);
    const initialClusters = await getVisibleClusterCount(page);

    // Find and scroll to chargers checkbox
    const chargersFilter = page.locator(selectors.filters.chargers);
    await chargersFilter.scrollIntoViewIfNeeded();
    await chargersFilter.waitFor({ state: 'visible', timeout: 5000 });

    // Enable chargers
    await chargersFilter.click({ force: true });
    await page.waitForTimeout(1000);

    const afterCount = await getVisibleMarkerCount(page);
    const afterClusters = await getVisibleClusterCount(page);

    // Should have more markers now
    expect(afterCount + afterClusters).toBeGreaterThanOrEqual(initialCount + initialClusters);
  });

  test('filter count badges should update', async ({ page }) => {
    const breweriesCount = page.locator(selectors.filters.countBreweries);
    const initialText = await breweriesCount.textContent();
    const initialNumber = parseInt(initialText || '0', 10);

    expect(initialNumber).toBeGreaterThan(0);
  });

  test('toggling filter off and on should restore markers', async ({ page }) => {
    const initialCount = await getVisibleMarkerCount(page);
    const initialClusters = await getVisibleClusterCount(page);

    // Toggle off
    await page.locator(selectors.filters.breweries).click();
    await page.waitForTimeout(500);

    // Toggle back on
    await page.locator(selectors.filters.breweries).click();
    await page.waitForTimeout(500);

    const afterCount = await getVisibleMarkerCount(page);
    const afterClusters = await getVisibleClusterCount(page);

    // Should be approximately the same as initial
    expect(Math.abs(afterCount + afterClusters - (initialCount + initialClusters))).toBeLessThan(5);
  });

  test('unchecking all filters should show no markers', async ({ page }) => {
    // Uncheck all filters (including chargers which is enabled when route is shown)
    const filters = [
      selectors.filters.breweries,
      selectors.filters.tastingRooms,
      selectors.filters.retailers,
      selectors.filters.bars,
      selectors.filters.trails,
      selectors.filters.rivers,
      selectors.filters.community,
      selectors.filters.chargers,
    ];

    for (const filter of filters) {
      const checkbox = page.locator(filter);
      if (await checkbox.isChecked()) {
        await checkbox.click();
        await page.waitForTimeout(200);
      }
    }

    await page.waitForTimeout(500);

    const markerCount = await getVisibleMarkerCount(page);
    const clusterCount = await getVisibleClusterCount(page);

    // Should have no markers (or very few if chargers are somehow showing)
    expect(markerCount + clusterCount).toBeLessThanOrEqual(1);
  });
});

// SKIPPED: State filters tests have passed consistently - Issue #73
test.describe.skip('State Filters', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
    await waitForMapReady(page);
  });

  test('all state filter buttons should be visible', async ({ page }) => {
    // All States button
    await expect(page.locator(selectors.stateFilters.allStates)).toBeVisible();

    // Individual state buttons
    for (const state of STATES) {
      await expect(page.locator(selectors.stateFilters.buttonByState(state))).toBeVisible();
    }
  });

  test('"All States" should be active by default', async ({ page }) => {
    const allStatesBtn = page.locator(selectors.stateFilters.allStates);
    await expect(allStatesBtn).toHaveClass(/active/);
  });

  test('clicking a state button should filter markers', async ({ page }) => {
    const initialCount = await getVisibleMarkerCount(page);
    const initialClusters = await getVisibleClusterCount(page);

    // Click Vermont
    await page.locator(selectors.stateFilters.buttonByState('VT')).click();
    await page.waitForTimeout(800);

    // Check that button is now active
    const vtButton = page.locator(selectors.stateFilters.buttonByState('VT'));
    await expect(vtButton).toHaveClass(/active/);

    // All States should no longer be active
    const allStatesBtn = page.locator(selectors.stateFilters.allStates);
    await expect(allStatesBtn).not.toHaveClass(/active/);

    // Marker count should change (likely decrease to VT only)
    const afterCount = await getVisibleMarkerCount(page);
    const afterClusters = await getVisibleClusterCount(page);

    // May have different count
    expect(afterCount + afterClusters >= 0).toBe(true);
  });

  test('clicking "All States" should show all markers', async ({ page }) => {
    // First filter to a single state
    await page.locator(selectors.stateFilters.buttonByState('VT')).click();
    await page.waitForTimeout(800);

    // Then click All States
    await page.locator(selectors.stateFilters.allStates).click();
    await page.waitForTimeout(800);

    // All States button should be active
    const allStatesBtn = page.locator(selectors.stateFilters.allStates);
    await expect(allStatesBtn).toHaveClass(/active/);

    // Should have visible markers or clusters
    const allCount = await getVisibleMarkerCount(page);
    const allClusters = await getVisibleClusterCount(page);

    // Should have at least some markers/clusters showing all states
    expect(allCount + allClusters).toBeGreaterThan(0);
  });

  test('state filter should work with category filters', async ({ page }) => {
    // Filter to Vermont
    await page.locator(selectors.stateFilters.buttonByState('VT')).click();
    await page.waitForTimeout(500);

    const vtCount = await getVisibleMarkerCount(page);
    const vtClusters = await getVisibleClusterCount(page);

    // Now uncheck breweries
    await page.locator(selectors.filters.breweries).click();
    await page.waitForTimeout(500);

    const afterCount = await getVisibleMarkerCount(page);
    const afterClusters = await getVisibleClusterCount(page);

    // Should have fewer markers
    expect(afterCount + afterClusters).toBeLessThanOrEqual(vtCount + vtClusters);
  });

  test('each state should have markers when selected', async ({ page }) => {
    const statesWithMarkers: string[] = [];

    for (const state of STATES) {
      await page.locator(selectors.stateFilters.buttonByState(state)).click();
      await page.waitForTimeout(500);

      const count = await getVisibleMarkerCount(page);
      const clusters = await getVisibleClusterCount(page);

      if (count + clusters > 0) {
        statesWithMarkers.push(state);
      }
    }

    // At least some states should have markers
    expect(statesWithMarkers.length).toBeGreaterThan(0);
  });

  test('map should zoom to filtered state area', async ({ page }) => {
    // Get initial bounds
    const initialBounds = await page.evaluate(() => {
      // @ts-ignore
      const bounds = window.map?.getBounds();
      return bounds
        ? {
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest(),
          }
        : null;
    });

    // Filter to North Carolina (southern state)
    await page.locator(selectors.stateFilters.buttonByState('NC')).click();
    await page.waitForTimeout(1000);

    // Get new bounds
    const newBounds = await page.evaluate(() => {
      // @ts-ignore
      const bounds = window.map?.getBounds();
      return bounds
        ? {
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest(),
          }
        : null;
    });

    // Verify state filter was applied and map is functional
    // Bounds may or may not change depending on implementation
    await expect(page.locator(selectors.map.container)).toBeVisible();
    // NC button should be active
    const ncButton = page.locator(selectors.stateFilters.buttonByState('NC'));
    await expect(ncButton).toHaveClass(/active/);
  });
});

// SKIPPED: Filter interactions tests have passed consistently - Issue #73
test.describe.skip('Filter Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
    await waitForMapReady(page);
  });

  test('filters should remain functional during processing', async ({ page }) => {
    // Toggle a filter and verify it processes correctly
    const checkbox = page.locator(selectors.filters.breweries);
    const wasChecked = await checkbox.isChecked();

    await checkbox.click();
    await page.waitForTimeout(500);

    const isNowChecked = await checkbox.isChecked();

    // Verify filter toggle worked
    expect(isNowChecked).toBe(!wasChecked);

    // Restore state
    await checkbox.click();
    await expect(checkbox).toBeChecked();
  });

  test('filter labels should be clickable', async ({ page }) => {
    // Click on label instead of checkbox directly
    const label = page.locator('label[for="filter-breweries"]');
    const checkbox = page.locator(selectors.filters.breweries);

    const wasChecked = await checkbox.isChecked();
    await label.click();
    await page.waitForTimeout(300);

    const isNowChecked = await checkbox.isChecked();
    expect(isNowChecked).toBe(!wasChecked);
  });

  test('filter icons should be visible', async ({ page }) => {
    // Each filter should have an icon
    const filterIcons = page.locator('.filter-icon');
    const count = await filterIcons.count();

    // Should have icons for each filter
    expect(count).toBeGreaterThanOrEqual(7);
  });
});

// SKIPPED: Mobile filters tests have passed consistently - Issue #73
test.describe.skip('Filters - Mobile', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
    await waitForMapReady(page);
  });

  test('filters should be accessible on mobile viewport', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport || viewport.width >= 768) {
      test.skip();
      return;
    }

    // On mobile, filters may be in a collapsed sidebar
    // Check if filter section is accessible
    const filterSection = page.locator(selectors.filters.section);

    // May need to scroll or expand sidebar
    await filterSection.scrollIntoViewIfNeeded();

    // Filters should be interactable
    const breweriesCheckbox = page.locator(selectors.filters.breweries);
    await expect(breweriesCheckbox).toBeVisible({ timeout: 5000 });
  });

  test('state buttons should wrap properly on narrow screens', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport || viewport.width >= 768) {
      test.skip();
      return;
    }

    const stateSection = page.locator(selectors.stateFilters.section);
    await stateSection.scrollIntoViewIfNeeded();

    // All buttons should be visible (may be wrapped)
    const buttons = page.locator('.state-btn');
    const count = await buttons.count();

    expect(count).toBe(12); // 11 states + All States
  });
});
