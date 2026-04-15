import { test, expect } from "@playwright/test";

test("auth route loads and exposes login/signup tabs", async ({ page }) => {
  const response = await page.goto("/auth", { waitUntil: "domcontentloaded" });
  expect(response?.ok()).toBeTruthy();
  await expect(page).toHaveTitle(/Big Chief Ent/i);
  await expect(page.getByRole("tab", { name: /^Login$/i })).toBeVisible();
  await expect(page.getByRole("tab", { name: /^Signup$/i })).toBeVisible();
});

test("articles category route responds", async ({ page }) => {
  const response = await page.goto("/articles/news", { waitUntil: "domcontentloaded" });
  expect(response?.ok()).toBeTruthy();
  await expect(page).toHaveTitle(/Big Chief Ent/i);
});
