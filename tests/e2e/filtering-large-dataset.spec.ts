import fs from 'node:fs';
import path from 'node:path';

import { expect, test } from '@playwright/test';

const fixturePath = path.resolve('tests/e2e/fixtures/logs/synthetic_50000.log');

test('50k fixture remains filterable in normal workflows', async ({ page }) => {
  test.skip(!fs.existsSync(fixturePath), 'Generate synthetic_50000.log before running this validation.');

  await page.goto('/');
  await page.getByLabel('Open Log File').setInputFiles(fixturePath);

  await expect(page.getByText(/Showing\s+50,000\s+of\s+50,000\s+entries/)).toBeVisible();

  await page.getByLabel('Search messages').fill('Synthetic event 50000');
  await expect(page.getByText(/Showing\s+1\s+of\s+50,000\s+entries/)).toBeVisible();

  await page.getByLabel('Clear search').click();
  await expect(page.getByText(/Showing\s+50,000\s+of\s+50,000\s+entries/)).toBeVisible();
});
