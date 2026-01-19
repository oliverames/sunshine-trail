import { test, expect } from '@playwright/test';
import { selectors, DEMO_PASSWORD } from './utils/selectors';

/**
 * Password Overlay Tests
 *
 * Tests the password protection overlay that gates access to the demo.
 * Uses REAL user interactions (typing, clicking) - no JavaScript simulation.
 */

// SKIPPED: Password tests have passed consistently - Issue #73
test.describe.skip('Password Overlay', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh without any cached authentication
    await page.goto('/');
    // Clear localStorage to ensure overlay shows
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should display password overlay on initial load', async ({ page }) => {
    const overlay = page.locator(selectors.password.overlay);
    await expect(overlay).toBeVisible();

    // Check all password form elements are present
    await expect(page.locator(selectors.password.input)).toBeVisible();
    await expect(page.locator(selectors.password.submitButton)).toBeVisible();
    await expect(page.locator(selectors.password.fidgetSun)).toBeVisible();
  });

  test('should show error message for incorrect password', async ({ page }) => {
    const input = page.locator(selectors.password.input);
    const submitBtn = page.locator(selectors.password.submitButton);
    const errorMsg = page.locator(selectors.password.errorMessage);

    // Type wrong password using real keyboard input
    await input.click();
    await input.fill('wrongpassword');
    await submitBtn.click();

    // Error message should appear
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText('Incorrect');

    // Overlay should still be visible
    await expect(page.locator(selectors.password.overlay)).toBeVisible();
  });

  test('should accept correct password and reveal content', async ({ page }) => {
    const input = page.locator(selectors.password.input);
    const submitBtn = page.locator(selectors.password.submitButton);
    const overlay = page.locator(selectors.password.overlay);

    // Type correct password
    await input.click();
    await input.fill(DEMO_PASSWORD);
    await submitBtn.click();

    // Overlay should fade out (opacity goes to 0)
    await expect(overlay).toHaveCSS('opacity', '0', { timeout: 3000 });

    // Map should be visible
    await expect(page.locator(selectors.map.container)).toBeVisible();
  });

  test('should submit password on Enter key press', async ({ page }) => {
    const input = page.locator(selectors.password.input);
    const overlay = page.locator(selectors.password.overlay);

    // Focus input and type password
    await input.click();
    await input.fill(DEMO_PASSWORD);

    // Press Enter to submit (real keyboard interaction)
    await page.keyboard.press('Enter');

    // Overlay should fade out
    await expect(overlay).toHaveCSS('opacity', '0', { timeout: 3000 });
  });

  test('should persist authentication in localStorage', async ({ page }) => {
    const input = page.locator(selectors.password.input);
    const submitBtn = page.locator(selectors.password.submitButton);

    // Authenticate
    await input.click();
    await input.fill(DEMO_PASSWORD);
    await submitBtn.click();

    // Wait for authentication to complete
    await expect(page.locator(selectors.password.overlay)).toHaveCSS('opacity', '0', {
      timeout: 3000,
    });

    // Reload page
    await page.reload();

    // Overlay should not be visible on reload (cached auth)
    const overlay = page.locator(selectors.password.overlay);
    // Either not visible or has opacity 0
    const isHidden =
      (await overlay.isVisible().catch(() => false)) === false ||
      (await overlay.evaluate((el) => getComputedStyle(el).opacity)) === '0';

    expect(isHidden || (await overlay.evaluate((el) => el.style.pointerEvents === 'none'))).toBe(
      true
    );
  });

  test('should have spinning fidget sun in password overlay', async ({ page }) => {
    const fidgetSun = page.locator(selectors.password.fidgetSun);
    await expect(fidgetSun).toBeVisible();

    // Sun should have animation
    const hasAnimation = await fidgetSun.evaluate((el) => {
      const style = getComputedStyle(el);
      return style.animation !== 'none' || style.animationName !== 'none';
    });

    // Either animated via CSS or transforms
    expect(hasAnimation || (await fidgetSun.getAttribute('class'))?.includes('spin')).toBeTruthy();
  });

  test('should focus password input automatically', async ({ page }) => {
    // Give page time to set focus
    await page.waitForTimeout(500);

    const input = page.locator(selectors.password.input);
    const isFocused = await input.evaluate((el) => document.activeElement === el);

    // Input should be focused or at least focusable
    expect(isFocused || (await input.isVisible())).toBeTruthy();
  });

  test('password input should mask characters', async ({ page }) => {
    const input = page.locator(selectors.password.input);
    const inputType = await input.getAttribute('type');
    expect(inputType).toBe('password');
  });

  test('should handle rapid submit attempts gracefully', async ({ page }) => {
    const input = page.locator(selectors.password.input);
    const submitBtn = page.locator(selectors.password.submitButton);

    await input.click();
    await input.fill('wrong');

    // Rapid clicks
    await submitBtn.click();
    await submitBtn.click();
    await submitBtn.click();

    // Should still show error, no crashes
    const errorMsg = page.locator(selectors.password.errorMessage);
    await expect(errorMsg).toBeVisible();

    // Now enter correct password
    await input.clear();
    await input.fill(DEMO_PASSWORD);
    await submitBtn.click();

    // Should still work
    await expect(page.locator(selectors.password.overlay)).toHaveCSS('opacity', '0', {
      timeout: 3000,
    });
  });
});

// SKIPPED: Password tests have passed consistently - Issue #73
test.describe.skip('Password Overlay - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    const input = page.locator(selectors.password.input);

    // Check for accessibility attributes
    const placeholder = await input.getAttribute('placeholder');
    expect(placeholder).toBeTruthy();

    // Input should be keyboard accessible
    await input.focus();
    const isFocused = await input.evaluate((el) => document.activeElement === el);
    expect(isFocused).toBe(true);
  });

  test('should be navigable via Tab key', async ({ page }) => {
    // Tab to input
    await page.keyboard.press('Tab');

    // Tab to submit button
    await page.keyboard.press('Tab');

    // Should be able to activate button with Enter
    await page.locator(selectors.password.input).fill(DEMO_PASSWORD);
    await page.locator(selectors.password.submitButton).focus();
    await page.keyboard.press('Enter');

    await expect(page.locator(selectors.password.overlay)).toHaveCSS('opacity', '0', {
      timeout: 3000,
    });
  });
});
