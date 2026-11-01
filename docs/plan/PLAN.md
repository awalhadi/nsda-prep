# PLAN — CBT&A Level 4 Exam Prep

> Approved 2026-11-01. Source of truth for phases P0–P3. Discovery notes: [DISCOVERY.md](DISCOVERY.md).


## Context

The user is preparing Bangladeshi TVET trainer candidates for the CBT&A Level 4 exam. These learners have weak English and answer in English. The goal is to turn the 11 available CBLM PDFs (CBLM 4 "Apply ICT…" is missing) plus 7 question papers in `/docs` into a learning tool:
- A learner reads a concept once, remembers it, and writes an answer the assessor accepts.
- Exam types: short, MCQ, matching, viva.

The user requires **"100% reliable and trustable according to proven data"**. Concretely:
- **Every claim traces to a CBLM page and a verbatim quote, and the build checks this.**
- **Every card is approved by a human before it gets a "Verified" badge.**
- **Importance comes only from exam-pattern data.**
- Highlight colours have **no meaning**; all ~1,409 highlights are equal and none may be missed.

Spec: `prompts/cbta-l4-learning-tool.md`.

**User decisions:**
- New `/cbta` section in the existing app; Web Design L-3 stays untouched.
- Offline, per device, no login (localStorage), with export/import.
- Cards are AI-drafted offline, then a human approves them (draft → reviewed → approved). Drafts are visible with a "Draft" label.
- Pilot one CBLM end to end, then the rest.

## Verified repo facts

- Next.js 16.3 (read `node_modules/next/dist/docs/` before writing routes, fonts or the PWA), React 19.2, TS, Tailwind 4 (tokens in `src/app/globals.css`, dark), framer-motion, lucide. Node v22.21.1.
- No tests, no DB, no auth. README uses npm, but `bun.lock` also exists.
- **`/docs` is gitignored** (an uncommitted `.gitignore` edit at line 22: `/docs`). Change it to `/docs/*` plus `!/docs/plan/`, and commit the extracted evidence (page text plus the sha256 of each PDF) so the checks run without the PDFs.
- Highlights are real PDF annotations. Read them with PyMuPDF `page.annots()`; grep under-counts.
  - Per-CBLM counts: 1 = 140, 2 = 127, OSH = 97, 5 = 61, 6 = 94, 7 = 41, 8 = 142, 9 = 180, 10 = 127, 11 = 234, 12 = 166.
  - Highlights arrive in fragments that must be merged.
- Each CBLM has Self Check + Answer Key sections, and the answer keys contain errors (e.g. OSH PDF p.17, "workplace hazard").
- The OSH PDF has a damaged flate stream.
- Printed page numbers can differ from the PDF page index.
- Reuse:
  - `src/lib/storage.ts`: `loadStore` shallow-merges, so a new `cbta` field is safe.
  - `QuizClient`'s `shuffle` / `shuffleOptions`.
  - `TopNav` links array.
  - `ProgressRing`, `ModuleCard`.
  - The async `params` route pattern (`src/app/quiz/[id]/page.tsx`).
- `/review` and `recordAttempt` assume manifest module ids, so CBT&A progress must live in its own namespace.

## Architecture: evidence → author → verify → app

```
/docs/*.pdf ─A─► .cache/raw (PyMuPDF words+bbox, annots+quads)      [gitignored]
            ─B─► content/cbta/evidence/ (pages, merged passages,     [committed]
                 teacher notes, self-checks, paper questions)
            ─C─► content/cbta/concepts/**.json  (AI-drafted offline   [committed]
                 from per-concept evidence packs, with citations)
            ─D─► build: zod + fidelity checks + priority + review
                 ledger → src/data/cbta/generated/*.json + docs/plan/*.md
                                   └─► Next.js /cbta (static, offline SW)
```

- Python only dumps raw data and renders proof images. All logic (merge, segment, parse, dedupe, priority, checks) is TypeScript, tested with vitest on real-page fixtures, and run via `node --experimental-strip-types`.
- **Never authored, always computed from evidence:** stars, priority, `importance_reason`/`_bn` (fixed en/bn templates), `appears_in`, status. The "why important" line therefore cannot invent a source.
- No AI at runtime.

## Trust design (the core)

1. **Citation model** (`src/lib/cbta/schema.ts`, zod; types via `z.infer`):
   - `Cite{src, pdfPage, printedPage?, quote, passageId?}`
   - `Claim{text, cites[≥1], fidelity: verbatim|paraphrase}`
   - **Factual fields must be Claims:** one-line answer, list items, traps, model answers, short-answer key points, the MCQ correct option, matching pairs.
   - **Pedagogy fields carry no facts:** Bangla lines, example, mnemonic. A term guard checks that every technical term in them appears in the concept's claims or keywords.
   - `[CHECK]` items are a structured `checks[]` array, so none get lost.
2. **Automated fidelity checks** (`scripts/content/build.ts`; each is an error or a warning):
   1. **Citation resolves:** source, page and text all exist.
   2. **Quote exists on the cited page:**
      - Exact match after normalization (NFKC, hyphenation, bullets, headers and footers stripped).
      - Otherwise a token-Levenshtein window: ≥0.97 passes, 0.90–0.97 is a warning, below that is an error.
      - `verbatim` requires an exact match.
   3. **Claim is supported by its quote:** ≥70% of the claim's content words appear in it.
   4. **List count:**
      - `items.length` equals the declared count found in the source ("five principles…").
      - Each item is found on the cited page.
      - If CBLMs disagree on the count, that is a conflict, and it blocks approval until it is resolved.
   5. **MCQ:**
      - The answer index is valid and options are unique.
      - The correct option is supported by its cite.
      - Ambiguous distractors get a warning.
      - Real paper questions must match their answer key, or an erratum is created.
   6. **Matching:** every pair is cited, and the answer is a permutation.
   7. **Coverage:**
      - Every merged passage is covered by ≥1 concept.
      - Every paper and self-check question is mapped to a concept and included verbatim.
      - Raw counts equal `expected-counts.json` (the 1,409 table).
   8. **Readability:** English sentences ≤15 words. Over the limit is an error, except for verbatim official definitions, where it is a warning.
   9. **Script:** `*.bn` fields contain Bengali script, and `en` fields don't.
   10. **Determinism:** `--check` regenerates the outputs and fails on any diff.
3. **Review ledger** (`content/cbta/review/ledger.json`, kept separate from the concept files):
   - Each entry stores `contentHash` (canonical JSON of the authored fields) and `evidenceHash` (the cited pages).
   - Effective status:
     - **approved** only if both hashes match and every gate passes.
     - An edit after approval shows **"Draft · changed"**, with a diff against the snapshot.
     - Computed fields are excluded from the hash, so adding CBLM 11 later doesn't break approvals; only new conflicts do.
   - Approval goes through `npm run content:approve -- <id> --by <name>`:
     - It requires a TTY and shows the card, its citations with match scores, and the diff.
     - The reviewer name must be in `reviewers.json`.
     - Agents never run it.
4. **Errata** (`content/cbta/errata.json`):
   - Answer-key errors are detected automatically.
   - The card shows "Answer key says X (p.17); information sheet says Y (p.N) → write Y."
   - `/cbta/corrections` lists them all.
5. **`docs/plan/REVIEW_QUEUE.md`** is regenerated on every build, in this order:
   1. Blockers
   2. Changed since approval
   3. Conflicts
   4. Errata
   5. `[CHECK]` items (all CBLM 4 answers that aren't in the paper)
   6. Fuzzy-match warnings
   7. Drafts, ★★★ first

   Each row has a PDF page link and a proof crop.
6. **Honesty page** `/cbta/about` (bn + en):
   - What "Verified" means.
   - How priority is computed.
   - That viva questions are derived, because there are no viva samples.

## Pipeline

**Stages and commands:**

| Command | What it does |
|---|---|
| `content:extract` | Python: lockfile, raw dump, count self-test |
| `content:derive` | Merges highlights (centre-in-quad, same-block adjacency ≤1.2× line height, word-boundary extension, lead-in context, raw ids kept); parses LO/Info Sheet/Self Check/Answer Key; one parser config per paper, with overrides that carry reasons |
| `content:proof` | Renders 2 pages per CBLM with merged passages boxed over the real highlights, plus a crop per citation |
| `content:packs` | Builds one evidence pack per concept |
| `content:build` | Runs every check, computes priority, writes bundles and reports |
| `content:check` | Same as build without writing; fails if outputs are stale |
| `content:approve` | Human approval (see Trust design) |
| `content:all` | Runs everything from extract onwards |

**Agent authoring steps (offline):**
- C1: the concept map. Deduplicates across CBLMs into canonical concepts with aliases.
- C2: card drafts written from the packs only, with quotes copied from the packs.
- Both follow `content/cbta/authoring/AUTHORING_GUIDE.md`: the 10-step card template, the gold card `hierarchy-of-controls`, and the rules "no new facts" and "<15 words".

**Idempotency:**
- Canonical JSON (sorted keys, no timestamps).
- Stages are skipped when their input hash hasn't changed.
- Running the build twice must leave `git diff` clean.

**Priority** (`src/lib/cbta/priority.ts`), the spec formula exactly:
- `highlight_weight` (2, plus 1 if highlighted in ≥2 places) + distinct CBLM count + `3 × official papers` + `2 × formative/unit papers` + `2 × self-checks`.
- ★★★ for the top 25%, or any concept asked in an official paper. Every highlighted concept is at least ★★.
- `assessor-flags.json` may only raise a concept, with a reason.

**Adding CBLM 4 later:**
1. Drop in the PDF.
2. Set `file` in `sources.config.json` and add its expected counts.
3. Run `npm run content:all` and the agent authoring steps.

## App (`/cbta`, all static; existing app untouched except minimal edits)

| Route | Purpose |
|---|---|
| `/cbta` | Dashboard: progress per CBLM and per question type, weak concepts, items due today, ★★★ shortlist with Bangla "why important", "Make available offline" button |
| `/cbta/guide` | Study Priority Guide: Top 30, Top 10 per CBLM, question types per CBLM, 3/7/15-day plans, formula explained |
| `/cbta/cblm/[n]` | `generateStaticParams` 1–12: concepts, yellow `HighlightMark`, must-read and status filters, "No CBLM" badge on CBLM 4 |
| `/cbta/concept/[id]` | Server-rendered `ConceptCard` in the fixed 10-section order (title, stars, why-important, one-line answer, key words, Bangla, example, memory trick, list, traps, practice, sources); Bangla toggle; status badge; source chip with quote popover |
| `/cbta/search` | English and Bangla search over a client index (NFC normalized, zero-width characters stripped, prefix match) |
| `/cbta/practice/[mode]` | mcq / short / matching / viva / mixed: `McqItem` (reuses `shuffleOptions`), `ShortSelfCheck` (key-point checklist), `MatchingBoard` (tap to pair, keyboard, numbered pairs), `VivaCard` (flip) |
| `/cbta/revise` | Leitner boxes at 1/3/7 days, local-date keys, pure `leitner.ts` |
| `/cbta/mock` | Blueprint counts from PATTERN_ANALYSIS (e.g. 10 MCQ + 1 matching ×5 + 10 short + optional viva); seeded, priority-weighted, real questions first; score by type; misses go to Leitner. Pure `mock.ts`. |
| `/cbta/corrections`, `/about`, `/settings`, `/offline` | Errata, the honesty page, export/import/reset, the offline fallback |

**Storage:**
- Add an optional `cbta: {v:1, attempts, leitner, read, mocks, prefs}` to `StoreShape` in `src/lib/storage.ts`, read and written through `getCbta()` / `updateCbta()` with `migrateCbta()` repair.
- Never touch the legacy `attempts`, `mistakes` or `xp`.
- Export and import (merge or replace) as a JSON file.

**Offline (no dependencies):**
- `public/sw.js`:
  - Static assets: cache-first.
  - `/cbta` navigations: network-first with a 3 s timeout, then cache, then `/cbta/offline`.
  - RSC requests: network-only, returning 503 when offline, which forces a full page load from cache.
  - Everything outside `/cbta`: passed through.
- "Make available offline" pre-caches every URL listed in a force-static `/cbta/offline-manifest.json` route.
- Also: `src/app/manifest.ts`, and an `/sw.js` header in `next.config.ts`.
- Don't enable `experimental.useOffline`.

**UI and performance:**
- Bangla text uses Noto Sans Bengali via `next/font` in `src/app/cbta/layout.tsx` (falls back to `next/font/local`), with `lang="bn"` and line-height 1.75.
- Accessibility: AA contrast, targets ≥44px, keyboard support, reduced motion, feedback never shown by colour alone.
- Performance budget:
  - Concept route: ≤130 KB first-load JS, and no framer-motion on the concept page.
  - Bengali font: ≤120 KB.
  - Enforced by `scripts/content/perf-budget.ts`.

**Minimal edits to existing files:**
- `TopNav.tsx`: one link, plus a `startsWith` check for `/cbta`.
- `QuizClient.tsx`: `shuffle` and `shuffleOptions` move to `src/lib/quiz-shuffle.ts`; only the import line changes.
- `storage.ts`: additive only.
- `next.config.ts`, `package.json`, `.gitignore`, `tsconfig.json`.

## Tests & dependencies

- **Vitest units:** normalize, fuzzy, merge (real "su"-fragment fixtures), segment and self-check (OSH p.17 erratum detected), papers (counts per type), every fidelity check (including the gold card), ledger (approve → edit → changed), priority, importance, leitner (midnight in the Dhaka timezone), mock (blueprint counts, no duplicate concept, seeded), storage (legacy store unchanged), quiz-shuffle parity, MatchingBoard (jsdom), and a contract test over the real content.
- **Playwright** (Pixel 7 profile, production build):
  - Practice flow: hub → concept → wrong MCQ → model answer and source → clock +1 day → concept due in revise.
  - Matching and viva.
  - Mock exam.
  - Legacy-storage safety.
  - Offline reload.
  - axe accessibility.
- **Dev-only dependencies:** zod, vitest, @vitejs/plugin-react, jsdom, @testing-library/react, @testing-library/dom, vite-tsconfig-paths, @playwright/test, @axe-core/playwright; PyMuPDF pinned in a venv. No runtime dependencies.
- **`npm run verify`** = lint + `tsc --noEmit` + vitest + `content:check` + `next build` + perf budget. **`verify:full`** adds e2e.

## Phases (stop after each one and report: what changed, how to check it, what's left, [CHECK] items)

1. **P0 Discovery:**
   - Create branch `feat/cbta-l4` and fix `.gitignore`. Leave the user's own uncommitted edits alone.
   - Write `docs/plan/DISCOVERY.md` and `PLAN.md`.
   - Ask: delete `bun.lock`? Which reviewer names go in `reviewers.json`?
2. **P1a Evidence (no AI):**
   - Extract and derive. Counts must equal the 1,409 table exactly.
   - Proof PNGs, doubtful-page list, question bank, pattern counts.
   - **Stop:** the user checks the proofs.
3. **P1b Trust machinery:**
   - Schema, checks, ledger and approve, errata, queue, priority.
   - Demo with the gold card (approve → edit → drops to Draft), the determinism check, and minimal concept and CBLM pages for review.
4. **P1c Pilot CBLM 12:**
   - Why 12: 50 pages and 166 highlights give a fast loop, it's in the Final Formative, and it owns the shared assessment concepts.
   - Deliverables: concept map, drafts, 0 uncovered, PATTERN_ANALYSIS, REVIEW_QUEUE.
   - **Stop:** the user reviews and approves cards; feedback goes into AUTHORING_GUIDE.
5. **P2 MVP app:**
   - Dashboard, guide, search, practice, Leitner, mock, storage and export, PWA/SW, fonts, Playwright, `verify` green.
   - **Stop:** demo on a real Android phone in offline mode.
6. **P1d Remaining CBLMs** in weight order (11 → 9 → 8 → 10 → 1 → 2 → 3 → 6 → 5 → 7), then CBLM 4 as question-paper-only. Stop after each batch.
7. **P3 Extras:**
   - Printable cheat sheets per CBLM plus a ★★★ master sheet.
   - Bookmarks and notes.
   - A dev-only admin editor (404 in production; git is the history; approval stays CLI-only).

## Verification (end to end)

1. `npm run content:all`: raw counts match the table; COVERAGE_REPORT shows 0 uncovered for the scope; running it twice leaves `git diff --exit-code` clean.
2. Open the proof PNGs: the boxes line up with the yellow/green areas.
3. `npm run content:approve -- hierarchy-of-controls --by <name>`, then edit a list item and run `content:build`: the card shows "Draft · changed" and appears in REVIEW_QUEUE.
4. Break a quote or a list count on purpose: `content:check` fails with a clear message.
5. `npm run verify:full`: all green.
6. `npm run build && npm start`, on a phone:
   - `/cbta` → "Make available offline" → airplane mode.
   - Open concepts, practise, take a mock exam, and see revise items the next day.
   - Bangla renders correctly.
   - Lighthouse mobile LCP < 2 s.
7. `/` and `/review` (Web Design L-3) still work, and the old progress is unchanged.
