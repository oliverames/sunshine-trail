import { test, expect } from '@playwright/test';
import { setupPage, waitForMapReady } from './utils/helpers';
import { selectors } from './utils/selectors';

test.describe('Release readiness', () => {
  test('identifies the author and independent concept in page metadata', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveTitle('The Sunshine Trail | Independent campaign concept');
    await expect(page.locator('meta[name="author"]')).toHaveAttribute('content', 'Oliver Ames');
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      'The Sunshine Trail | Independent campaign concept'
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(0);
  });

  test('keeps map attribution visible', async ({ page }) => {
    await setupPage(page);
    await waitForMapReady(page);

    const attribution = page.locator('.leaflet-control-attribution');
    await expect(attribution).toBeVisible();
    await expect(attribution).toContainText('OpenStreetMap');
    await expect(attribution).toContainText('CARTO');
  });

  test('labels impact figures as illustrative projections', async ({ page }) => {
    await setupPage(page);

    await expect(page.locator('.metrics-section-header h3')).toContainText('Illustrative Impact');
    await expect(page.locator('.metrics-tagline')).toHaveText(
      "Campaign projections for this prototype, not live Lawson's reporting."
    );
  });

  test('previews signup without transmitting form data', async ({ page }) => {
    const outboundSubmissions: string[] = [];
    page.on('request', request => {
      if (request.method() !== 'GET' || request.url().includes('/reverse?')) {
        outboundSubmissions.push(`${request.method()} ${request.url()}`);
      }
    });

    await setupPage(page);
    await page.locator(selectors.route.itineraryButton).click();

    await expect(page.locator('#email-modal h2')).toHaveText('Preview the Road Trip Signup');
    await page.locator(selectors.emailModal.nameInput).fill('Test User');
    await page.locator(selectors.emailModal.emailInput).fill('test@example.com');
    await page.locator(selectors.emailModal.submitButton).click();

    await expect(page.locator('.email-form-success')).toHaveText(
      'Prototype complete. Nothing was sent or stored.'
    );
    expect(outboundSubmissions).toEqual([]);
  });
});
