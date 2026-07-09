import path from 'node:path';

import { expect, test } from '@playwright/test';

const fixturePath = path.resolve('tests/e2e/fixtures/logs/filtering_sample.log');

test('combined filtering supports search clear and time windows', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Open Log File').setInputFiles(fixturePath);

  await expect(page.getByText('Showing 4 of 4 entries')).toBeVisible();

  await page.getByRole('combobox', { name: 'Logger names' }).click();
  await page.getByRole('option', { name: 'Portal.Security' }).click();
  await page.keyboard.press('Escape');
  await page.getByRole('combobox', { name: 'Minimum severity' }).click();
  await page.getByRole('option', { name: 'INFO' }).click();
  await page.getByRole('combobox', { name: 'Time window' }).click();
  await page.getByRole('option', { name: 'Last Hour' }).click();
  await page.getByLabel('Search messages').fill('failed');

  await expect(page.getByText('Showing 1 of 4 entries')).toBeVisible();
  await expect(page.getByRole('gridcell', { name: 'Token validation failed for portal user' })).toBeVisible();

  await page.getByLabel('Clear search').click();

  await expect(page.getByText('Showing 2 of 4 entries')).toBeVisible();
  await expect(page.getByRole('gridcell', { name: 'Token accepted for portal user' })).toBeVisible();
  await expect(page.getByRole('gridcell', { name: 'Token validation failed for portal user' })).toBeVisible();
});