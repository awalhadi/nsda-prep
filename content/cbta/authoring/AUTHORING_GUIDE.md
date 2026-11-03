# Authoring Guide: CBT&A L4 Concept Cards

For agents and people writing `content/cbta/concepts/cblmNN/<id>.json`.

## Who reads the card

A Bangladeshi TVET trainer candidate. They think in Bangla, know few English words, and must **write exam answers in English** that satisfy an assessor. They read each card **once** and must remember it.

## Hard rules

1. **Use only the evidence pack** (`content/cbta/.cache/packs/<id>.md`, made with `npm run content:packs`). Add no facts that are not in the CBLM text or the question papers. If you are unsure, add an item to `checks[]` (it becomes `[CHECK]` for a human) instead of guessing.
2. **Every factual field is a Claim** with at least one cite `{ src, page, quote }`:
   - `page` is the **PDF page** shown in the pack.
   - `quote` is copied **word-for-word** from that page's text. Copy it from the "Full page text" block, because tables are extracted cell by cell and a quote must be contiguous in that text. Keep quotes short (one phrase or sentence).
   - Use `fidelity: "verbatim"` only when `text` is exactly the CBLM wording. Otherwise use `"paraphrase"`, and its content words must appear in the quotes (support ≥ 0.7).
3. **Every English sentence is under 15 words.** Use plain words, active voice, no idioms.
4. **Lists** (`list_answer`) contain every item, in CBLM order, with the CBLM's count. If the source states a count ("four dimensions"), the build checks it.
5. **Bangla** is natural spoken Bangla in Bangla script. Technical terms stay in English (`RPL`, `evidence`), but every English word used in a Bangla line must also appear in the card's claims or keywords (term guard).
6. **`covers`** lists every passage id from the pack's "Highlighted passages to cover". **`questions`** lists every question id from the pack.
7. **Answer-key errors:** if a CBLM answer key contradicts its own information sheet, don't copy it. Write the information-sheet version and add a `checks[]` note naming the question id.
8. Never edit `content/cbta/review/*` or run `content:approve`. Approval is for humans only.

## The card, in fixed order

| Field | What to write |
|---|---|
| `canonical_title`, `aliases` | Exam wording of the concept; other names used in the CBLMs |
| `one_line_answer` | The sentence a learner writes for "Define X" or "What is X?". Use CBLM wording where it is the official definition. |
| `keywords` (3–6) | `{ en, bn }`: the English term and its Bangla meaning |
| `bangla_explanation` (3–5 lines) | Short spoken Bangla. Say **why it matters**, not only what it is. |
| `example` | `{ en, bn? }`: one concrete Bangladeshi workplace (garments, workshop, IT training centre, hospital, driving test). One example only. |
| `mnemonic` (optional) | Only when it really helps, e.g. first letters of a list |
| `list_answer` (when the concept is a list) | `title`: what the list is, in exam wording ("Characteristics of competency-based assessment"). `title_bn`: the same name in Bangla. `items`: numbered, exactly as the CBLM states them. `items_bn`: **one Bangla line per item** (see "Lists a learner understands" below) |
| `traps` (≥1) | Common mix-ups (direct vs indirect, halo vs horn, 5 vs 6 rules) |
| `practice.short` | Exam-style prompt, a model answer (key word or definition first, then numbered points, 40–80 words), and key points as Claims |
| `practice.mcq` | 4 distinct options, one correct, with `answerCite` supporting the correct option. Distractors are plausible CBLM terms. |
| `practice.matching` | 3–6 pairs, each with a cite |
| `practice.viva` | One spoken question; the answer is 1–2 short sentences, as a Claim |

## Gold standard

`content/cbta/concepts/cblm03/hierarchy-of-controls.json`. Match its tone, density and citation style.

## One CBLM at a time, and never twice for the same topic

Topics repeat across CBLMs. Before creating a card, look at the existing cards (`src/data/cbta/generated/index.json`, the titles and aliases) and read the closest ones.

- **Same topic already has a card** (e.g. rules of evidence in CBLM 11 and CBLM 12): do **not** create a new card. Add an entry to `content/cbta/authoring/links/cblmNN.json`:
  ```json
  { "links": [ { "concept": "rules-of-evidence", "passages": ["cblm11-p21-…"], "questions": ["cblm11-sc2-q3"], "note": "Same rules of evidence; CBLM 11 p.21 lists the same four." } ] }
  ```
  The passage then counts as covered, and the card shows the extra CBLM in its sources. A link only says "the same topic". If this CBLM adds a genuinely new fact, write it as a `checks[]` note in your report instead of editing another CBLM's card.
- **New topic:** list it in `content/cbta/authoring/maps/cblmNN.json` (`{ "concepts": [ { id, title, cblmPrimary, covers, questions } ] }`), run `npm run content:packs -- <id>`, and write the card in `content/cbta/concepts/cblmNN/`.
- Only edit files for your own CBLM: `maps/cblmNN.json`, `links/cblmNN.json`, `concepts/cblmNN/*`.
- Done means: `npm run -s content:coverage -- cblmNN` shows ✓ (every passage and every Self Check question covered), and `npm run -s content:verify -- <files>` shows 0 errors.

## Verify before handing over

```
npm run -s content:verify -- content/cbta/concepts/cblmNN/<id>.json
npm run -s content:coverage -- cblmNN
```

Fix every `[error]`. Treat a `[warn]` as a sign the claim drifts from the source; reword it closer to the quote.

## Study guide (one per CBLM)

A study guide walks one CBLM **in source order**, so a learner can read the whole module like a book. It complements the cards; it does not replace them. Schema: `Guide` in `src/lib/cbta/schema.ts`. File: `content/cbta/guides/cblmNN.json`. Page: `/cbta/cblm/NN/guide`.

### Outline first: "no topic missed" is checked
1. Write `content/cbta/authoring/outline/cblmNN.json`: `{ "cblm": NN, "items": [ { "id", "page", "title" } ] }`. Add **one item per heading, sub-heading, list, table, diagram, form/template, Job, Activity and Specification sheet, LO/PC page and Review of Competency** of the PDF, in page order. Self Check questions don't need items; the build already requires every one.
2. Every guide block that explains an item lists it in `outline: ["<id>"]`. `content:coverage -- cblmNN` fails while any item is unexplained.

### Structure
- `sections[]` in CBLM order. Each has a `kind`: `overview` (about the module, LOs, PCs), `info` (one per Information Sheet), `practical` (Jobs, Activities, Specification sheets) or `review` (Review of Competency).
- Blocks:
  - `qa`: the exam Q block. Fields: `q`, `q_bn` (Bangla meaning), `answer` (a Claim), `example`, `tip`/`tip_bn` and `concept` (a card id).
  - `list`: every item in CBLM order.
  - `table`: a cell is plain text only for labels; any fact is a Claim.
  - `steps`: a flow diagram; set `cycle` for a cycle and give `labels_bn` one label per step.
  - `compare`: two sides, "X vs Y".
  - `form`: a mock-up of a CBLM form or template. Every label must be copied from the cited page(s); the build warns when a label's words are not there.
  - `text`: claims plus Bangla lines.
  - `note`: `caution` needs a claim (e.g. two CBLMs disagree, or an answer key is shorter than the info sheet); `tip` is pedagogy.
  - `concepts`: links to cards.
- `selfChecks[]`: **all** Self Check questions of the CBLM, each with `q_bn`, a short `modelAnswer` ("Write like this", info-sheet version when the key is shorter or wrong) and `keyPoints` as Claims.
- `practice`: ≥10 MCQs (4 options, `answerCite`), one matching set (6–10 pairs) and ≥10 viva items. Mark `concept` on each MCQ when it tests one card.
- `revision`: the last-minute sheet. Each row is a topic and a one-line Claim.

### Rules
- Same trust rules as cards. Every fact is a Claim citing the PDF page with a word-for-word quote. Sentences stay under 15 words. Bangla goes in `*_bn`/`bn` fields only.
- Visualise wherever the CBLM has a sequence, a contrast, a table or a form. Prefer `steps`/`compare`/`table` over long prose.
- When a card is missing or incomplete for a topic, fix the card (see above). The guide then links to it with `concept`.
- `npm run -s content:verify -- content/cbta/guides/cblmNN.json` must show 0 errors, and `npm run -s content:coverage -- cblmNN` must show ✓ for the highlights and for the guide outline.

## Lists a learner understands

A learner must never meet a bare list. The build rejects any list (card `list_answer`, guide `list`, any `steps` flow) that lacks the following:
- **A name** (`title`, plus `title_bn` for lists) that answers "what is this a list of?" Use the exam wording: "Characteristics of …", "Stages of …", "Purposes of …", "Rules of evidence", "Ways to …".
- **One Bangla line per item** (`items_bn` for lists, `labels_bn` for steps), in the same order. Each line gives the meaning first, then why or how, in simple spoken Bangla.
  - One sentence, two at most.
  - Technical terms stay in English, and only terms that already appear in the card.
  - These lines are pedagogy: they explain the item and add no new facts, numbers or examples from outside the CBLM.

Example: the characteristics of competency-based assessment.

| Item (CBLM English) | `items_bn` |
|---|---|
| It is evidence based. | প্রমাণভিত্তিক — candidate-এর কাজের প্রমাণ দেখেই সিদ্ধান্ত হয়, অনুমানে নয়। |
| It is criterion referenced. | মানদণ্ড-ভিত্তিক — অন্যের সাথে নয়, performance criteria-র সাথে তুলনা করা হয়। |
| Evidence of competency may be collected over a period of time. | প্রমাণ একদিনে নয়, কিছু সময় ধরে সংগ্রহ করা যায়। |
