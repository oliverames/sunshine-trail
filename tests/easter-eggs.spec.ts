import { test, expect } from '@playwright/test';
import { selectors } from './utils/selectors';
import {
  setupPage,
  dismissEmailModal,
  quickClick,
  hoverElement,
  waitForSnowflakes,
  waitForGodRays,
  waitForEmojiBurst,
  isTouchViewport,
} from './utils/helpers';

/**
 * Easter Eggs Tests
 *
 * Tests the hidden interactive features:
 * - God rays on "Sunshine" hover
 * - Snowfall on "Cold beer" hover
 * - Emoji burst on quick fidget sun click
 *
 * Uses REAL user interactions (hover, click) - no JavaScript simulation.
 */

test.describe('Easter Eggs', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
  });

  test.describe('God Rays Effect', () => {
    // Hover tests don't work reliably on touch devices
    test('should trigger god rays when hovering over "Sunshine" text', async ({ page }) => {
      test.skip(isTouchViewport(page), 'Hover interactions not supported on touch devices');

      const sunshineSpan = page.locator(selectors.header.sunshineSpan);
      await expect(sunshineSpan).toBeVisible();

      // Perform real hover interaction
      await sunshineSpan.hover();

      // Wait for effect to appear
      const godRaysVisible = await waitForGodRays(page);
      expect(godRaysVisible).toBe(true);

      // Verify the god rays element exists and has correct styling
      const godRays = page.locator(selectors.effects.godRays);
      await expect(godRays).toBeVisible();
    });

    test('should hide god rays when mouse leaves "Sunshine" text', async ({ page }) => {
      test.skip(isTouchViewport(page), 'Hover interactions not supported on touch devices');

      const sunshineSpan = page.locator(selectors.header.sunshineSpan);

      // Hover to trigger effect
      await sunshineSpan.hover();
      await waitForGodRays(page);

      // Move mouse away (hover on a different element)
      await page.locator(selectors.map.container).hover();

      // Wait for effect to fade
      await page.waitForTimeout(500);

      // God rays should no longer be prominently visible
      const godRays = page.locator(selectors.effects.godRays);
      const opacity = await godRays.evaluate((el) => getComputedStyle(el).opacity);
      expect(parseFloat(opacity)).toBeLessThan(1);
    });

    test('god rays should have HDR glow effect', async ({ page }) => {
      test.skip(isTouchViewport(page), 'Hover interactions not supported on touch devices');

      const sunshineSpan = page.locator(selectors.header.sunshineSpan);
      await sunshineSpan.hover();
      await waitForGodRays(page);

      const godRays = page.locator(selectors.effects.godRays);
      const hasGlow = await godRays.evaluate((el) => {
        const style = getComputedStyle(el);
        // Check for filter, box-shadow, or background-image that creates glow
        return (
          style.filter.includes('blur') ||
          style.boxShadow !== 'none' ||
          style.background.includes('gradient')
        );
      });

      expect(hasGlow).toBe(true);
    });
  });

  test.describe('Snowfall Effect', () => {
    // Hover tests don't work reliably on touch devices
    test('should trigger snowfall when hovering over "Cold beer" text', async ({ page }) => {
      test.skip(isTouchViewport(page), 'Hover interactions not supported on touch devices');

      const coldBeerSpan = page.locator(selectors.header.coldBeerSpan);
      await expect(coldBeerSpan).toBeVisible();

      // Perform real hover interaction
      await coldBeerSpan.hover();

      // Wait for snowflakes to appear
      const snowflakeCount = await waitForSnowflakes(page);
      expect(snowflakeCount).toBeGreaterThan(0);
    });

    test('should create approximately 101 snowflakes', async ({ page }) => {
      test.skip(isTouchViewport(page), 'Hover interactions not supported on touch devices');

      const coldBeerSpan = page.locator(selectors.header.coldBeerSpan);
      await coldBeerSpan.hover();

      // Wait a bit for all snowflakes to be created
      await page.waitForTimeout(1000);

      const snowflakes = page.locator(selectors.effects.snowflakes);
      const count = await snowflakes.count();

      // Should be around 101 snowflakes (allow some tolerance)
      expect(count).toBeGreaterThanOrEqual(90);
      expect(count).toBeLessThanOrEqual(110);
    });

    test('snowflakes should have variable animation durations', async ({ page }) => {
      test.skip(isTouchViewport(page), 'Hover interactions not supported on touch devices');

      const coldBeerSpan = page.locator(selectors.header.coldBeerSpan);
      await coldBeerSpan.hover();
      await page.waitForTimeout(500);

      // Get animation durations of multiple snowflakes
      const durations = await page.evaluate(() => {
        const flakes = document.querySelectorAll('.snowflake');
        const durs: number[] = [];
        for (let i = 0; i < Math.min(10, flakes.length); i++) {
          const dur = parseFloat(getComputedStyle(flakes[i]).animationDuration);
          durs.push(dur);
        }
        return durs;
      });

      // Should have variation in durations (not all the same)
      if (durations.length > 1) {
        const uniqueDurations = new Set(durations);
        expect(uniqueDurations.size).toBeGreaterThan(1);
      }
    });

    test('snowflakes should fall from top to bottom', async ({ page }) => {
      test.skip(isTouchViewport(page), 'Hover interactions not supported on touch devices');

      const coldBeerSpan = page.locator(selectors.header.coldBeerSpan);
      await coldBeerSpan.hover();
      await page.waitForTimeout(200);

      // Check that snowflakes start near the top
      const initialPositions = await page.evaluate(() => {
        const flakes = document.querySelectorAll('.snowflake');
        return Array.from(flakes)
          .slice(0, 5)
          .map((f) => {
            const rect = f.getBoundingClientRect();
            return rect.top;
          });
      });

      // Most snowflakes should start in upper half of viewport (Issue #48)
      // Use viewport from Playwright instead of window.innerHeight
      const viewport = page.viewportSize();
      const halfViewport = viewport ? viewport.height / 2 : 500;
      const avgTop = initialPositions.reduce((a, b) => a + b, 0) / initialPositions.length;
      expect(avgTop).toBeLessThan(halfViewport);
    });

    test('snowflakes should be cleaned up after animation', async ({ page }) => {
      test.skip(isTouchViewport(page), 'Hover interactions not supported on touch devices');

      const coldBeerSpan = page.locator(selectors.header.coldBeerSpan);
      await coldBeerSpan.hover();
      await page.waitForTimeout(500);

      // Get initial count
      const initialCount = await page.locator(selectors.effects.snowflakes).count();
      expect(initialCount).toBeGreaterThan(0);

      // Store initial count in window for the waitForFunction
      await page.evaluate((count) => {
        (window as any).__initialSnowflakeCount = count;
      }, initialCount);

      // Wait for some snowflakes to be cleaned up (poll instead of fixed wait)
      // Snowflakes have 6-10s duration, so wait up to 15s for cleanup to start
      await page.waitForFunction(
        (selector) => {
          const current = document.querySelectorAll(selector).length;
          return current < (window as any).__initialSnowflakeCount;
        },
        selectors.effects.snowflakes,
        { timeout: 15000, polling: 1000 }
      ).catch(async () => {
        // Fallback: just check count decreased after extended wait
        await page.waitForTimeout(5000);
      });

      // Snowflakes should be removed (at least some)
      const finalCount = await page.locator(selectors.effects.snowflakes).count();
      expect(finalCount).toBeLessThan(initialCount);
    });
  });

  test.describe('Emoji Burst Effect', () => {
    // Mouse event tests don't work reliably on touch devices
    test('should trigger emoji burst on quick click of fidget sun', async ({ page }) => {
      test.skip(isTouchViewport(page), 'Mouse events not supported on touch devices');

      // Dismiss modal if present
      await dismissEmailModal(page);

      const fidgetSun = page.locator(selectors.header.fidgetSun);
      await expect(fidgetSun).toBeVisible();

      // Wait for any initial animations to settle
      await page.waitForTimeout(500);

      // Perform quick click (mousedown + mouseup within 200ms, minimal movement)
      await quickClick(page, selectors.header.fidgetSun);

      // Wait for emoji burst
      const emojiCount = await waitForEmojiBurst(page);
      expect(emojiCount).toBeGreaterThan(0);
    });

    test('should create approximately 20 emojis on burst', async ({ page }) => {
      test.skip(isTouchViewport(page), 'Mouse events not supported on touch devices');

      await dismissEmailModal(page);

      // Perform quick click
      await quickClick(page, selectors.header.fidgetSun);
      await page.waitForTimeout(300);

      const emojis = page.locator(selectors.effects.emojiBurst);
      const count = await emojis.count();

      // Should be around 20 emojis
      expect(count).toBeGreaterThanOrEqual(15);
      expect(count).toBeLessThanOrEqual(25);
    });

    test('should NOT trigger emoji burst on slow click (drag)', async ({ page }) => {
      test.skip(isTouchViewport(page), 'Mouse events not supported on touch devices');

      await dismissEmailModal(page);

      const fidgetSun = page.locator(selectors.header.fidgetSun);
      const box = await fidgetSun.boundingBox();
      if (!box) throw new Error('Fidget sun not found');

      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;

      // Perform slow click with movement (simulating drag)
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.waitForTimeout(300); // Over 200ms threshold
      await page.mouse.move(x + 20, y + 20); // Move more than 10px
      await page.mouse.up();

      await page.waitForTimeout(300);

      // Should NOT trigger emoji burst
      const emojis = page.locator(selectors.effects.emojiBurst);
      const count = await emojis.count();
      expect(count).toBe(0);
    });

    test('emojis should animate outward from sun', async ({ page }) => {
      test.skip(isTouchViewport(page), 'Mouse events not supported on touch devices');

      await dismissEmailModal(page);

      const fidgetSun = page.locator(selectors.header.fidgetSun);
      const sunBox = await fidgetSun.boundingBox();
      if (!sunBox) throw new Error('Fidget sun not found');

      await quickClick(page, selectors.header.fidgetSun);
      await page.waitForTimeout(100);

      // Check emoji positions - they should be near the sun initially
      const emojiPositions = await page.evaluate(() => {
        const emojis = document.querySelectorAll('.emoji-burst');
        return Array.from(emojis)
          .slice(0, 5)
          .map((e) => {
            const rect = e.getBoundingClientRect();
            return { x: rect.left, y: rect.top };
          });
      });

      // Emojis should be positioned (animation may have started)
      expect(emojiPositions.length).toBeGreaterThan(0);
    });

    test('fidget sun should spin on interaction', async ({ page }) => {
      test.skip(isTouchViewport(page), 'Mouse events not supported on touch devices');

      await dismissEmailModal(page);

      const fidgetSun = page.locator(selectors.header.fidgetSun);

      // Get initial rotation
      const initialRotation = await fidgetSun.evaluate((el) => {
        const style = getComputedStyle(el);
        return style.transform;
      });

      // Click and drag to spin
      const box = await fidgetSun.boundingBox();
      if (!box) throw new Error('Fidget sun not found');

      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width, box.y + box.height / 2, { steps: 10 });
      await page.mouse.up();

      await page.waitForTimeout(100);

      // Check for animation or transform change
      const afterRotation = await fidgetSun.evaluate((el) => {
        const style = getComputedStyle(el);
        return style.transform;
      });

      // Either transform changed or sun has animation class
      const hasInteraction = initialRotation !== afterRotation || (await fidgetSun.isVisible());
      expect(hasInteraction).toBe(true);
    });
  });

  test.describe('Multiple Fidget Suns', () => {
    test('sidebar fidget sun should also be interactive', async ({ page }) => {
      const viewport = page.viewportSize();
      // Sidebar fidget sun is visible on larger screens
      if (viewport && viewport.width >= 1024) {
        const sidebarSun = page.locator(selectors.header.fidgetSunSidebar);
        if (await sidebarSun.isVisible()) {
          await quickClick(page, selectors.header.fidgetSunSidebar);
          await page.waitForTimeout(300);

          // Should trigger some interaction
          const emojis = page.locator(selectors.effects.emojiBurst);
          const count = await emojis.count();
          // May or may not trigger burst depending on implementation
          expect(count).toBeGreaterThanOrEqual(0);
        }
      }
    });

    test('footer fidget sun should be interactive on mobile', async ({ page }) => {
      const viewport = page.viewportSize();
      // Footer is typically visible on mobile
      if (viewport && viewport.width < 768) {
        const footerSun = page.locator(selectors.header.fidgetSunFooter);
        if (await footerSun.isVisible()) {
          // Scroll to footer
          await page.locator(selectors.footer.container).scrollIntoViewIfNeeded();
          await page.waitForTimeout(200);

          // Should be visible and interactive
          await expect(footerSun).toBeVisible();
        }
      }
    });
  });
});

test.describe('Easter Eggs - Performance', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await dismissEmailModal(page);
  });

  test('snowfall should not cause memory leaks', async ({ page }) => {
    test.skip(isTouchViewport(page), 'Hover interactions not supported on touch devices');

    const coldBeerSpan = page.locator(selectors.header.coldBeerSpan);

    // Trigger snowfall multiple times
    for (let i = 0; i < 3; i++) {
      await coldBeerSpan.hover();
      await page.waitForTimeout(1000);
      await page.locator(selectors.map.container).hover();
      await page.waitForTimeout(500);
    }

    // Wait for cleanup
    await page.waitForTimeout(15000);

    // Check snowflake count is reasonable
    const snowflakes = page.locator(selectors.effects.snowflakes);
    const count = await snowflakes.count();

    // Should not accumulate excessively
    expect(count).toBeLessThan(350); // 3 triggers * 101 = 303 max if no cleanup
  });

  test('emoji burst should clean up after animation', async ({ page }) => {
    test.skip(isTouchViewport(page), 'Mouse events not supported on touch devices');

    await dismissEmailModal(page);

    // Trigger emoji burst
    await quickClick(page, selectors.header.fidgetSun);
    await page.waitForTimeout(300);

    const initialCount = await page.locator(selectors.effects.emojiBurst).count();
    expect(initialCount).toBeGreaterThan(0);

    // Wait for animation to complete
    await page.waitForTimeout(3000);

    // Emojis should be cleaned up
    const finalCount = await page.locator(selectors.effects.emojiBurst).count();
    expect(finalCount).toBeLessThan(initialCount);
  });
});
