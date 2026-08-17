import { expect, test } from '@playwright/test';

test('home page provides clear path to application', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /growing stronger/i })).toBeVisible();
  await page.getByRole('link', { name: /become a member/i }).click();
  await expect(page).toHaveURL(/\/apply$/);
  await expect(page.getByRole('heading', { name: /take the first step/i })).toBeVisible();
});

test('manager preview is reachable through demo login', async ({ page }) => {
  await page.goto('/manager/login');
  await page.getByLabel('Email address').fill('manager@timgas.test');
  await page.getByLabel('Password', { exact: true }).fill('password123');
  await page.getByRole('button', { name: /sign in securely/i }).click();
  await expect(page).toHaveURL(/\/manager\/preview$/);
  await expect(page.getByRole('heading', { name: /good evening/i })).toBeVisible();
});
