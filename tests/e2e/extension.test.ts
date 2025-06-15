// tests/extension.test.ts
import { test, expect } from '@playwright/test';

test('Page de test simple', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example Domain/);
});
