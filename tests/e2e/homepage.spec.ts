import { expect, test } from '@playwright/test';

test('application shell smoke test', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('logviewer');
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Import a log file' })).toBeVisible();
});
