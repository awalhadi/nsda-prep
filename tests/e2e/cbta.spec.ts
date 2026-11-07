import { expect, test } from "@playwright/test";

test("practice: a wrong MCQ answer puts the topic into revision, due the next day", async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 10, 2, 10, 0));
  await page.goto("/cbta/concept/hierarchy-of-controls");
  await expect(page.getByRole("heading", { level: 1, name: "Hierarchy of Controls" })).toBeVisible();
  await expect(page.getByText("Write this in the exam")).toBeVisible();

  await page.getByText("Test yourself").click();
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
  await page.getByText("Test yourself").click();
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
});

test("search finds concepts by English and Bangla words", async ({ page }) => {
  await page.goto("/cbta/search");
  await page.getByRole("searchbox").fill("evidence");
  await expect(page.getByRole("link", { name: /Rules of Evidence/ }).first()).toBeVisible();
  await page.getByRole("searchbox").fill("প্রমাণ");
  await expect(page.getByRole("status")).not.toContainText("No topic found");
});

test("Web Design progress stays untouched when CBT&A progress is saved", async ({ page }) => {
  await page.goto("/");
  const legacy = { attempts: [{ id: "html-1", moduleId: "html", moduleTitle: "HTML", date: "2026-01-01", total: 10, correct: 7, durationSec: 60, wrongIds: ["q1"] }],
    mistakes: { q1: { questionId: "q1", moduleId: "html", lastMissedAt: "2026-01-01", timesMissed: 1 } },
    flash: {}, streak: { lastDate: "2026-01-01", current: 3, longest: 5 }, xp: 120,
    settings: { defaultTimed: true, secondsPerQuestion: 30, defaultCount: 15 } };
  await page.evaluate((s) => localStorage.setItem("wdp3_store_v1", JSON.stringify(s)), legacy);

  await page.goto("/cbta/concept/hierarchy-of-controls");
  await page.getByText("Test yourself").click();
  await page.getByRole("button", { name: /Personal Protective Equipment \(PPE\)/ }).click();
  await expect(page.getByRole("status").filter({ hasText: "ভুল হয়েছে" })).toBeVisible();

  const after = await page.evaluate(() => JSON.parse(localStorage.getItem("wdp3_store_v1")!));
  expect(after.attempts).toEqual(legacy.attempts);
  expect(after.mistakes).toEqual(legacy.mistakes);
  expect(after.xp).toBe(120);
  expect(after.streak).toEqual(legacy.streak);
  expect(after.cbta.leitner["hierarchy-of-controls"].box).toBe(1);
});

test("offline: after downloading, cards open and links work with no internet", async ({ page, context }) => {
  test.setTimeout(180_000);
  await page.goto("/cbta");
  await page.getByRole("button", { name: "Download for offline use" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Saved for offline" })).toBeVisible({ timeout: 150_000 });

  await context.setOffline(true);
  await page.goto("/cbta/concept/rules-of-evidence");
  await expect(page.getByRole("heading", { level: 1, name: "Rules of Evidence" })).toBeVisible();
  await page.getByRole("link", { name: /All topics of CBLM 12/ }).first().click();
  await expect(page.getByRole("heading", { level: 1, name: /Organise and Conduct Competency Assessment/ })).toBeVisible();
  await page.getByRole("link", { name: /Last-minute sheet/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Last-minute sheet" })).toBeVisible();
  await context.setOffline(false);
});

for (const n of [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12]) {
  test(`CBLM ${n}: topic list → search → topic → next topic → practice, no sideways scroll`, async ({ page }) => {
    await page.goto("/cbta");
    await page.locator(`a[href="/cbta/cblm/${n}"]`).first().click();
    await expect(page).toHaveURL(new RegExp(`/cbta/cblm/${n}$`));
    const noSideScroll = () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
    expect(await noSideScroll()).toBe(true);

    // Search filters the topic list as you type.
    await page.getByText(/পূর্ণ পাঠ ও জব শিট/).click();
    const topics = page.locator("main ul a");
    const all = await topics.count();
    expect(all).toBeGreaterThan(10);
    // Search for the longest word of a topic in the middle of the list.
    const sample = (await topics.nth(Math.floor(all / 2)).locator("span.block.font-bold").first().textContent()) ?? "";
    const word = sample.split(/[^A-Za-z]+/).sort((a, b) => b.length - a.length)[0];
    await page.getByPlaceholder(/Search a topic/).fill(word);
    await expect.poll(() => topics.count()).toBeLessThan(all);
    expect(await topics.count()).toBeGreaterThan(0);
    await page.getByPlaceholder(/Search a topic/).fill("");

    // Open the first card topic, then move on with "Next topic".
    await page.locator("main ul a[href^='/cbta/concept/']").first().click();
    await expect(page.getByText("Write this in the exam")).toBeVisible();
    await expect(page.getByText(/Topic \d+ of \d+/)).toBeVisible();
    expect(await noSideScroll()).toBe(true);
    const title = await page.getByRole("heading", { level: 1 }).textContent();
    await page.getByRole("link", { name: /Next topic/ }).click();
    await expect(page.getByRole("heading", { level: 1 })).not.toHaveText(title ?? "");

    // The CBLM's practice test.
    await page.goto(`/cbta/cblm/${n}`);
    await page.getByRole("link", { name: /Practice test/ }).click();
    await page.getByRole("tabpanel").getByRole("button").first().click();
    await expect(page.getByRole("status")).toContainText(/Correct|ভুল/);
    await page.getByRole("button", { name: /Next/ }).click();
    await expect(page.getByText(/Question 2 of/)).toBeVisible();
  });
}

test("a list says what it is and explains every point in Bangla", async ({ page }) => {
  await page.goto("/cbta/concept/competency-based-assessment");
  const list = page.locator("section").filter({ has: page.locator("ol") }).filter({ hasText: /characteristics/i }).first();
  await expect(list.getByRole("heading")).toContainText(/characteristics/i);
  const points = list.locator("ol > li");
  const n = await points.count();
  expect(n).toBeGreaterThan(2);
  for (let i = 0; i < n; i++) await expect(points.nth(i).locator("[lang=bn]")).toHaveCount(1);
});

test("study order separates module introductions, lessons and guide help", async ({ page }) => {
  await page.goto("/cbta");
  await page.getByRole("link", { name: /কোন CBLM আগে পড়ব/ }).click();
  await expect(page.getByRole("heading", { name: "প্রশ্নে বেশি দেখা CBLM" })).toBeVisible();
  await page.getByText(/CBLM 8 ·.*অভিন্ন কার্ড/).click();
  await page.locator("details[open]").getByText(/CBLM 9 ·.*কার্ড অভিন্ন/).click();
  await expect(page.locator("details[open] details[open] ul a").first()).toBeVisible();

  await page.getByRole("link", { name: /CBLM 1 দিয়ে শুরু/ }).click();
  await expect(page.getByText("১ · মডিউল পরিচিতি")).toBeVisible();
  await expect(page.getByRole("heading", { name: "আগে এই 5টি টপিক পড়ুন" })).toBeVisible();
  await expect(page.getByPlaceholder(/Search a topic/)).toBeHidden();
  await page.getByText(/পূর্ণ পাঠ ও জব শিট/).click();
  await expect(page.getByPlaceholder(/Search a topic/)).toBeVisible();
  await expect(page.getByRole("link", { name: "পড়ার গাইড ব্যবহারের সহায়তা" })).toBeVisible();
  await expect(page.locator("main ul a[href$='/how-to-use-this-guide']")).toHaveCount(0);
});

test("all CBLM listings count the same lessons and job sheets as their module pages", async ({ page }) => {
  await page.goto("/cbta");
  const dashboardLabels = await page.locator('main a[href^="/cbta/cblm/"]')
    .getByText(/^[০-৯]+টি পাঠ ও জব শিট$/).allTextContents();

  await page.goto("/cbta/courses");
  const cards = page.locator('main a[href^="/cbta/cblm/"]');
  await expect(cards).toHaveCount(12);
  const labels = await cards.getByText(/^[০-৯]+টি পাঠ ও জব শিট$/).allTextContents();
  expect(dashboardLabels).toEqual(labels);

  for (const [index, label] of labels.entries()) {
    await page.goto(`/cbta/cblm/${index + 1}`);
    const fullList = page.locator("main details").filter({ has: page.locator("summary").filter({ hasText: /পূর্ণ পাঠ ও জব শিট/ }) });
    const count = await fullList.locator("ul li a").count();
    expect(count).toBeGreaterThan(0);
    expect(label).toBe(`${count.toLocaleString("bn-BD")}টি পাঠ ও জব শিট`);
    await expect(fullList.locator("summary")).toContainText(`(${count.toLocaleString("bn-BD")}টি)`);
  }
});
