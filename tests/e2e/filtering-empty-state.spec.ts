import path from 'node:path';

import { expect, test } from '@playwright/test';

const primaryFixturePath = path.resolve('tests/e2e/fixtures/logs/filtering_sample.log');
const secondaryFixturePath = path.resolve('tests/e2e/fixtures/logs/python_cookiecutter_format.log');

test('empty results state recovers by clearing filters without re-import', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Open Log File').setInputFiles(primaryFixturePath);

  await expect(page.getByText('Showing 4 of 4 entries')).toBeVisible();

  await page.getByLabel('Search messages').fill('no-matches-here');

  await expect(page.getByText('Showing 0 of 4 entries')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'No results for current filters' })).toBeVisible();

  await page.getByRole('button', { name: 'Clear all filters from empty state' }).click();

  await expect(page.getByText('Showing 4 of 4 entries')).toBeVisible();
  await expect(page.getByRole('gridcell', { name: 'Portal.Security' }).first()).toBeVisible();
});

test('new import resets active filters before rendering next dataset', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Open Log File').setInputFiles(primaryFixturePath);

  await page.getByLabel('Search messages').fill('Token');
  await page.getByRole('combobox', { name: 'Minimum severity' }).click();
  await page.getByRole('option', { name: 'ERROR' }).click();

  await expect(page.getByText(/Showing\s+1\s+of\s+4\s+entries/)).toBeVisible();

  await page.getByLabel('Open Log File').setInputFiles(secondaryFixturePath);

  await expect(page.getByLabel('Search messages')).toHaveValue('');
  const countSummary = page.getByText(/Showing\s+[\d,]+\s+of\s+[\d,]+\s+entries/).first();
  await expect(countSummary).toBeVisible();

  await expect
    .poll(async () => {
      const countSummaryText = (await countSummary.textContent()) ?? '';
      const countMatch = countSummaryText.match(/Showing\s+([\d,]+)\s+of\s+([\d,]+)\s+entries/);

      if (!countMatch) {
        return false;
      }

      const visibleCount = Number(countMatch[1].replaceAll(',', ''));
      const totalCount = Number(countMatch[2].replaceAll(',', ''));

      return visibleCount === totalCount && totalCount > 0;
    })
    .toBe(true);
  await expect(page.getByText('Importing a new file resets all active filters')).toBeVisible();
});