import { test, expect } from '@playwright/test';
import { selectors } from './utils/selectors';
import { setupPage, dismissEmailModal, waitForMapReady, isPopupFullyVisible } from './utils/helpers';

async function openPopupFromVisibleMarker(page: import('@playwright/test').Page) {
  const markers = page.locator(selectors.map.marker);
  const clusters = page.locator(selectors.map.markerCluster);
  const clickableIndex = (locator: import('@playwright/test').Locator) => locator.evaluateAll((elements) => elements.findIndex((element) => {
    const box = element.getBoundingClientRect();
    const target = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
    return box.width > 0 && box.height > 0 && target !== null &&
      (target === element || element.contains(target));
  }));
  let markerIndex = await clickableIndex(markers);
  // Follow visible clusters toward their data rather than zooming the map
  // center until all points leave the exposed map area.
  for (let i = 0; markerIndex < 0 && i < 8; i++) {
    let clusterIndex = -1;
    await expect.poll(async () => {
      clusterIndex = await clickableIndex(clusters);
      return clusterIndex;
    }, { message: 'Expected an unobscured cluster to navigate toward markers' }).toBeGreaterThanOrEqual(0);
    const previousZoom = await page.evaluate(() => (window as any).map.getZoom());
    // Navigate clusters with the mouse before the touch case. Consecutive
    // same-position taps intentionally trigger Leaflet double-tap zoom.
    await clusters.nth(clusterIndex).click();
    await page.waitForFunction((previous) => {
      const map = (window as any).map;
      return map.getZoom() > previous && !map._animatingZoom && !map._panAnim?._inProgress;
    }, previousZoom);
    markerIndex = await clickableIndex(markers);
  }
  await expect.poll(async () => {
    markerIndex = await clickableIndex(markers);
    return markerIndex;
  }, { message: 'Expected a marker that can receive a real pointer click' }).toBeGreaterThanOrEqual(0);
  if (test.info().project.use.hasTouch) {
    // Define separate single-tap input gestures, outside Leaflet's 250ms
    // double-tap window. App readiness is checked separately above/below.
    await page.waitForTimeout(350);
    await markers.nth(markerIndex).tap();
  }
  else await markers.nth(markerIndex).click();
  const popup = page.locator(selectors.map.popup);
  await expect(popup).toBeVisible();
  return popup;
}


test('closing popups removes their temporary drag and zoom callbacks', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addLocatorHandler(page.locator(selectors.emailModal.overlay), async () => {
    await page.locator(selectors.emailModal.closeButton).click();
  });
  await setupPage(page);
  await dismissEmailModal(page);
  await waitForMapReady(page);
  await expect(page).toHaveTitle(/Sunshine/);
  await page.evaluate(() => {
    (window as any).__popupOpenCount = 0;
    (window as any).map.on('popupopen', () => (window as any).__popupOpenCount++);
  });
  // Repeated desktop lifetimes exercise accumulation. Touch verifies one
  // ordinary open/close on a fresh page; repeated-touch geometry is separate.
  const cycles = test.info().project.use.hasTouch ? 1 : 3;
  for (let i = 0; i < cycles; i++) {
    const popup = await openPopupFromVisibleMarker(page);
    await expect.poll(() => isPopupFullyVisible(page)).toBe(true);
    await page.waitForFunction(() => {
      const map = (window as any).map;
      return !map._animatingZoom && !map._panAnim?._inProgress;
    });
    expect(await page.evaluate(() => (window as any).__popupOpenCount)).toBe(i + 1);
    if (i === 0) await page.screenshot({ path: test.info().outputPath('popup.png') });
    if (test.info().project.use.hasTouch) await popup.locator('.leaflet-popup-close-button').tap();
    else await popup.locator('.leaflet-popup-close-button').click();
    await expect(popup).not.toBeVisible();
    const retained = await page.evaluate(() => {
      const events = (window as any).map._events;
      return ['dragstart', 'zoomstart'].map(type => (events[type] ?? [])
        .filter((entry: any) => entry.fn.name === 'cancelCenteringOnDrag').length);
    });
    expect(retained).toEqual([0, 0]);
    await page.waitForFunction(() => {
      const map = (window as any).map;
      return !map._animatingZoom && !map._panAnim?._inProgress;
    });
  }
  expect(errors).toEqual([]);
});
