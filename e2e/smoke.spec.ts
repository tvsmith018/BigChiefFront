import { test, expect } from "@playwright/test";

test("home page responds and shows expected title", async ({ page }) => {
  const response = await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(response?.ok()).toBeTruthy();
  await expect(page).toHaveTitle(/Big Chief Ent/i);
});
