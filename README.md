# Console — Web Design L-3 Practice Console

An interactive, offline-friendly exam-prep app for the **NSDA Web Design Level-3 (ASSET)** assessment — built with **Next.js 16**, TypeScript, and Tailwind CSS.

It contains **every question from your five source files** (120 short Q&A, HTML5 50-MCQ set, the scanned handwritten practice sheet, the 280-question MCQ paper, and the combined written exam document) — **623 questions total** — organized into 15 topic modules with correct answers set for every one of them.

## What's inside

- **9 timed/untimed MCQ practice sets** — HTML, CSS, JavaScript, Bootstrap, Design & UX Principles, Dev Tools & Workflow, Color Theory, a mixed Practice Test, and a Written-Exam MCQ bank.
- **6 flashcard decks** — for the short-answer / definition-style questions (HTML, CSS, JavaScript, jQuery, Bootstrap, and a general/practical deck), with flip-to-reveal + self-rating ("I know this" / "Still learning").
- **A dashboard** with your overall accuracy ring, streak, XP/level, and a "weak modules" panel that automatically points you at whatever you're under 60% on.
- **Automatic mistake tracking** — anything you get wrong is saved and shows up on the **Review** page until you answer it correctly again, and quiz results screen offers a one-click "Retry mistakes" drill.
- **Keyboard-first quiz UI** — press `1`–`4` to answer, `Enter`/`Space` to continue, so you can drill fast without losing focus.
- All progress is stored in your browser's `localStorage` — nothing is sent anywhere, so it works fully offline after the first load.

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
