import { expect, test } from '@playwright/test';

test('homepage contains every public navigation section', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /your partner in financial growth/i })).toBeVisible();
  for (const id of ['home', 'about', 'membership', 'services', 'news', 'contact']) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }

  await expect(page.getByRole('heading', { name: 'A strong and trusted cooperative.', exact: true }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /start with verified information/i })).toBeVisible();
  await expect(page.locator('#services').getByRole('heading', { name: /PSA online assistance/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /no official announcement has been posted yet/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'TIMGAS Cooperative Office' })).toBeVisible();
});

test('public navigation uses smooth-scroll anchor links', async ({ page }) => {
  await page.goto('/');

  if (page.viewportSize()!.width < 1024) {
    await page.getByRole('button', { name: 'Toggle navigation' }).click();
  }

  const nav = page.getByRole('navigation', { name: 'Primary navigation' });
  await expect(nav.getByRole('link', { name: 'About' })).toHaveAttribute('href', '#about');
  await expect(nav.getByRole('link', { name: 'Membership' })).toHaveAttribute('href', '#membership');
  await expect(nav.getByRole('link', { name: 'Services' })).toHaveAttribute('href', '#services');
  await expect(nav.getByRole('link', { name: 'News' })).toHaveAttribute('href', '#news');
  await expect(nav.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '#contact');

  await nav.getByRole('link', { name: 'Services' }).click();
  await expect(page).toHaveURL(/#services$/);
  await expect(page.locator('#services')).toBeInViewport();
  await expect(page.locator('#primary-nav a[href="#services"]')).toHaveAttribute('aria-current', 'location');
});

test('legacy public URLs redirect to their homepage sections', async ({ page }) => {
  for (const section of ['about', 'membership', 'services', 'news', 'contact']) {
    await page.goto(`/${section}`);
    await expect(page).toHaveURL(new RegExp(`/#${section}$`));
    await expect(page.locator(`#${section}`)).toBeInViewport();
  }

  await page.goto('/apply');
  await expect(page).toHaveURL(/\/#application$/);
});

test('manager login remains a separate hidden route', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('a[href="/manager-login"]')).toHaveCount(0);

  await page.goto('/manager-login');
  await expect(page.getByRole('contentinfo')).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: /primary/i })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: /manager sign in/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /sign in securely/i })).toBeDisabled();
  await expect(page.getByText(/Firebase connection is pending/i)).toBeVisible();
});

test('manager dashboard rejects unauthenticated access', async ({ page }) => {
  await page.goto('/manager/preview');
  await expect(page).toHaveURL(/\/manager-login$/);
  await expect(page.getByRole('heading', { name: /manager sign in/i })).toBeVisible();
});

test('official information is presented without unconfirmed prices', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#about').getByText('Tinabangay sa Igsoong Mag-uuma Gasa ni San Isidro Multi-Purpose Cooperative', { exact: true })).toBeVisible();
  await expect(page.locator('#about').getByText('Purok 5, Poblacion, Trinidad, Bohol', { exact: true })).toBeVisible();
  await expect(page.getByText('PhilHealth voluntary contributions', { exact: true })).toBeVisible();
  await expect(page.getByText(/₱|P\s*\d{3}/)).toHaveCount(0);
  await expect(page.getByText(/general assembly set for september/i)).toHaveCount(0);
  await expect(page.locator('a[href="/application-form.pdf"]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /official format pending/i })).toBeDisabled();
  await expect(page.getByRole('button', { name: /download pending/i })).toBeDisabled();
});

test('contact section includes the office photo, map, and confirmed details', async ({ page }) => {
  await page.goto('/#contact');
  await expect(page.locator('#contact').getByAltText('Front entrance of the TIMGAS Multi-Purpose Cooperative office')).toBeVisible();
  await expect(page.getByTitle(/map of the timgas cooperative office/i)).toBeVisible();
  await expect(page.locator('#contact').getByRole('link', { name: '+63 938 224 2376' })).toHaveAttribute('href', 'tel:+639382242376');
  await expect(page.getByRole('link', { name: 'mpctimgas@yahoo.com' })).toBeVisible();
});

test('single-page layout remains compact and responsive', async ({ page }) => {
  for (const width of [390, 800, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');

    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(hasOverflow).toBe(false);

    const serviceGrid = page.locator('#services article').filter({ has: page.getByRole('heading', { name: 'PSA online assistance' }) }).locator('..');
    const columns = await serviceGrid.evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(width >= 768 ? 2 : 1);
  }
});
