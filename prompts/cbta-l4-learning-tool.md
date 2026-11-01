# Agent Prompt — CBT&A Level 4 Exam Prep

> Paste everything below this line into the agent (Claude Code / any coding agent) at the repo root.

---

## ROLE

You are a principal software engineer and an instructional designer. You are also an experienced CBT&A Level 4 trainer and NSDA/BTEB competency assessor: you know how examiners phrase questions and what answer gets full marks.

You are adding a new feature to my EXISTING system. Do not rewrite or restructure what already exists. Follow its stack, folder layout, naming, lint rules, storage and UI components exactly.

## PRODUCT GOAL

Build a "CBT&A Level 4 Exam Prep" learning tool. A learner with weak English must be able to read each topic ONCE and remember it for the exam. Success = after one read, the learner can write a to-the-point answer that a TVET assessor (the "sir") is satisfied with.

- Exam format: short questions, MCQ, matching, viva.
- Source material: the 12 CBLMs (11 available, see below).
- Topics repeat across CBLMs, so each concept lives in ONE place and links to every CBLM that mentions it.

The learner: a Bangladeshi TVET trainer candidate. Thinks in Bangla and doesn't know many English words, but must write exam answers in English. Limited time.

## KNOWN FACTS ABOUT THIS REPO (verified, use them; re-check during Discovery)

### Existing app

- **Next.js 16.3** with breaking changes. Read `AGENTS.md` and the relevant guides in `node_modules/next/dist/docs/` (`01-app`, `03-architecture`) before writing routes, layouts, fonts, params or metadata. Heed deprecation notices.
- React 19.2, TypeScript, Tailwind 4, framer-motion, lucide-react, clsx. ESLint 9 (`npm run lint`). Both `bun.lock` and `package-lock.json` exist; find out which one is in real use.
- **No database, no ORM, no auth, no test setup, no i18n library.** Content is static JSON in `src/data/*.json`, registered via `src/data/manifest.json` and `src/data/loader.ts`. Learner state lives in localStorage via `src/lib/storage.ts` (key `wdp3_store_v1`: attempts, mistakes, flash progress, streak, xp, settings).
- Reusable UI: `QuizClient`, `FlashcardsClient`, `DashboardClient`, `ModuleCard`, `ProgressRing`, `TopNav`, `SettingsClient`. Routes: `/`, `/modules`, `/module/[id]`, `/quiz/[id]`, `/flashcards/[id]`, `/review`, `/settings`.
- So the data model below maps to **versioned JSON files (content) + localStorage (Attempt, Progress)** for a single local user. Don't add a DB or auth in the MVP unless you justify it in PLAN.md and I approve.

### Input layout (differs from the generic spec)

All inputs are flat in `/docs`, not in `/docs/cblm` and `/docs/exam-patterns`. Use them where they are. If you want to reorganise, propose it in PLAN.md first.

**CBLMs (PDF, text-based, extractable with PyMuPDF):**

| # | CBLM | File | Pages | Highlight annotations |
|---|---|---|---|---|
| 1 | Work effectively within TVET Sector | `1. CBLM_Work effectively within  TVET Sector (1).pdf` | 57 | 140 |
| 2 | Promote Inclusive Learning in a CBT&A Environment | `2. CBLM_Promote Inclusive Learning…Aug 2012.pdf` | 36 | 127 |
| 3 | Apply OSH in a CBT&A Environment | `CBLM_Apply OSH in a CBT&A Environment.pdf` | 46 | 97 |
| 4 | **Apply ICT to facilitate in training and assessment** | **MISSING** | — | — |
| 5 | Maintain and Enhance Professional Practice | `5. CBLM_Maintain and Enhance Professional Practice….pdf` | 46 | 61 |
| 6 | Maintain training equipment and facility | `6. CBLM_Maintain training equipment and facility_Vesion_2.pdf` | 43 | 94 |
| 7 | Maintain and Enhance Technical Competency | `7. CBLM_Maintain and Enhance Technical Competency….pdf` | 25 | 41 |
| 8 | Design and Modify CBT Learning Material and Resources | `8. CBLM_Design and Modify CBT Learning Material….pdf` | 51 | 142 |
| 9 | Plan and Organise CBT sessions | `9. CBLM_Plan and Organise competency based trianing sessions….pdf` | 71 | 180 |
| 10 | Deliver Competency Based Training | `10. CBLM_Deliver Competency Based Training_Sept_2012.pdf` | 84 | 127 |
| 11 | Design and develop Competency Based Assessment | `11. CBLM_Design and develop Competency Based Assessment.pdf` | 80 | 234 |
| 12 | Organise and Conduct Competency Assessment | `12. CBLM_ Organise and Conduct Competency Assessment.pdf` | 50 | 166 |

Total ≈ 1,409 raw highlight annotations. Your extracted counts must match these exactly.

**How highlights are marked:** real PDF `Highlight` annotations with a yellow/green background. They are not `==text==`, `<mark>` or bold.
- Colours seen (RGB 0–1): yellow `(1,1,0)`, light yellow `(1,1,0.5)`, amber `(1,0.9,0.4)`, green `(0.5,0.9,0.4)`, a few red `(0.9,0.3,0.3)`. **Colours have NO different meaning.** Every colour = highlighted = high-priority, all equal. Don't ask about colours, and don't use colour for ranking. Importance comes only from the exam-pattern analysis (see Phase 1, step 8).
- Also present: `Underline` (treat as highlighted), `FreeText` / `Ink` / `Caret` (my handwritten notes, show them as "Teacher note"), and `StrikeOut` / `Redact` (ignore, but list them).
- **Use `page.annots()` (PyMuPDF). Never grep the raw PDF.** Annotations sit in compressed object streams, and grep reported 0 for CBLM 2, which really has 127.
- Get the highlighted text from the words under each annotation quad (`annot.vertices` → quads; words from `page.get_text("words")` whose centre is inside a quad). One sentence is often split into several annotations (fragments like `"su"`), so merge adjacent fragments into one passage, extend cut words, and keep the lead-in sentence as context. Keep the raw annotation ids for coverage.

**Self Check + Answer Key:** every CBLM has one after each Information Sheet (6–18 per CBLM). Treat them as an exam-pattern source too. Some answer-key bullets are images or garbled.
- **The answer keys contain errors.** Example: OSH CBLM p.17 answers "What is workplace hazard?" with the definition of a *workplace*. Never copy such an answer silently. Put it in REVIEW_QUEUE with `[CHECK]` and propose the correction from the information sheet.

**Exam patterns:**
- `CBTA_Question_Inclusivity_and_Maintenance.pdf`: official-style written test (CBLM 2 + 6). Part A 10 MCQ, Part B 1 matching (5 items), Part C 10 short.
- `Final Formative -01.pdf`: 1 hour, MCQ, covers CBLM 1, 3, **4**, 11, 12.
- `Short_Questions.pdf`: short questions with an "Answer guide".
- `UNIT-01.pdf`, `UNIT 01 Questions (1).pdf`, `UNIT 01 answer.pdf`: Unit 1 short, MCQ and answers.
- `UNIT-02.pdf`: short questions with hints (hazards → seems to map to OSH; verify).
- No viva samples exist. Derive viva questions from short questions and definitions, and say so in PATTERN_ANALYSIS.

**CBLM 4 (ICT) is missing,** but the Final Formative asks ICT questions. Build CBLM 4 concepts **only** from those questions. Mark them `source: question-paper-only` with a visible "No CBLM" badge, and put every answer that isn't in the paper in REVIEW_QUEUE as `[CHECK]`.

## PHASE 0: DISCOVERY (do this first, change no code)

Inspect the repo: language, framework, package manager, data/storage, auth, routing, UI kit, styling, test setup, i18n, deployment. Confirm or correct the "Known facts" above.

Write `/docs/plan/DISCOVERY.md` with:
- the detected stack
- where the feature should live (suggestion: `/cbta/...` routes, `src/data/cbta/`, `scripts/cblm/`)
- what you will reuse
- risks
- any question that blocks you

Ask at most 5 questions, and only if they truly block you. Otherwise state your assumption and go on.

Write `/docs/plan/PLAN.md`: phases, file list, data model, test plan, and a justification for every new dependency. Likely candidates:
- PyMuPDF, in a Python venv for the pipeline only
- Vitest, for unit tests
- Playwright, for the E2E test
- a small offline approach (service worker / Next 16 mechanism)

Then STOP and wait for my approval.

## PHASE 1: CONTENT PIPELINE (accuracy first)

Build a repeatable script (not a one-off) in `scripts/cblm/`, runnable with one command, that turns `/docs` into structured content:

1. Parse each CBLM into: CBLM number and title, learning outcome, topic (Information Sheet), sub-topic, source page, text, and a boolean `is_highlighted`. Report extraction quality per file.
2. Extract every highlighted passage into a Highlight record (`id, cblm, page, colour, annot_type, text, context, raw_annot_ids`). Every Highlight MUST end up in at least one Concept.
3. For every CBLM, render 2 sample pages with the extracted passages outlined, to prove they line up with the yellow/green areas. List any page with detection doubts for my manual check.
4. Extract every Self Check question and Answer Key.
5. Produce `/docs/plan/COVERAGE_REPORT.md` with:
   - total highlights per CBLM (raw annotations and merged passages)
   - covered
   - uncovered (must be 0)
   - pages with detection doubts
   - strikeouts that were ignored
6. **De-duplicate:** group the same idea across CBLMs into one Concept (e.g. "Principles of assessment", "Rules of evidence", "RPL", "Reasonable adjustment", "Hazard types"). Each Concept stores `canonical_title`, `appears_in` (CBLM + page list) and the merged best definition. If CBLMs disagree on a count or wording, report it. Don't choose silently.
7. **Analyse the exam patterns** (papers + self checks): classify each question as short / MCQ / matching / viva, tag the concept it tests, and compute frequency. Output `/docs/plan/PATTERN_ANALYSIS.md` with:
   - most-tested concepts
   - command words (define, list, state, explain, differentiate, match)
   - typical answer length and marks
   - common traps
   - question counts per type per paper (the mock exam uses these)
8. **Priority per Concept:**

   ```
   priority = highlight_weight + repeat_count_across_CBLMs + exam_pattern_frequency
     highlight_weight        = 2 if highlighted (any colour/underline), +1 if highlighted in ≥2 places
     repeat_count_across_CBLMs = number of distinct CBLMs in appears_in
     exam_pattern_frequency  = 3 × (official/written-test papers it appears in)
                             + 2 × (formative / unit practice papers)
                             + 2 × (self checks)
   stars: ★★★ top 25% (or any concept asked in an official paper), ★★ next 40%, ★ rest
   ```

   Every highlighted concept gets at least ★★. Show the formula and the full ranking in PATTERN_ANALYSIS.md. You may flag a concept as "classic viva/exam item" from assessor experience, but only to raise its rank, never to add facts, and give the reason.

9. **Tell me and the students why each concept is important.** Don't just give stars. For every concept, generate:
   - `importance_reason` (English, short) and `importance_reason_bn` (Bangla). For example: "Asked in Final Formative Q3 and OSH Self Check Q4. Highlighted in CBLM 3. Comes as MCQ and short." / "Final Formative আর Self Check দুই জায়গাতেই এসেছে — MCQ আর short দুইভাবেই আসে। অবশ্যই পড়বেন।"
   - `likely_question_types`: e.g. MCQ + short, with the most likely question wording.

   In PATTERN_ANALYSIS.md, add a **"Study Priority Guide" written in simple Bangla + English for students**:
   - Top 30 must-read concepts overall, and Top 10 per CBLM, each with its one-line reason
   - which question types each CBLM usually brings
   - what to read first if 3 / 7 / 15 days are left

   Also publish this guide inside the app (see Dashboard).

Output content as **versioned JSON in git** (e.g. `src/data/cbta/*.json`) for review. Then stop and report (see Workflow).

## CONTENT RULES FOR EVERY CONCEPT CARD (the heart of the product)

Generate each card in this exact order. Keep every English sentence under 15 words. Use one fixed template, so the learner's brain learns the layout.

1. **TITLE** (English) + priority stars (★★★ = most likely in exam) + **"Why important"** line in Bangla, from `importance_reason_bn` (where it was asked and how it comes in the exam).
2. **ONE-LINE EXAM ANSWER** (English, simple): the sentence the learner writes for "Define X". Use the CBLM wording where it is the official definition. This is what pleases the assessor.
3. **KEY WORDS:** 3 to 6 key words in bold, each with a Bangla meaning (Bangla in Bangla script, English term in Latin).
4. **BANGLA EXPLANATION:** 3 to 5 short lines in simple spoken Bangla. Explain why it matters, not just what it is.
5. **REAL-LIFE EXAMPLE:** one industry or everyday example a Bangladeshi learner knows (workshop, garments, driving test, IT training centre, hospital). One example only. Make it concrete.
6. **MEMORY TRICK:** a mnemonic, rhyme or visual (e.g. VRFF = "Very Real Food Fight" for Validity, Reliability, Flexibility, Fairness). Only when it really helps. Never force it.
7. **LIST ANSWER:** if the concept is a list (principles, rules of evidence, stages), show the numbered list exactly as the CBLM states it, with the correct count.
8. **EXAM TRAPS:** common mix-ups (e.g. direct vs indirect evidence; formative vs summative; 5 vs 6 rules of evidence).
9. **PRACTICE:** 1 short, 1 MCQ, 1 matching and 1 viva question, each with a model answer, built from this concept's exam pattern. Include every real paper/self-check question for the concept verbatim, tagged with its source.
10. **SOURCES:** `appears_in` links (CBLM number and page).

English must be plain: no idioms, and no long word where a short one works. Do NOT add facts that are not in the CBLM or the question patterns. If you are unsure, flag it with `[CHECK]` instead of guessing.

Model answers must satisfy the assessor:
- Open with the key word or definition in one line.
- Use numbered points for list/steps/types, and match the count the question asks for.
- Use CBLM terminology (performance criteria, range statement, evidence guide, etc.).
- No filler. Viva answers are 1–2 sentences you can say aloud.

### Gold-standard card (match this quality and order)

Real data: highlighted in OSH CBLM p.10, asked in OSH Self Check 1 Q4 ("steps of hierarchy of control from bottom to top"), and asked in Final Formative-01 MCQ 3 ("control of last resort"). Stars: ★★★.

```json
{
  "id": "hierarchy-of-controls",
  "canonical_title": "Hierarchy of Controls",
  "stars": 3,
  "importance_reason": "Asked in Final Formative-01 (MCQ 3) and OSH Self Check 1 (Q4). Highlighted in CBLM 3.",
  "importance_reason_bn": "Final Formative আর Self Check দুই জায়গাতেই এসেছে। MCQ-তে 'last resort কোনটা' আর short-এ 'ধাপগুলো লেখো' — দুইভাবেই আসে। অবশ্যই পড়বেন।",
  "likely_question_types": ["mcq", "short", "matching", "viva"],
  "one_line_answer": "The hierarchy of controls is the order for controlling hazards, from most to least reliable.",
  "keywords": [
    { "en": "Hazard", "bn": "বিপদের উৎস — যা ক্ষতি করতে পারে" },
    { "en": "Control", "bn": "নিয়ন্ত্রণ ব্যবস্থা" },
    { "en": "Hierarchy", "bn": "উপর থেকে নিচে ধাপক্রম" },
    { "en": "Last resort", "bn": "সবশেষ উপায়" },
    { "en": "PPE", "bn": "ব্যক্তিগত সুরক্ষা সরঞ্জাম" }
  ],
  "bangla_explanation": [
    "Hazard কন্ট্রোল করার একটা নির্দিষ্ট ক্রম আছে।",
    "সবচেয়ে ভালো উপায় hazard টাকেই সরিয়ে ফেলা।",
    "যত নিচে নামবেন, কন্ট্রোল তত দুর্বল আর বেশি পরিশ্রমের।",
    "PPE সবার শেষে, কারণ এটা hazard কমায় না, শুধু মানুষকে আড়াল দেয়।"
  ],
  "example": "A garments cutting machine is very noisy. Buy a quiet machine first. Put it in a closed room next. Ear plugs come last.",
  "mnemonic": "Every Smart Instructor Engineers A Plan → E-S-I-E-A-P (top to bottom)",
  "list_answer": [
    "Elimination",
    "Substitution",
    "Isolation",
    "Engineering controls",
    "Administrative controls",
    "Personal Protective Equipment (PPE)"
  ],
  "traps": [
    "PPE is the LAST resort, not the first choice.",
    "Self Check asks bottom to top: PPE → Administrative → Engineering → Isolation → Substitution → Elimination."
  ],
  "practice": {
    "short": { "prompt": "Write down the steps of hierarchy of control from bottom to top.", "answer": "1. PPE 2. Administrative controls 3. Engineering controls 4. Isolation 5. Substitution 6. Elimination", "source": "OSH CBLM Self Check 1 Q4" },
    "mcq": { "prompt": "According to the hierarchy of controls, which control is always the control of last resort?", "options": ["Elimination", "Substitution", "Administrative controls", "Personal Protective Equipment (PPE)"], "answer": 3, "source": "Final Formative-01 Q3" },
    "matching": { "left": ["Elimination", "Substitution", "Isolation", "Engineering", "PPE"], "right": ["Remove the risk", "Replace the hazard", "Separate the risk", "Design it out / guard", "Protect the person"], "answer": [0, 1, 2, 3, 4] },
    "viva": { "prompt": "Why is PPE the last option?", "answer": "PPE does not remove the hazard. It only protects the person, and it fails if not worn." }
  },
  "appears_in": [{ "cblm": 3, "page": 10 }, { "cblm": 3, "page": 16 }]
}
```

Check the exact wording against the CBLM during authoring (e.g. whether "Isolation" and its descriptions are stated as above). Mismatches go to `[CHECK]`.

## FEATURES (build in this order, MVP first)

### MVP (Phase 2)

- **Dashboard:** progress per CBLM and per question type, weak topics, and a "most likely in exam" (★★★) shortlist with each item's Bangla "why important" reason. It links to the **Study Priority Guide** page (Top 30, Top 10 per CBLM, and the 3/7/15-day plan).
- **CBLM view:** its concepts, highlighted items shown with a yellow mark, a "must-read" filter.
- **Concept page:** the card above, with a language toggle (Bangla explanation on/off). Large readable type, mobile-first, works offline once loaded.
- **Search:** by English term or Bangla word. Shows matching concepts across all CBLMs.
- **Practice mode:**
  - short questions: self-check against key points
  - MCQ
  - matching: drag or tap to pair
  - viva: flip card, question first, then model answer

  Instant feedback with the exam-style model answer.
- **Revision:** spaced repetition with simple Leitner boxes (1 day, 3 days, 7 days) for concepts the learner missed.
- **Mock exam:** a timed paper that mirrors the real pattern (counts per type from PATTERN_ANALYSIS, e.g. 10 MCQ / 1 matching × 5 / 10 short + optional viva round). Score by type and list weak concepts.

Reuse the existing components, `TopNav`, the dashboard and `/review` where they fit. Add a "CBT&A L4" entry to the nav.

### Phase 3 (after the MVP is approved)

- A one-page printable cheat sheet per CBLM, plus one master sheet of ★★★ concepts (PDF / print CSS).
- Bookmarks and notes per concept.
- An admin screen to edit concepts and questions without code, with a change history. This app has no backend, so propose the approach in PLAN.md (e.g. edit → export JSON → git commit) before building it.

## DATA MODEL (adapt names to the existing conventions)

```
Cblm(id, number, title, source_file|null)
Topic(id, cblm_id, title)
Concept(id, canonical_title, priority, stars, one_line_answer, keywords_json, bangla_explanation,
        example, mnemonic, list_answer_json, traps_json, source_type[cblm|question-paper-only])
ConceptSource(concept_id, cblm_id, page)
Highlight(id, cblm_id, page, colour, annot_type, text, concept_id)
Question(id, concept_id, type[short|mcq|matching|viva], prompt, options_json, answer, marks, pattern_tag, source)
Attempt(user_id, question_id, correct, answered_at)        → localStorage
Progress(user_id, concept_id, box, next_review_at)        → localStorage
```

Content is generated into versioned JSON in git, and the app reads it. Extend `src/lib/storage.ts` without breaking `wdp3_store_v1` (add fields with defaults or a versioned migration). Single local user, so `user_id` can be a constant. **The app must not call an AI model at runtime in the MVP.**

## UX RULES

- One concept = one screen. No wall of text. Use cards, bold key words and short lines.
- Highlighted items always carry the same yellow badge across the whole app.
- The Bangla font must render correctly on Android, iOS and desktop. Embed Noto Sans Bengali via `next/font` (check the Next 16 docs).
- Accessibility: AA contrast, keyboard navigation, tap targets of at least 44px.
- Fast: first content paint under 2 seconds on a mid-range phone over slow 3G. Prefer static generation for content pages.
- Match the existing app's visual style and dark mode.

## QUALITY GATES (do not skip)

- **Coverage:** COVERAGE_REPORT shows 0 uncovered highlights, and raw annotation counts match the table above.
- **Fidelity:** every one-line answer and every list matches the CBLM text (count and wording). Add an automated check that compares list lengths to the source.
- **Readability:** an automated check that English card sentences are under 15 words.
- **Tests:** unit tests for the parser, dedupe, priority formula, spaced repetition and mock-exam builder, plus one end-to-end test of the practice flow.
- Every `[CHECK]` item, including the CBLM answer-key errors, is collected in `/docs/plan/REVIEW_QUEUE.md` for me to confirm.
- Run the linter, the type check (`tsc --noEmit`), the tests and `next build`. All must be green before you report done.
- Do not touch unrelated files. Do not add heavy dependencies without justification in PLAN.md.

## WORKFLOW AND COMMUNICATION

- Work in phases: 0 Discovery, 1 Content pipeline, 2 MVP features, 3 Extras. After each phase, stop and give me: what changed, how to run and check it, what is left, and any `[CHECK]` items.
- In Phase 1, author one high-weight CBLM fully (suggest CBLM 11 or 12) and stop for my review of the card quality before you author the rest.
- Commit in small steps with clear messages on a feature branch (`feat/cbta-l4`). Never push to main.
- Be honest: if something in `/docs` is unclear, missing or contradictory (e.g. CBLMs that disagree on a count, wrong answer keys, the missing CBLM 4), report it instead of choosing silently.
- Final report: files added, commands to run, how to add a new CBLM later (one command, e.g. when the CBLM 4 PDF arrives), and known limits.

## START NOW

Begin with Phase 0. Do not write feature code until I approve PLAN.md.
