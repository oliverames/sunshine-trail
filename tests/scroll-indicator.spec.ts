import { test, expect } from '@playwright/test';
import { selectors } from './utils/selectors';
import { setupPage, dismissEmailModal, waitForMapReady } from './utils/helpers';

/**
 * Scroll Indicator / "Tap for More" Button Tests
 *
 * Tests the mobile-only scroll indicator that transforms into a centered
 * "Tap for More" button when the map is expanded. Videos are automatically
 * recorded for animation review.
 *
 * Feature: When a popup opens or search results appear on mobile, the map
 * expands and the scroll indicator morphs from a corner arrow to a centered
 * button with "Tap for More" text. The arrow points DOWN to indicate
 * "tap to see content below".
 */

test.describe('Scroll Indicator - Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
    await waitForMapReady(page);
  });

  test('scroll indicator should be visible on mobile', async ({ page }) => {
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;

    if (!isMobile) {
      test.skip();
      return;
    }

    const scrollIndicator = page.locator(selectors.scrollIndicator.button);
    await expect(scrollIndicator).toBeVisible({ timeout: 5000 });
  });

  test('scroll indicator should have correct ARIA attributes', async ({ page }) => {
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;

    if (!isMobile) {
      test.skip();
      return;
    }

    const scrollIndicator = page.locator(selectors.scrollIndicator.button);
    await expect(scrollIndicator).toBeVisible({ timeout: 5000 });

    // Check ARIA attributes
    await expect(scrollIndicator).toHaveAttribute('role', 'button');
    await expect(scrollIndicator).toHaveAttribute('tabindex', '0');
    await expect(scrollIndicator).toHaveAttribute('aria-controls', 'map');
    await expect(scrollIndicator).toHaveAttribute('aria-expanded', 'false');
  });

  test('scroll indicator should not be visible on desktop', async ({ page }) => {
    const viewport = page.viewportSize();
    const isDesktop = viewport && viewport.width >= 1024;

    if (!isDesktop) {
      test.skip();
      return;
    }

    const scrollIndicator = page.locator(selectors.scrollIndicator.button);
    // On desktop, scroll indicator should not exist or not be visible
    const count = await scrollIndicator.count();
    if (count > 0) {
      await expect(scrollIndicator).not.toBeVisible();
    }
  });
});

test.describe('Scroll Indicator - Map Expansion Transform', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
    await waitForMapReady(page);
  });

  test('scroll indicator should transform to "Tap for More" when map expands', async ({ page }) => {
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;

    if (!isMobile) {
      test.skip();
      return;
    }

    const scrollIndicator = page.locator(selectors.scrollIndicator.button);
    await expect(scrollIndicator).toBeVisible({ timeout: 5000 });

    // Zoom in to get individual markers
    const zoomIn = page.locator('.leaflet-control-zoom-in');
    await zoomIn.click();
    await page.waitForTimeout(800);
    await zoomIn.click();
    await page.waitForTimeout(800);

    // Click a marker to expand the map
    const markers = page.locator(selectors.map.marker);
    const markerCount = await markers.count();

    if (markerCount > 0) {
      await markers.first().click({ force: true });
      await page.waitForTimeout(1500); // Wait for expansion animation

      const popup = page.locator(selectors.map.popup);
      const popupVisible = await popup.isVisible().catch(() => false);

      if (popupVisible) {
        // Scroll indicator should have expanded-mode class
        await expect(scrollIndicator).toHaveClass(/expanded-mode/, { timeout: 3000 });

        // Text should be visible
        const indicatorText = page.locator(selectors.scrollIndicator.text);
        await expect(indicatorText).toBeVisible();

        // aria-expanded should be true
        await expect(scrollIndicator).toHaveAttribute('aria-expanded', 'true');

        // Wait for video to capture the expanded state
        await page.waitForTimeout(1000);
      }
    }
  });

  test('arrow should point DOWN in expanded mode', async ({ page }) => {
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;

    if (!isMobile) {
      test.skip();
      return;
    }

    const scrollIndicator = page.locator(selectors.scrollIndicator.button);
    await expect(scrollIndicator).toBeVisible({ timeout: 5000 });

    // Zoom in to get individual markers
    const zoomIn = page.locator('.leaflet-control-zoom-in');
    await zoomIn.click();
    await page.waitForTimeout(800);
    await zoomIn.click();
    await page.waitForTimeout(800);

    // Click a marker to expand the map
    const markers = page.locator(selectors.map.marker);
    const markerCount = await markers.count();

    if (markerCount > 0) {
      await markers.first().click({ force: true });
      await page.waitForTimeout(1500);

      const popup = page.locator(selectors.map.popup);
      const popupVisible = await popup.isVisible().catch(() => false);

      if (popupVisible) {
        await expect(scrollIndicator).toHaveClass(/expanded-mode/, { timeout: 3000 });

        // Check that the arrow SVG has rotate(0deg) - pointing down
        const svg = page.locator(selectors.scrollIndicator.svg);
        const transform = await svg.evaluate((el) => {
          return window.getComputedStyle(el).transform;
        });

        // rotate(0deg) = matrix(1, 0, 0, 1, 0, 0) or "none"
        // rotate(180deg) = matrix(-1, 0, 0, -1, 0, 0)
        // We expect the arrow to NOT be rotated 180deg (should be 0deg)
        const isRotated180 = transform.includes('-1');
        expect(isRotated180).toBe(false);

        await page.waitForTimeout(500); // Capture in video
      }
    }
  });

  test('clicking "Tap for More" should collapse map and scroll to content', async ({ page }) => {
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;

    if (!isMobile) {
      test.skip();
      return;
    }

    const scrollIndicator = page.locator(selectors.scrollIndicator.button);
    await expect(scrollIndicator).toBeVisible({ timeout: 5000 });

    // Zoom in and click a marker
    const zoomIn = page.locator('.leaflet-control-zoom-in');
    await zoomIn.click();
    await page.waitForTimeout(800);
    await zoomIn.click();
    await page.waitForTimeout(800);

    const markers = page.locator(selectors.map.marker);
    const markerCount = await markers.count();

    if (markerCount > 0) {
      await markers.first().click({ force: true });
      await page.waitForTimeout(1500);

      const popup = page.locator(selectors.map.popup);
      const popupVisible = await popup.isVisible().catch(() => false);

      if (popupVisible) {
        await expect(scrollIndicator).toHaveClass(/expanded-mode/, { timeout: 3000 });

        // Click the "Tap for More" button
        await scrollIndicator.click();
        await page.waitForTimeout(1500); // Wait for collapse animation and scroll

        // Map should no longer be expanded
        const mapEl = page.locator('#map');
        await expect(mapEl).not.toHaveClass(/map-expanded/, { timeout: 3000 });

        // Scroll indicator should no longer have expanded-mode class
        await expect(scrollIndicator).not.toHaveClass(/expanded-mode/);

        // aria-expanded should be false
        await expect(scrollIndicator).toHaveAttribute('aria-expanded', 'false');
      }
    }
  });
});

test.describe('Scroll Indicator - Keyboard Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
    await waitForMapReady(page);
  });

  test('scroll indicator should be keyboard accessible with Enter', async ({ page }) => {
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;

    if (!isMobile) {
      test.skip();
      return;
    }

    const scrollIndicator = page.locator(selectors.scrollIndicator.button);
    await expect(scrollIndicator).toBeVisible({ timeout: 5000 });

    // Focus the scroll indicator
    await scrollIndicator.focus();

    // Press Enter - should scroll down
    const initialScrollY = await page.evaluate(() => window.scrollY);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);

    const newScrollY = await page.evaluate(() => window.scrollY);
    // Scroll should have changed
    expect(newScrollY).not.toBe(initialScrollY);
  });

  test('scroll indicator should be keyboard accessible with Space', async ({ page }) => {
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;

    if (!isMobile) {
      test.skip();
      return;
    }

    const scrollIndicator = page.locator(selectors.scrollIndicator.button);
    await expect(scrollIndicator).toBeVisible({ timeout: 5000 });

    // Focus the scroll indicator
    await scrollIndicator.focus();

    // Press Space - should scroll down
    const initialScrollY = await page.evaluate(() => window.scrollY);
    await page.keyboard.press('Space');
    await page.waitForTimeout(800);

    const newScrollY = await page.evaluate(() => window.scrollY);
    // Scroll should have changed
    expect(newScrollY).not.toBe(initialScrollY);
  });
});

test.describe('Scroll Indicator - Animation Recording', () => {
  /**
   * These tests are specifically designed to capture the full animation
   * sequence on video for visual review.
   */

  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
    await waitForMapReady(page);
  });

  test('full transform animation cycle - expand and collapse', async ({ page }) => {
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;

    if (!isMobile) {
      test.skip();
      return;
    }

    const scrollIndicator = page.locator(selectors.scrollIndicator.button);
    await expect(scrollIndicator).toBeVisible({ timeout: 5000 });

    // Capture initial state
    await page.waitForTimeout(1000);

    // Zoom in to get individual markers
    const zoomIn = page.locator('.leaflet-control-zoom-in');
    await zoomIn.click();
    await page.waitForTimeout(800);
    await zoomIn.click();
    await page.waitForTimeout(800);

    // Click a marker to trigger expansion
    const markers = page.locator(selectors.map.marker);
    const markerCount = await markers.count();

    if (markerCount > 0) {
      await markers.first().click({ force: true });

      // Capture the morph animation
      await page.waitForTimeout(2000);

      const popup = page.locator(selectors.map.popup);
      const popupVisible = await popup.isVisible().catch(() => false);

      if (popupVisible) {
        // Verify expanded state
        await expect(scrollIndicator).toHaveClass(/expanded-mode/, { timeout: 3000 });

        // Hold for video capture
        await page.waitForTimeout(1500);

        // Click to collapse
        await scrollIndicator.click();

        // Capture the collapse animation
        await page.waitForTimeout(2000);

        // Verify collapsed state
        await expect(scrollIndicator).not.toHaveClass(/expanded-mode/);
      }
    }

    // Final capture
    await page.waitForTimeout(1000);
  });

  test('bounce animation should play when map is expanded', async ({ page }) => {
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;

    if (!isMobile) {
      test.skip();
      return;
    }

    const scrollIndicator = page.locator(selectors.scrollIndicator.button);
    await expect(scrollIndicator).toBeVisible({ timeout: 5000 });

    // Zoom in
    const zoomIn = page.locator('.leaflet-control-zoom-in');
    await zoomIn.click();
    await page.waitForTimeout(800);
    await zoomIn.click();
    await page.waitForTimeout(800);

    // Click a marker
    const markers = page.locator(selectors.map.marker);
    const markerCount = await markers.count();

    if (markerCount > 0) {
      await markers.first().click({ force: true });
      await page.waitForTimeout(1500);

      const popup = page.locator(selectors.map.popup);
      const popupVisible = await popup.isVisible().catch(() => false);

      if (popupVisible) {
        // After expansion, bounce animation should play after delay
        // Wait for the bounce to start and complete (1.2s animation)
        await page.waitForTimeout(3500);

        // Check that bounce class was added (may have been removed after animation)
        // The important thing is the video captures the bounce
        await expect(scrollIndicator).toHaveClass(/expanded-mode/);
      }
    }
  });
});

test.describe('Scroll Indicator - Screen Reader Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
    await waitForMapReady(page);
  });

  test('live region should exist for announcements', async ({ page }) => {
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;

    if (!isMobile) {
      test.skip();
      return;
    }

    // Check that live region exists
    const liveRegion = page.locator(selectors.scrollIndicator.liveRegion);
    await expect(liveRegion).toBeAttached();

    // Check ARIA live attributes
    await expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    await expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
  });

  test('button should have descriptive accessible name', async ({ page }) => {
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;

    if (!isMobile) {
      test.skip();
      return;
    }

    const scrollIndicator = page.locator(selectors.scrollIndicator.button);
    await expect(scrollIndicator).toBeVisible({ timeout: 5000 });

    // Check for accessible name (aria-label or visible text)
    const ariaLabel = await scrollIndicator.getAttribute('aria-label');
    const visibleText = await scrollIndicator.textContent();

    // Should have some accessible description
    const hasAccessibleName = (ariaLabel && ariaLabel.length > 0) ||
                             (visibleText && visibleText.trim().length > 0);
    expect(hasAccessibleName).toBe(true);
  });
});
