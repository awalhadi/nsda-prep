import { expect, test } from "@playwright/test";

test("formative bank keeps all source positions and shows a disputed supplied key", async ({ page }) => {
  await page.goto("/cbta/questions");
  await page.getByRole("link", { name: /Formative প্রশ্ন/ }).click();
  const cards = page.getByRole("article");
  await expect(cards).toHaveCount(151);
  const positions = await cards.locator("p:first-child").allTextContents();
  const ids = positions.flatMap((line) => line.match(/Set \d+ · Q\d+/g) ?? []);
  expect(ids.length).toBe(175);
  expect(new Set(ids).size).toBe(175);
  const disputed = cards.filter({ hasText: /Set 13 · Q4 ·/ });
  await disputed.locator("summary").click();
  await expect(disputed).toContainText("The supplied key marks A");
  await expect(disputed).toContainText("no unique CBLM-supported answer");
  const download = await page.request.get("/formative-study-guide.md");
  expect(download.ok()).toBe(true);
  expect(await download.text()).toContain("Set 15 / Q25");
});
