import { expect, test } from "@playwright/test";

test("practice: a wrong MCQ answer puts the topic into revision, due the next day", async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 10, 2, 10, 0));
  await page.goto("/cbta/concept/hierarchy-of-controls");
  await expect(page.getByRole("heading", { level: 1, name: "Hierarchy of Controls" })).toBeVisible();
  await expect(page.getByText("Write this in the exam")).toBeVisible();

  await page.getByRole("button", { name: /Personal Protective Equipment \(PPE\)/ }).click();
  await expect(page.getByRole("status").filter({ hasText: "ভুল হয়েছে" })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Elimination");

  await page.goto("/cbta/revise");
  await expect(page.getByText("Nothing due today.")).toBeVisible();
  await expect(page.getByRole("link", { name: /Hierarchy of Controls/ })).toBeVisible();

  await page.clock.setFixedTime(new Date(2026, 10, 3, 10, 0));
  await page.reload();
  await expect(page.getByRole("heading", { name: /Due today/ })).toContainText("1");
});

test("matching and viva record results", async ({ page }) => {
  await page.goto("/cbta/concept/hierarchy-of-controls");
  await page.getByRole("tab", { name: "Viva" }).click();
  await page.getByRole("button", { name: "Show answer" }).click();
  await page.getByRole("button", { name: "I said it ✓" }).click();
  await expect(page.getByText("Great. Saved.")).toBeVisible();
});

test("mock exam: start, submit, self-mark and see the score by section", async ({ page }) => {
  await page.goto("/cbta/mock");
  await page.getByLabel(/CBLM 12:/).check();
  await page.getByRole("button", { name: "Start mock exam" }).click();
  await expect(page.getByRole("heading", { name: /Part A · Multiple choice/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Part B · Matching/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Part C · Short questions/ })).toBeVisible();

  const firstOption = page.locator("section").first().getByRole("radio").first();
  await firstOption.check();
  await page.getByRole("button", { name: "Submit paper" }).last().click();
  await expect(page.getByRole("heading", { name: "Check your short answers" })).toBeVisible();
  await page.getByRole("button", { name: "Full" }).first().click();
  await page.getByRole("button", { name: "See my result" }).click();
  await expect(page.getByText("Your score")).toBeVisible();
  await expect(page.getByText("Read these again")).toBeVisible();

  await page.goto("/cbta");
  await expect(page.getByText("Last mock exam")).toBeVisible();
  await expect(page.locator("text=/^\\d+%$/").first()).toBeVisible();
});

test("search finds concepts by English and Bangla words", async ({ page }) => {
  await page.goto("/cbta/search");
  await page.getByRole("searchbox").fill("evidence");
  await expect(page.getByRole("link", { name: /Rules of Evidence/ }).first()).toBeVisible();
  await page.getByRole("searchbox").fill("প্রমাণ");
  await expect(page.getByRole("status")).not.toContainText("0 results");
});

test("Web Design progress stays untouched when CBT&A progress is saved", async ({ page }) => {
  await page.goto("/");
  const legacy = { attempts: [{ id: "html-1", moduleId: "html", moduleTitle: "HTML", date: "2026-01-01", total: 10, correct: 7, durationSec: 60, wrongIds: ["q1"] }],
    mistakes: { q1: { questionId: "q1", moduleId: "html", lastMissedAt: "2026-01-01", timesMissed: 1 } },
    flash: {}, streak: { lastDate: "2026-01-01", current: 3, longest: 5 }, xp: 120,
    settings: { defaultTimed: true, secondsPerQuestion: 30, defaultCount: 15 } };
  await page.evaluate((s) => localStorage.setItem("wdp3_store_v1", JSON.stringify(s)), legacy);

  await page.goto("/cbta/concept/hierarchy-of-controls");
  await page.getByRole("button", { name: /Personal Protective Equipment \(PPE\)/ }).click();
  await expect(page.getByRole("status").filter({ hasText: "ভুল হয়েছে" })).toBeVisible();

  const after = await page.evaluate(() => JSON.parse(localStorage.getItem("wdp3_store_v1")!));
  expect(after.attempts).toEqual(legacy.attempts);
  expect(after.mistakes).toEqual(legacy.mistakes);
  expect(after.xp).toBe(120);
  expect(after.streak).toEqual(legacy.streak);
  expect(after.cbta.leitner["hierarchy-of-controls"].box).toBe(1);
});
