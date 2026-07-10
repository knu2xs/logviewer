import path from 'node:path';

import { expect, test } from '@playwright/test';

const fixturePath = path.resolve('tests/e2e/fixtures/logs/python_cookiecutter_format.log');
const tomcatFixturePath = path.resolve('tests/e2e/fixtures/logs/tomcat_format.log');
const expectedLineCount = 3615;

test('log import workflow', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Import a log file' })).toBeVisible();
  await expect(page.getByLabel('Open Log File')).toBeVisible();

  await page.getByLabel('Open Log File').setInputFiles(fixturePath);

  await expect(page.locator('.log-import-file-name')).toHaveText('python_cookiecutter_format.log');
  await expect(page.getByText('Valid rows').locator('..')).toContainText('3613');
  await expect(page.getByText('Total lines').locator('..')).toContainText(
    String(expectedLineCount),
  );
  await expect(page.getByRole('heading', { name: 'Parsing Messages' })).toBeVisible();
  await expect(page.getByText('Failed to execute (AddAttributeRule).')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Parse errors' })).toHaveCount(0);
  await expect(page.getByRole('columnheader', { name: 'Source File' })).toHaveCount(0);

  await expect(
    page.getByRole('gridcell', { name: 'everett_attributerules' }).first(),
  ).toBeVisible();
  await expect(
    page
      .getByRole('gridcell', {
        name: 'Starting everett-attributerules attribute rules application.',
      })
      .first(),
  ).toBeVisible();
});

test('imports and parses Tomcat format', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Open Log File').setInputFiles(tomcatFixturePath);

  await expect(page.locator('.log-import-file-name')).toHaveText('tomcat_format.log');
  await expect(page.getByText('Source format: Tomcat')).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Logger' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Source' })).toBeVisible();
  await expect(
    page.getByRole('gridcell', { name: 'org.apache.catalina.startup.ClassLoaderFactory' }).first(),
  ).toBeVisible();
  await expect(page.getByRole('gridcell', { name: 'validateFile' }).first()).toBeVisible();
  await expect(
    page
      .getByRole('gridcell', {
        name: /Problem with directory \[C:\\Program Files\\ArcGIS\\Server\\framework\\lib\\ge\]/,
      })
      .first(),
  ).toBeVisible();
});
