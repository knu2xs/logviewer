import path from 'node:path';

import { expect, test } from '@playwright/test';

const fixturePath = path.resolve('tests/e2e/fixtures/logs/filtering_sample.log');

test('custom range validation preserves the last valid filtered result', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Open Log File').setInputFiles(fixturePath);

  await page.getByRole('combobox', { name: 'Time window' }).click();
  await page.getByRole('option', { name: 'Custom Range' }).click();

  await page.getByLabel('Start date/time').fill('2026-07-09T14:00');
  await page.getByLabel('End date/time').fill('2026-07-09T14:20');
  await page.getByRole('heading', { name: 'Parsed rows' }).click();

  await expect(page.getByText('Showing 2 of 4 entries')).toBeVisible();

  await page.getByLabel('Start date/time').fill('2026-07-09T15:30');
  await page.getByRole('heading', { name: 'Parsed rows' }).click();

  await expect(page.getByText('Start date/time must be before end date/time.')).toHaveCount(2);
  await expect(page.getByText('Showing 2 of 4 entries')).toBeVisible();
});