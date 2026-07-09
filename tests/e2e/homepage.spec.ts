import { expect, test } from '@playwright/test';

test('homepage renders the application shell', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Welcome to Log Viewer' })).toBeVisible();
});
