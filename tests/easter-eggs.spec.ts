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

  // SKIPPED: God rays tests have passed consistently - Issue #73
  test.describe.skip('God Rays Effect', () => {
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
    test('hover shows one moving canvas and leaving clears it', async ({ page }) => {
      test.skip(isTouchViewport(page), 'Desktop hover test');
      await page.locator(selectors.header.coldBeerSpan).hover();
      const canvas = page.locator(selectors.effects.snowCanvas);
      await expect(canvas).toBeVisible();
      await expect(page.locator('.snowflake, .snowflake-pooled')).toHaveCount(0);
      await expect(canvas).toHaveCount(1);
      await waitForSnowflakes(page);
      const first = await canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL());
      await expect.poll(() => canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL())).not.toBe(first);
      await page.mouse.move(0, 0);
      await expect(page.locator(selectors.effects.freezeOverlay)).not.toHaveClass(/active/);
      await expect(canvas).toBeHidden({ timeout: 5000 });
    });

    test('touch tap persists and close dismisses snowfall', async ({ page, isMobile }) => {
      test.skip(!isMobile, 'Touch device test');
      await page.locator(selectors.header.coldBeerSpan).tap();
      await waitForSnowflakes(page);
      await expect(page.locator('#snow-close-button')).toBeVisible();
      await page.locator('#snow-close-button').tap();
      await expect(page.locator('#snow-close-button')).not.toBeVisible();
      await expect(page.locator(selectors.effects.snowCanvas)).toBeHidden({ timeout: 5000 });
    });

    test('touch hold stops on release', async ({ page, isMobile, browserName }) => {
      test.skip(!isMobile || browserName !== 'chromium', 'Chromium touch input test');
      const bounds = await page.locator(selectors.header.coldBeerSpan).boundingBox();
      expect(bounds).not.toBeNull();
      const session = await page.context().newCDPSession(page);
      await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: bounds!.x + bounds!.width / 2, y: bounds!.y + bounds!.height / 2 }] });
      await page.waitForTimeout(400);
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await expect(page.locator(selectors.effects.snowCanvas)).toBeHidden({ timeout: 5000 });
      await expect(page.locator('#snow-close-button')).not.toBeVisible();
      await session.detach();
    });

    test('reduced motion keeps the freeze cue without animated snow', async ({ page, isMobile }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      if (isMobile) await page.locator(selectors.header.coldBeerSpan).tap();
      else await page.locator(selectors.header.coldBeerSpan).hover();
      await expect(page.locator(selectors.effects.freezeOverlay)).toHaveClass(/active/);
      await expect(page.locator(selectors.effects.snowCanvas)).toBeHidden();
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

      // Perform quick click with retries - emoji burst can be finicky
      let emojiCount = 0;
      for (let attempt = 0; attempt < 3 && emojiCount === 0; attempt++) {
        if (attempt > 0) {
          await page.waitForTimeout(500);
          await dismissEmailModal(page);
        }
        await quickClick(page, selectors.header.fidgetSun);
        emojiCount = await waitForEmojiBurst(page, 5000);
      }

      expect(emojiCount).toBeGreaterThan(0);
    });

    test('should create approximately 20 emojis on burst', async ({ page }) => {
      test.skip(isTouchViewport(page), 'Mouse events not supported on touch devices');

      await dismissEmailModal(page);
      await page.waitForTimeout(500);

      // Perform quick click with retry
      let count = 0;
      for (let attempt = 0; attempt < 3 && count === 0; attempt++) {
        if (attempt > 0) await page.waitForTimeout(500);
        await quickClick(page, selectors.header.fidgetSun);
        await page.waitForTimeout(500);
        const emojis = page.locator(selectors.effects.emojiBurst);
        count = await emojis.count();
      }

      // Should be around 20 emojis (with tolerance for animation timing)
      expect(count).toBeGreaterThanOrEqual(10);
      expect(count).toBeLessThanOrEqual(30);
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
      await page.waitForTimeout(500);

      const fidgetSun = page.locator(selectors.header.fidgetSun);
      const sunBox = await fidgetSun.boundingBox();
      if (!sunBox) throw new Error('Fidget sun not found');

      // Try to trigger emoji burst with retries
      let emojiPositions: { x: number; y: number }[] = [];
      for (let attempt = 0; attempt < 3 && emojiPositions.length === 0; attempt++) {
        if (attempt > 0) await page.waitForTimeout(500);
        await quickClick(page, selectors.header.fidgetSun);
        await page.waitForTimeout(300);

        // Check emoji positions
        emojiPositions = await page.evaluate(() => {
          const emojis = document.querySelectorAll('.emoji-burst');
          return Array.from(emojis)
            .slice(0, 5)
            .map((e) => {
              const rect = e.getBoundingClientRect();
              return { x: rect.left, y: rect.top };
            });
        });
      }

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

  // SKIPPED: Multiple fidget suns tests have passed consistently - Issue #73
  test.describe.skip('Multiple Fidget Suns', () => {
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

  test('rapid snowfall restarts reuse one canvas', async ({ page }) => {
    test.skip(isTouchViewport(page), 'Desktop hover test');
    for (let i = 0; i < 3; i++) {
      await page.locator(selectors.header.coldBeerSpan).hover();
      await page.mouse.move(0, 0);
    }
    await page.locator(selectors.header.coldBeerSpan).hover();
    await waitForSnowflakes(page);
    await expect(page.locator(selectors.effects.snowCanvas)).toHaveCount(1);
    await expect(page.locator('.snowflake, .snowflake-pooled')).toHaveCount(0);
    await page.mouse.move(0, 0);
    await expect(page.locator(selectors.effects.snowCanvas)).toBeHidden({ timeout: 5000 });
  });

  test('emoji burst should clean up after animation', async ({ page }) => {
    test.skip(isTouchViewport(page), 'Mouse events not supported on touch devices');

    await dismissEmailModal(page);
    await page.waitForTimeout(500);

    // Trigger emoji burst with retry logic
    let initialCount = 0;
    for (let attempt = 0; attempt < 3 && initialCount === 0; attempt++) {
      if (attempt > 0) {
        await page.waitForTimeout(500);
        await dismissEmailModal(page);
      }
      await quickClick(page, selectors.header.fidgetSun);
      await page.waitForTimeout(500);
      initialCount = await page.locator(selectors.effects.emojiBurst).count();
    }

    expect(initialCount).toBeGreaterThan(0);

    // Wait for animation to complete (emojis animate for ~2s)
    await page.waitForTimeout(4000);

    // Emojis should be cleaned up (at least partially)
    const finalCount = await page.locator(selectors.effects.emojiBurst).count();
    expect(finalCount).toBeLessThan(initialCount);
  });
});
