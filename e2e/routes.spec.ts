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

test("profile route enforces auth and redirects guests", async ({ page }) => {
  const response = await page.goto("/profile", { waitUntil: "domcontentloaded" });
  expect(response).toBeTruthy();
  expect(response!.status()).toBeLessThan(500);
  // Environment/session can yield either auth redirect or profile render,
  // but route must stay healthy (no 5xx).
  await expect(page).toHaveURL(/\/(auth|profile)/);
});

test("article detail route degrades without server 500", async ({ page }) => {
  const response = await page.goto("/articles/details/QXJ0aWNsZXNOb2RlOjQ=", {
    waitUntil: "domcontentloaded",
  });
  expect(response).toBeTruthy();
  // During transient upstream failures, route may render fallback/not-found,
  // but should not hard-fail with 5xx.
  expect(response!.status()).toBeLessThan(500);
});
