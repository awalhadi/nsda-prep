import { expect, test } from "@playwright/test";

test("responsive shell, focused plan and persistent theme", async ({ page }) => {
  await page.goto("/cbta");
  await expect(page.getByRole("heading", { name: "ছোট পদক্ষেপে, বড় প্রস্তুতি।" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "মোবাইল নেভিগেশন" }).getByRole("link")).toHaveCount(4);
  await page.setViewportSize({ width: 390, height: 844 });
  const start = page.getByRole("button", { name: "পড়া শুরু করি", exact: true });
  await expect(start).toBeInViewport();
  const box = await start.boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(844 - 68);
  await page.getByRole("button", { name: "১০ মিনিট", exact: true }).click();
  await expect(page.getByText("এই সেশনের গুরুত্বপূর্ণ টপিক দেখুন (২টি)")).toBeVisible();
  await page.getByRole("button", { name: "৩০ মিনিট", exact: true }).click();
  await expect(page.getByText("এই সেশনের গুরুত্বপূর্ণ টপিক দেখুন (৬টি)")).toBeVisible();
  await page.getByRole("button", { name: "ডার্ক থিম চালু করুন" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.getByRole("navigation", { name: "প্রধান নেভিগেশন" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "মোবাইল নেভিগেশন" })).not.toBeVisible();
  await page.getByRole("navigation", { name: "প্রধান নেভিগেশন" }).getByRole("link", { name: "সব টপিক" }).click();
  await expect(page.getByRole("heading", { name: "সব CBLM, এক জায়গায়।" })).toBeVisible();
});

test("install has real prompt handling and keyboard-accessible manual instructions", async ({ page }) => {
  await page.goto("/cbta");
  await page.getByRole("button", { name: "অ্যাপ ইনস্টল করুন" }).last().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("Add to Home Screen");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.evaluate(() => {
    const e = new Event("beforeinstallprompt", { cancelable: true });
    Object.assign(e, { prompt: async () => { document.documentElement.dataset.promptCalled = "yes"; }, userChoice: Promise.resolve({ outcome: "accepted" }) });
    window.dispatchEvent(e);
  });
  await page.getByRole("button", { name: "অ্যাপ ইনস্টল করুন" }).last().click();
  await expect(page.locator("html")).toHaveAttribute("data-prompt-called", "yes");
  await page.evaluate(() => window.dispatchEvent(new Event("appinstalled")));
  await expect(page.getByRole("button", { name: "অ্যাপ ইনস্টল করা আছে" }).last()).toBeDisabled();
});

test("both courses share the shell and quizzes get a focused layout", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "আজ একটু এগিয়ে যাই।" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "মোবাইল নেভিগেশন" })).toBeVisible();
  await page.goto("/quiz/html?count=10&timed=0");
  await expect(page.getByRole("navigation", { name: "মোবাইল নেভিগেশন" })).not.toBeVisible();
  await expect(page.getByRole("link", { name: "পড়ায় ফিরুন" })).toBeVisible();
});

test("a new learner finishes a short foundation session and gets delayed recall", async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 10, 2, 10));
  await page.goto("/cbta");
  await page.getByRole("button", { name: "১০ মিনিট", exact: true }).click();
  await page.getByRole("button", { name: "পড়া শুরু করি" }).click();
  await expect(page.getByRole("heading", { name: "কাজটি করতে পারি কি?" })).toBeVisible();
  for (let step = 0; step < 2; step++) {
    await page.getByRole("button", { name: "না দেখে বলি" }).click();
    await page.getByRole("button", { name: "উত্তর মিলিয়ে দেখি" }).click();
    await page.getByRole("button", { name: "সব মূল কথা বলেছি" }).click();
  }
  await expect(page.getByRole("heading", { name: "আজকের সেশন শেষ" })).toBeVisible();
  await page.clock.setFixedTime(new Date(2026, 10, 3, 10));
  await page.goto("/cbta");
  await page.getByRole("button", { name: "পড়া শুরু করি" }).click();
  await expect(page.getByRole("button", { name: "উত্তর মিলিয়ে দেখি" })).toBeVisible();
  await expect(page.getByRole("button", { name: "না দেখে বলি" })).toHaveCount(0);
});

test("backup restores a learner's revision after a fresh start", async ({ page }) => {
  await page.goto("/cbta");
  await page.getByRole("button", { name: "পড়া শুরু করি" }).click();
  await page.getByRole("button", { name: "না দেখে বলি" }).click();
  await page.getByRole("button", { name: "উত্তর মিলিয়ে দেখি" }).click();
  await page.getByRole("button", { name: "আরও অনুশীলন চাই" }).click();
  await page.getByRole("button", { name: "সেশন ছাড়ি" }).click();
  await page.getByText("CBT&A অগ্রগতির ব্যাকআপ", { exact: true }).click();
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "ব্যাকআপ ডাউনলোড" }).click();
  const file = await (await downloading).path();
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByText("CBT&A অগ্রগতির ব্যাকআপ", { exact: true }).click();
  await page.getByLabel("আগের ব্যাকআপ খুলুন").setInputFiles(file!);
  await page.getByRole("button", { name: "এই ব্যাকআপ ব্যবহার করি" }).click();
  await expect(page.getByText("অগ্রগতি ফিরিয়ে আনা হয়েছে।")).toBeVisible();
  await page.goto("/cbta/revise");
  await expect(page.getByRole("link", { name: /Competency/i }).first()).toBeVisible();
});
