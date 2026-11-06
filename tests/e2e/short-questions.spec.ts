import { expect, test } from "@playwright/test";

test("question collection supports Bangla search, source answers and filters", async ({ page }) => {
  await page.goto("/cbta/questions");
  await expect(page.getByRole("heading", { name: "বুঝে পড়ি, মনে রাখি" })).toBeVisible();
  await page.getByRole("searchbox").fill("11");
  const excel = page.getByRole("article").filter({ hasText: "cells C2 to C41" });
  await excel.getByText("আগে নিজে বলুন, তারপর উত্তর দেখুন", { exact: true }).click();
  await expect(excel.getByText("Total: =SUM(C2:C41). Average: =AVERAGE(C2:C41). Highest: =MAX(C2:C41).", { exact: true })).toBeVisible();
  await excel.getByText("মূল PDF-এর উত্তর মিলিয়ে দেখুন", { exact: true }).click();
  await expect(excel.getByText(/PDF পৃষ্ঠা 3/)).toBeVisible();
  await page.getByRole("searchbox").fill("প্রমাণ");
  await expect(page.getByRole("status")).not.toContainText("0টি প্রশ্ন");
  await page.getByRole("searchbox").fill("zzzznonexistent");
  await expect(page.getByText("কোনো প্রশ্ন মেলেনি। অন্য শব্দ লিখুন বা filter বদলান।")).toBeVisible();
  await page.getByRole("searchbox").fill("");
  await page.getByLabel("কোন প্রশ্ন দেখব?").selectOption("simple");
  await expect(page.getByRole("status")).toContainText("56টি প্রশ্ন");
  await page.getByRole("button", { name: "আরও ২০টি প্রশ্ন দেখুন" }).click();
  await expect(page.getByRole("article")).toHaveCount(40);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("topic has related PDF questions and an independent recall exercise", async ({ page }) => {
  await page.goto("/cbta/concept/session-review");
  await expect(page.getByRole("heading", { name: /এই টপিকের প্রশ্ন/ })).toBeVisible();
  await page.getByLabel("আমার উত্তর (বাংলা বা English)").fill("মূল কথা মনে করি");
  await page.getByRole("button", { name: "উত্তর মিলিয়ে দেখি" }).click();
  await expect(page.getByText(/নম্বর দেওয়া হচ্ছে না/)).toBeVisible();
  await page.getByRole("button", { name: "উত্তর লুকাই" }).click();
  await expect(page.getByText(/নম্বর দেওয়া হচ্ছে না/)).not.toBeVisible();
  await page.getByText("1. 4 (four) key components of an effective session review?", { exact: true }).click();
  await expect(page.getByText("সেলাই ক্লাস শেষে শিক্ষার্থীকে ধাপ বলতে, একটি সেলাই করতে এবং ভুল ঠিক করতে বলুন।", { exact: false })).toBeVisible();
});
