# প্রস্তুতি — NSDA Study Companion

A mobile-first study app for **CBT&A Level 4** and **NSDA Web Design Level 3 (ASSET)**, built with Next.js 16, TypeScript and Tailwind CSS. Both courses share paper/indigo design tokens, Bengali typography, a desktop sidebar, four-tab mobile navigation and persistent light/dark themes.

It contains **every question from your five source files** (120 short Q&A, HTML5 50-MCQ set, the scanned handwritten practice sheet, the 280-question MCQ paper, and the combined written exam document) — **623 questions total** — organized into 15 topic modules with correct answers set for every one of them.

## What's inside

- **9 timed/untimed MCQ practice sets** — HTML, CSS, JavaScript, Bootstrap, Design & UX Principles, Dev Tools & Workflow, Color Theory, a mixed Practice Test, and a Written-Exam MCQ bank.
- **6 flashcard decks** — for the short-answer / definition-style questions (HTML, CSS, JavaScript, jQuery, Bootstrap, and a general/practical deck), with flip-to-reveal + self-rating ("I know this" / "Still learning").
- **Personal study dashboards**: CBT&A has 10/20/30-minute study plans, due revision, a CBLM progress map and seven-day activity bars. Web Design shows actual answer accuracy and weak modules. Opening, practicing and mastering a topic are separate measurements; none is presented as an exam-pass prediction.
- **Automatic mistake tracking** — anything you get wrong is saved and shows up on the **Review** page until you answer it correctly again, and quiz results screen offers a one-click "Retry mistakes" drill.
- **Keyboard-first quiz UI** — press `1`–`4` to answer, `Enter`/`Space` to continue, so you can drill fast without losing focus.
- **Installable PWA**: use the app install button where supported, or Safari → Share → Add to Home Screen. Requires HTTPS or localhost. Manifest includes standalone mode, maskable icons and study shortcuts.
- **Offline download**: use the CBT&A dashboard download button and wait for its success status. It saves study pages for both courses, static assets and bundled Bengali fonts. Custom Web Design quiz configurations are cached separately when visited; an uncached custom configuration needs a connection.
- Progress lives in the browser's `localStorage`; it is not synced between devices. Clearing browser data also clears progress.
- The learner-supplied short-question collection has 428 source questions, 395 topic links, and 56 independently simplified answers with Bangla explanations and examples. Other linked questions use existing topic study notes. The collection is not treated as verified official exam-frequency evidence.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

For a production build:

```bash
npm run build
npm run start
```

## Project structure

```
src/
  app/                 # routes (dashboard, /modules, /module/[id], /quiz/[id], /flashcards/[id], /review)
  components/           # reusable UI: QuizClient, FlashcardsClient, ModuleCard, ProgressRing, TopNav
  data/                 # question banks (JSON, one file per module) + loader.ts + types.ts
  lib/storage.ts        # localStorage-backed progress, streak, XP and mistake tracking
```

Every module's JSON file lives under `src/data/*.json` — open `src/data/manifest.json` to see the full list of modules, their kind (`mcq` or `flashcards`) and question counts. Adding more questions later (you mentioned more material may come) is as simple as appending objects to the relevant JSON file, or dropping a new module in and registering it in `manifest.json` + `loader.ts`.

## A note on the answer key

Your source PDFs included answers for most sets (the 120 Q&A doc, the 50-question HTML5 sheet, the scanned handwritten sheet, and most of the combined written document). The large 280-question "MCQ Question Paper" had **no answer key at all**, so those answers were determined by hand based on standard HTML/CSS/JS/Bootstrap/UX/accessibility knowledge. A small number of questions in that set are ambiguous or have more than one technically defensible answer (flagged in the data as best-effort) — if you spot one you disagree with, it's a one-line edit in the matching `src/data/*.json` file.


## Verification

```bash
npm run typecheck
npm run lint
npm run test
npm run content:check
npm run build
npm run e2e
```

For a preinstalled Chromium outside Playwright's default browser directory, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when running the browser tests. The normal setup uses Playwright's own installed browser.

Progress summarisation is tested independently from the UI, including local-day boundaries, overdue work, stale concept IDs and corrected mistakes. Service-worker tests check cache ownership, quiz query isolation and partial-download errors. Bengali font files are self-hosted with their license in `public/fonts/`.
