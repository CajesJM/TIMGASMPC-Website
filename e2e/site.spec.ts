import { expect, test } from '@playwright/test';

test('home page provides clear path to application', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /your partner in financial growth/i })).toBeVisible();
  await expect(page.getByAltText('TIMGAS Multi-Purpose Cooperative office in Trinidad, Bohol')).toBeVisible();
  await expect(page.getByText('Since 1995', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Government service assistance' })).toBeVisible();
  await expect(page.getByRole('heading', { name: /long-standing partner in financial growth/i })).toBeVisible();
  await expect(page.getByText('July 25, 1995', { exact: true }).last()).toBeVisible();
  await expect(page.getByText(/₱32M/)).toHaveCount(0);
  await page.getByRole('link', { name: /become a member/i }).click();
  await expect(page).toHaveURL(/\/apply$/);
  await expect(page.getByRole('heading', { name: /take the first step/i })).toBeVisible();
});

test('manager preview is reachable through demo login', async ({ page }) => {
  await page.goto('/manager-login');
  await expect(page.getByRole('contentinfo')).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: /primary/i })).toHaveCount(0);
  await page.getByLabel('Email address').fill('manager@timgas.test');
  await page.getByLabel('Password', { exact: true }).fill('password123');
  await page.getByRole('button', { name: /sign in securely/i }).click();
  await expect(page).toHaveURL(/\/manager\/preview$/);
  await expect(page.getByRole('heading', { name: /good evening/i })).toBeVisible();
});

test('home service cards adapt from one to four columns', async ({ page }) => {
  const expectedColumns = [[390, 1], [800, 2], [1280, 4]] as const;

  for (const [width, count] of expectedColumns) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const columns = await page.locator('article').filter({ hasText: 'PSA online assistance' }).locator('..').evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(count);
  }
});

test('manager login is not linked from the public website', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /manager portal/i })).toHaveCount(0);
  await expect(page.locator('a[href="/manager-login"]')).toHaveCount(0);
});

test('official TIMGAS office asset is visible on the contact page', async ({ page }) => {
  await page.goto('/contact');
  await expect(page.getByAltText('Front entrance of the TIMGAS Multi-Purpose Cooperative office')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'TIMGAS Cooperative Office' })).toBeVisible();
});

test('membership page explains how to join and links to apply', async ({ page }) => {
  await page.goto('/membership');
  await expect(page.getByRole('heading', { name: /four simple steps to membership/i })).toBeVisible();
  await expect(page.getByText('Pay your share capital', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /download application form/i })).toHaveAttribute('href', '/application-form.pdf');
  await page.getByRole('link', { name: /apply online/i }).click();
  await expect(page).toHaveURL(/\/apply$/);
});

test('news updates expand to reveal full content', async ({ page }) => {
  await page.goto('/news');
  await page.getByText('Read full update').first().click();
  await expect(page.getByText(/annual general assembly will be held/i)).toBeVisible();
});

test('contact page embeds an interactive map', async ({ page }) => {
  await page.goto('/contact');
  await expect(page.getByTitle(/map of the timgas cooperative office/i)).toBeVisible();
  await expect(page.getByRole('link', { name: /get directions/i })).toBeVisible();
});

test('office-confirmed information appears without service prices', async ({ page }) => {
  await page.goto('/about');
  await expect(page.getByRole('heading', { name: /values behind TIMGAS/i })).toBeVisible();
  await expect(page.getByText('Trustworthy', { exact: true })).toBeVisible();

  await page.goto('/services');
  await expect(page.getByRole('heading', { name: /PSA online assistance/i })).toBeVisible();
  await expect(page.getByText('PhilHealth voluntary contributions', { exact: true })).toBeVisible();
  await expect(page.getByText(/₱|P\s*\d{3}/)).toHaveCount(0);
});
