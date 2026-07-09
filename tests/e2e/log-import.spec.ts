import path from 'node:path';

import { expect, test } from '@playwright/test';

const fixturePath = path.resolve('tests/e2e/fixtures/logs/python_cookiecutter_format.log');
const expectedLineCount = 3615;

test('log import workflow', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Import a log file' })).toBeVisible();
  await expect(page.getByLabel('Open Log File')).toBeVisible();

  await page.getByLabel('Open Log File').setInputFiles(fixturePath);

  await expect(page.getByText('python_cookiecutter_format.log')).toBeVisible();
  await expect(page.getByText('Valid rows').locator('..')).toContainText('3613');
  await expect(page.getByText('Total lines').locator('..')).toContainText(String(expectedLineCount));
  await expect(page.getByRole('heading', { name: 'Continued messages' })).toBeVisible();
  await expect(page.getByText('Failed to execute (AddAttributeRule).')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Parse errors' })).toHaveCount(0);
  await expect(page.getByRole('gridcell', { name: 'everett_attributerules' }).first()).toBeVisible();
  await expect(page.getByRole('gridcell', { name: 'Starting everett-attributerules attribute rules application.' }).first()).toBeVisible();
});