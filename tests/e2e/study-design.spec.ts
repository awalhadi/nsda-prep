import { expect, test } from "@playwright/test";

test("responsive shell, focused plan and persistent theme", async ({ page }) => {
  await page.goto("/cbta");
  await expect(page.getByRole("heading", { name: "ছোট পদক্ষেপে, বড় প্রস্তুতি।" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "মোবাইল নেভিগেশন" }).getByRole("link")).toHaveCount(4);
  await page.setViewportSize({ width: 390, height: 844 });
  const start = page.getByRole("link", { name: "পড়া শুরু করি", exact: true });
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
