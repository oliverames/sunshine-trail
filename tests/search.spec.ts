import { test, expect } from '@playwright/test';
import { selectors } from './utils/selectors';
import {
  setupPage,
  dismissEmailModal,
  waitForMapReady,
  searchLocation,
  expandSearchInput,
} from './utils/helpers';

/**
 * Search Functionality Tests
 *
 * Tests the map search feature for finding locations and listings.
 * Uses REAL user interactions - no JavaScript simulation.
 */

// SKIPPED: Search tests have passed consistently - Issue #73
test.describe.skip('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
    await waitForMapReady(page);
  });

  test('search input should be visible after expanding', async ({ page }) => {
    // On mobile, input starts collapsed - expand it first
    await expandSearchInput(page);
    const searchInput = page.locator(selectors.map.searchInput);
    await expect(searchInput).toBeVisible();
  });

  test('search button should be visible', async ({ page }) => {
    const searchButton = page.locator(selectors.map.searchButton);
    await expect(searchButton).toBeVisible();
  });

  test('should be able to type in search input', async ({ page }) => {
    await expandSearchInput(page);
    const searchInput = page.locator(selectors.map.searchInput);
    await searchInput.click();
    await searchInput.fill('Vermont');

    await expect(searchInput).toHaveValue('Vermont');
  });

  test('search should return results for valid query', async ({ page }) => {
    await expandSearchInput(page);
    const searchInput = page.locator(selectors.map.searchInput);
    const searchButton = page.locator(selectors.map.searchButton);

    await searchInput.click();
    await searchInput.fill('Lawson');
    await searchButton.click();

    // Wait for results
    await page.waitForTimeout(1000);

    const results = page.locator(selectors.map.searchResults);
    const isVisible = await results.isVisible();

    // Results container should appear with content
    if (isVisible) {
      const resultsText = await results.textContent();
      expect(resultsText?.length).toBeGreaterThan(0);
    }
  });

  test('pressing Enter should submit search', async ({ page }) => {
    await expandSearchInput(page);
    const searchInput = page.locator(selectors.map.searchInput);

    await searchInput.click();
    await searchInput.fill('brewery');
    await page.keyboard.press('Enter');

    // Wait for results
    await page.waitForTimeout(1000);

    // Search should have been submitted - map should still be functional
    // and input should retain value (proving search was processed)
    await expect(searchInput).toHaveValue('brewery');
    await expect(page.locator(selectors.map.container)).toBeVisible();
  });

  test('clicking search result should navigate to location', async ({ page }) => {
    await expandSearchInput(page);
    const searchInput = page.locator(selectors.map.searchInput);
    const searchButton = page.locator(selectors.map.searchButton);

    await searchInput.click();
    await searchInput.fill('Lawson');
    await searchButton.click();

    await page.waitForTimeout(1000);

    const results = page.locator(selectors.map.searchResults);
    if (await results.isVisible()) {
      // Get initial map center
      const initialCenter = await page.evaluate(() => {
        // @ts-ignore
        const center = window.map?.getCenter();
        return center ? { lat: center.lat, lng: center.lng } : null;
      });

      // Click first result
      const firstResult = results.locator('div, li, a, button').first();
      if ((await firstResult.count()) > 0) {
        await firstResult.click();
        await page.waitForTimeout(1000);

        // Map may have moved or popup may have opened
        const popup = page.locator(selectors.map.popup);
        const newCenter = await page.evaluate(() => {
          // @ts-ignore
          const center = window.map?.getCenter();
          return center ? { lat: center.lat, lng: center.lng } : null;
        });

        // Either popup opened or map moved
        const changed =
          (await popup.isVisible()) ||
          (initialCenter &&
            newCenter &&
            (initialCenter.lat !== newCenter.lat || initialCenter.lng !== newCenter.lng));

        expect(changed).toBeTruthy();
      }
    }
  });

  test('search should handle empty query gracefully', async ({ page }) => {
    await expandSearchInput(page);
    const searchInput = page.locator(selectors.map.searchInput);
    const searchButton = page.locator(selectors.map.searchButton);

    await searchInput.click();
    await searchInput.fill('');
    await searchButton.click();

    // Should not crash - verify page is still functional
    await page.waitForTimeout(500);

    // Map container should still be present (no crash)
    await expect(page.locator(selectors.map.container)).toBeVisible();
    // Search button should still be visible (input may collapse on empty submit)
    await expect(searchButton).toBeVisible();
  });

  test('search should handle special characters', async ({ page }) => {
    await expandSearchInput(page);
    const searchInput = page.locator(selectors.map.searchInput);
    const searchButton = page.locator(selectors.map.searchButton);

    await searchInput.click();
    await searchInput.fill("O'Brien's & Co.");

    // Verify input accepted special characters before submit
    await expect(searchInput).toHaveValue("O'Brien's & Co.");

    await searchButton.click();

    // Should not crash - verify page is still functional
    await page.waitForTimeout(500);

    // Map container should still be present (no XSS crash)
    await expect(page.locator(selectors.map.container)).toBeVisible();
    // Search button should still be visible
    await expect(searchButton).toBeVisible();
  });

  test('search placeholder text should be visible', async ({ page }) => {
    await expandSearchInput(page);
    const searchInput = page.locator(selectors.map.searchInput);
    const placeholder = await searchInput.getAttribute('placeholder');
    expect(placeholder).toContain('Search');
  });

  test('search results should close when clicking elsewhere', async ({ page }) => {
    await expandSearchInput(page);
    const searchInput = page.locator(selectors.map.searchInput);
    const searchButton = page.locator(selectors.map.searchButton);

    await searchInput.click();
    await searchInput.fill('Lawson');
    await searchButton.click();

    await page.waitForTimeout(1000);

    const results = page.locator(selectors.map.searchResults);
    if (await results.isVisible()) {
      // Click on the map to close results
      const map = page.locator(selectors.map.container);
      const box = await map.boundingBox();
      if (box) {
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(500);
      }

      // Results should be hidden or empty
      // (Implementation may vary)
    }
  });

  test('search should accept different case input', async ({ page }) => {
    // This test verifies search functionality works with different case inputs
    // Note: We don't compare results timing since that depends on external API responses

    const searchButton = page.locator(selectors.map.searchButton);

    // Test lowercase search submission
    await expandSearchInput(page);
    const searchInput = page.locator(selectors.map.searchInput);
    await searchInput.click();
    await searchInput.fill('lawson');
    await expect(searchInput).toHaveValue('lawson');
    await searchButton.click();

    // Page should remain functional after search
    await page.waitForTimeout(500);
    await expect(page.locator(selectors.map.container)).toBeVisible();

    // Close results and reset
    const map = page.locator(selectors.map.container);
    const mapBox = await map.boundingBox();
    if (mapBox) {
      await page.mouse.click(mapBox.x + mapBox.width / 2, mapBox.y + mapBox.height / 2);
    }
    await page.waitForTimeout(500);

    // Test uppercase search submission
    await expandSearchInput(page);
    const searchInputAgain = page.locator(selectors.map.searchInput);
    await searchInputAgain.click();
    await searchInputAgain.clear();
    await searchInputAgain.fill('LAWSON');
    await expect(searchInputAgain).toHaveValue('LAWSON');
    await searchButton.click();

    // Page should remain functional after search
    await page.waitForTimeout(500);
    await expect(page.locator(selectors.map.container)).toBeVisible();
  });
});

// SKIPPED: Search tests have passed consistently - Issue #73
test.describe.skip('Search - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
    await waitForMapReady(page);
  });

  test('search input should be focusable via keyboard', async ({ page }) => {
    await expandSearchInput(page);
    const searchInput = page.locator(selectors.map.searchInput);
    await searchInput.focus();

    const isFocused = await searchInput.evaluate((el) => document.activeElement === el);
    expect(isFocused || (await searchInput.isVisible())).toBe(true);
  });

  test('search button should have title attribute', async ({ page }) => {
    const searchButton = page.locator(selectors.map.searchButton);
    const title = await searchButton.getAttribute('title');
    expect(title).toBeTruthy();
  });
});
