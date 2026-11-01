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
| `list_answer` (when the concept is a list) | Numbered items exactly as the CBLM states them |
| `traps` (≥1) | Common mix-ups (direct vs indirect, halo vs horn, 5 vs 6 rules) |
| `practice.short` | Exam-style prompt, a model answer (key word or definition first, then numbered points, 40–80 words), and key points as Claims |
| `practice.mcq` | 4 distinct options, one correct, with `answerCite` supporting the correct option. Distractors are plausible CBLM terms. |
| `practice.matching` | 3–6 pairs, each with a cite |
| `practice.viva` | One spoken question; the answer is 1–2 short sentences, as a Claim |

## Gold standard

`content/cbta/concepts/cblm03/hierarchy-of-controls.json`. Match its tone, density and citation style.

## Verify before handing over

```
node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/content/verify.ts content/cbta/concepts/cblm12/<id>.json
```

Fix every `[error]`. Treat a `[warn]` as a sign the claim drifts from the source; reword it closer to the quote.
