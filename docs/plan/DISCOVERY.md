# Phase 0 — Discovery: CBT&A Level 4 Exam Prep

Date: 2026-11-01 · Branch: `feat/cbta-l4`

## Detected stack

| Area | Finding |
|---|---|
| Language | TypeScript 5 (strict, `noEmit`, `moduleResolution: bundler`, alias `@/*` → `src/*`) |
| Framework | Next.js **16.3.0**, App Router. It has breaking changes, so read `node_modules/next/dist/docs/` first. Route params are async (`params: Promise<…>`). |
| UI | React 19.2, Tailwind CSS 4 (design tokens in `src/app/globals.css`, dark theme only), framer-motion 13, lucide-react, clsx |
| Package manager | **npm** (README uses it). `package-lock.json` and `bun.lock` were committed together, so `bun.lock` looks like leftover drift (see Questions). |
| Data | Static JSON in `src/data/*.json`, registered in `src/data/manifest.json` and read through `src/data/loader.ts` |
| Storage | Browser `localStorage`, key `wdp3_store_v1`, in `src/lib/storage.ts`. `loadStore` shallow-merges with defaults, so new optional fields are safe to add. |
| DB / ORM / auth | **None** |
| i18n | None. Bangla text renders from the system font, and no Bengali webfont is loaded. |
| Tests | **None** (no runner, no config) |
| Lint / types | ESLint 9 flat config (`eslint-config-next` core-web-vitals + typescript). Both lint and `tsc --noEmit` pass on the baseline. |
| Deployment | No platform config in the repo (no vercel.json, Dockerfile or CI). Runs with `next build && next start`. |
| Runtime | Node v22.21.1, Python 3.12 (PyMuPDF goes in a pipeline-only venv) |

## Source material (`/docs`, kept local: PDFs are gitignored)

- **11 of 12 CBLMs are present.** **CBLM 4, "Apply ICT to facilitate in training and assessment", is missing.** The Final Formative paper still asks ICT MCQs, so CBLM 4 will be built from those questions only, with every answer flagged `[CHECK]`.
- **Highlights are real PDF `Highlight` annotations.** Counted with PyMuPDF; `grep` under-counts because the annotations sit in compressed object streams.

  | CBLM | 1 | 2 | 3 (OSH) | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | **Total** |
  |---|---|---|---|---|---|---|---|---|---|---|---|---|
  | Highlights | 140 | 127 | 97 | 61 | 94 | 41 | 142 | 180 | 127 | 234 | 166 | **1,409** |

  There are also Underline annotations (treated as highlights), FreeText/Ink/Caret annotations (teacher notes), and StrikeOut/Redact annotations (ignored, but reported). **Colours have no meaning.**
- **Highlights are fragmented.** One sentence is often split into several annotations, with pieces as small as "su". They need merging, word-boundary extension, and lead-in context.
- **Every CBLM has a Self Check and Answer Key after each Information Sheet** (6–18 per CBLM). **The answer keys contain errors.** For example, OSH PDF page 17 answers "What is workplace hazard?" with the definition of a *workplace*.
- **The OSH PDF has a damaged flate stream** (`pdftotext` reports "Bad block header"). Pages with low or empty text will be flagged for manual checking.
- **Printed page numbers can differ from the PDF page index.** Both will be stored.
- **Exam papers (7):**
  - `CBTA_Question_Inclusivity_and_Maintenance.pdf`: official-style written test. Part A has 10 MCQ, Part B has 1 matching question with 5 items, Part C has 10 short questions.
  - `Final Formative -01.pdf`: 1 hour, MCQ, covers CBLM 1, 3, 4, 11 and 12.
  - `Short_Questions.pdf`, `UNIT-01.pdf`, `UNIT 01 Questions (1).pdf`, `UNIT 01 answer.pdf`, `UNIT-02.pdf`.
  - **There are no viva samples.** Viva questions will be derived from the short questions and definitions, and labelled as derived.

## Where the feature lives

| Piece | Location |
|---|---|
| Routes | `src/app/cbta/**` (new section; Web Design L-3 routes untouched) |
| Shared logic | `src/lib/cbta/*` (schema, priority, importance, leitner, mock, search, progress) |
| App content bundles (generated) | `src/data/cbta/generated/*` |
| Evidence + authored content (reviewed in git) | `content/cbta/**` |
| Pipeline | `scripts/cblm/*` (Python, raw PDF dump only) and `scripts/content/*` (TypeScript: derive, checks, build, approve) |
| UI components | `src/components/cbta/*` |
| Plan and reports | `docs/plan/*` (committed via the `!/docs/plan/` exception) |

## Reuse

- `src/lib/storage.ts`: add an optional, separately versioned `cbta` namespace. The legacy `attempts`, `mistakes` and `xp` stay untouched.
- `QuizClient`'s `shuffle` / `shuffleOptions` (they handle the "all of the above" anchoring) move to `src/lib/quiz-shuffle.ts` unchanged, and `QuizClient` imports them from there.
- `TopNav` gets one new link. `ProgressRing`, the `ModuleCard` style, the design tokens and the `font-mono-tag` / `font-display` utilities are reused.
- The async-params server page pattern from `src/app/quiz/[id]/page.tsx`.

## Risks

| Risk | Mitigation |
|---|---|
| Nobody can promise "100% reliable" without human review | Every claim carries a page and a verbatim quote that the build verifies. Only human-approved cards get the "Verified" badge. Source errors are shown to learners, not hidden. |
| Highlight merge errors (fragments, tables, columns) | Golden fixtures from real pages, proof renders, a doubtful-page list, and a coverage gate |
| Damaged or image-only pages | Per-page text-length checks, a `garbled` flag, manual overrides that must carry a reason, and no silent OCR |
| AI drafting invents facts | The agent sees only the evidence packs; factual fields must quote the source; a support-overlap check; importance lines are computed, not written; human approval |
| Bangla quality can't be machine-checked | Bangla is marked as reviewer-only, and ★★★ cards are reviewed first |
| Next 16 offline behaviour | A hand-written service worker, with the offline path checked against Next's router source; Playwright offline test; `experimental.useOffline` stays off |
| Breaking the existing Web Design app | Edits to existing files are minimal and additive; legacy-storage e2e test and a shuffle-parity test |
| Little pattern data (7 papers, no viva samples) | Show raw frequencies; assessor flags can only raise a rank, with a reason |
| Review throughput is the real bottleneck | Queue sorted by priority, and drafts stay usable with a "Draft" label |

## Assumptions (proceeding unless corrected)

1. Use npm. Leave `bun.lock` alone until you decide (Q1).
2. The pilot CBLM is **12** (50 pages and 166 highlights, which is the fastest review loop; it appears in the Final Formative; and it owns the shared assessment concepts).
3. Single local user. `user_id` is a constant.
4. Evidence text extracted from the PDFs is committed, so checks and CI run without the PDFs. Re-extracting needs the PDFs locally.

## Questions (non-blocking for P1a; needed before P1b approvals)

1. **Delete `bun.lock`** and standardise on npm? (Recommended: yes.)
2. **Reviewer names** for `content/cbta/review/reviewers.json`: who may approve cards (you and/or a teacher)?
