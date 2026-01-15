// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    // Mobile sizes
    {
      name: 'mobile-small',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 320, height: 568 },
      },
    },
    {
      name: 'mobile-medium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 375, height: 667 },
      },
    },
    {
      name: 'mobile-large',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 428, height: 926 },
      },
    },
    // Tablet sizes
    {
      name: 'tablet-small',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'tablet-medium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 820, height: 1180 },
      },
    },
    {
      name: 'tablet-large',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1024, height: 768 },
      },
    },
    // Desktop sizes
    {
      name: 'desktop-small',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'desktop-medium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'desktop-large',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],
  webServer: {
    command: 'npx serve -l 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 10000,
  },
});
