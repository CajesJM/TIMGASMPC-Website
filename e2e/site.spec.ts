import { expect, test } from "@playwright/test";

test("homepage contains every public navigation section", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(
    page.getByRole("heading", { name: /your partner in financial growth/i }),
  ).toBeVisible();
  for (const id of ["home", "about", "membership", "news", "contact"]) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
  await expect(page.locator("#services")).toHaveCount(0);

  await expect(
    page
      .getByRole("heading", {
        name: "A strong and trusted cooperative.",
        exact: true,
      })
      .first(),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /start with verified information/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "TIMGAS Cooperative Office" }),
  ).toBeVisible();
});

test("public navigation uses smooth-scroll anchor links", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  if (page.viewportSize()!.width < 1024) {
    await page.getByRole("button", { name: "Toggle navigation" }).click();
  }

  const nav = page.getByRole("navigation", { name: "Primary navigation" });
  await expect(nav.getByRole("link", { name: "About" })).toHaveAttribute(
    "href",
    "#about",
  );
  await expect(nav.getByRole("link", { name: "Membership" })).toHaveAttribute(
    "href",
    "#membership",
  );
  await expect(nav.getByRole("link", { name: "Services" })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "News" })).toHaveAttribute(
    "href",
    "#news",
  );
  await expect(nav.getByRole("link", { name: "Contact" })).toHaveAttribute(
    "href",
    "#contact",
  );

  await nav.getByRole("link", { name: "News" }).click();
  await expect(page).toHaveURL(/#news$/);
  await expect(page.locator("#news")).toBeInViewport();
  await expect(page.locator('#primary-nav a[href="#news"]')).toHaveAttribute(
    "aria-current",
    "location",
  );
});

test("legacy public URLs redirect to their homepage sections", async ({
  page,
}) => {
  for (const section of ["about", "membership", "news", "contact"]) {
    await page.goto(`/${section}`, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(new RegExp(`/#${section}$`));
    await expect(page.locator(`#${section}`)).toHaveCount(1);
  }

  await page.goto("/services", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/#contact$/);
  await expect(page.locator("#contact")).toHaveCount(1);

  await page.goto("/apply", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/#application$/);
});

test("manager login remains a separate hidden route", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator('a[href="/manager-login"]')).toHaveCount(0);

  await page.goto("/manager-login", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("contentinfo")).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: /primary/i })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("heading", { name: /manager sign in/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /sign in securely/i }),
  ).toBeEnabled();
  await expect(
    page.getByText(/access requires a verified Firebase account/i),
  ).toHaveCount(0);
});

test("manager dashboard rejects unauthenticated access", async ({ page }) => {
  await page.goto("/manager/preview", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/manager-login$/);
  await expect(
    page.getByRole("heading", { name: /manager sign in/i }),
  ).toBeVisible();
});

test("official information is presented without unconfirmed prices", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(
    page
      .locator("#about")
      .getByText(
        "Tinabangay sa Igsoong Mag-uuma Gasa ni San Isidro Multi-Purpose Cooperative",
        { exact: true },
      ),
  ).toBeVisible();
  await expect(
    page
      .locator("#about")
      .getByText("Purok 5, Poblacion, Trinidad, Bohol", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Services" })).toHaveCount(0);
  await expect(page.getByText(/₱|P\s*\d{3}/)).toHaveCount(0);
  await expect(
    page.getByText(/general assembly set for september/i),
  ).toHaveCount(0);
  const download = page.getByRole("link", { name: /download form/i });
  await expect(download).toHaveAttribute(
    "href",
    "/downloads/Membership-Application-Form-Revised-2023.docx",
  );
  await expect(
    page.getByRole("link", { name: /download xls/i }),
  ).toHaveAttribute("href", "/downloads/Loan-Application-Form.xls");
  await expect(
    page.getByRole("button", { name: /apply online/i }),
  ).toBeEnabled();
  await expect(
    page.getByRole("button", { name: /apply for a loan/i }),
  ).toBeEnabled();
});

test("official loan application opens as a responsive modal", async ({
  page,
}) => {
  await page.goto("/#application", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /apply for a loan/i }).click();

  const dialog = page.getByRole("dialog", {
    name: /apply for a TIMGAS MPC loan/i,
  });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("heading", { name: /loan application form/i }),
  ).toBeVisible();
  await expect(dialog.getByLabel(/applicant\/member borrower/i)).toBeVisible();
  await expect(dialog.getByLabel(/MF \(first field\)/i)).toBeVisible();
  await expect(dialog.getByLabel(/MF \(second field\)/i)).toBeVisible();

  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasOverflow).toBe(false);

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("contact section includes the office photo, map, and confirmed details", async ({
  page,
}) => {
  await page.goto("/#contact", { waitUntil: "domcontentloaded" });
  await expect(
    page
      .locator("#contact")
      .getByAltText(
        "Front entrance of the TIMGAS Multi-Purpose Cooperative office",
      ),
  ).toBeVisible();
  await expect(
    page.getByTitle(/map of the timgas cooperative office/i),
  ).toBeVisible();
  await expect(
    page.locator("#contact").getByRole("link", { name: "+63 938 224 2376" }),
  ).toHaveAttribute("href", "tel:+639382242376");
  await expect(
    page.getByRole("link", { name: "mpctimgas@yahoo.com" }),
  ).toBeVisible();
});

test("single-page layout remains compact and responsive", async ({ page }) => {
  for (const width of [390, 800, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasOverflow).toBe(false);

    await expect(page.locator("#services")).toHaveCount(0);
  }
});
