import { defineConfig, devices } from '@playwright/test';

/**
 * Sunshine Trail E2E Test Configuration
 *
 * Covers 15 viewport sizes across mobile, tablet, and desktop breakpoints
 * to ensure comprehensive responsive testing.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 15000,
  },

  projects: [
    // ═══════════════════════════════════════════════════════════════
    // MOBILE VIEWPORTS (5 sizes)
    // ═══════════════════════════════════════════════════════════════
    {
      name: 'mobile-iphone-se',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 320, height: 568 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'mobile-android-small',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 360, height: 800 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'mobile-iphone-14',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'mobile-pixel-7',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 412, height: 915 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'mobile-iphone-14-pro-max',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 430, height: 932 },
        isMobile: true,
        hasTouch: true,
      },
    },

    // ═══════════════════════════════════════════════════════════════
    // TABLET VIEWPORTS (4 sizes)
    // ═══════════════════════════════════════════════════════════════
    {
      name: 'tablet-ipad-mini',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 768, height: 1024 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'tablet-android',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 800, height: 1280 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'tablet-ipad-air',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 820, height: 1180 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'tablet-ipad-pro',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1024, height: 1366 },
        isMobile: true,
        hasTouch: true,
      },
    },

    // ═══════════════════════════════════════════════════════════════
    // DESKTOP VIEWPORTS (6 sizes)
    // ═══════════════════════════════════════════════════════════════
    {
      name: 'desktop-small',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1024, height: 768 },
      },
    },
    {
      name: 'desktop-hd',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1366, height: 768 },
      },
    },
    {
      name: 'desktop-hd-plus',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1536, height: 864 },
      },
    },
    {
      name: 'desktop-fhd',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'desktop-qhd',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 2560, height: 1440 },
      },
    },
    {
      name: 'desktop-ultrawide',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 3440, height: 1440 },
      },
    },
  ],

  webServer: {
    command: 'npx serve -l 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 15000,
  },
});
