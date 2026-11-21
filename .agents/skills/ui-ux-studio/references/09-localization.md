# 09. Localisation and non-Latin scripts

Bangla is the worked case here; the same thinking applies to Devanagari, Tamil, Thai, Arabic
(RTL), Burmese and CJK.

## Fonts

- One family per script, chosen for long reading (for Bangla: Noto Sans Bengali, variable). A
  rounded display face is poor for long text. Add a second family only if both the size budget
  and a usability test support it.
- Pair a Latin family (for example Inter) for mixed text. Put the local script first in the stack.
- Subset and ship only the weights in use. Each extra family costs app size and page weight.

## Rendering

- Test conjuncts and stacked marks on the oldest supported Android, on the web and in generated
  PDFs (Bangla: ক্ষ, ঙ্গ, ন্ত্র, র‍্য). Broken conjuncts make text unreadable and look unprofessional.
- Use larger line heights (1.6–1.7) for body and question text; marks above and below need room.
- Do not truncate words mid-glyph; allow wrapping. Buttons grow in height rather than cutting text.

## Numbers

- Use the local numerals in local-language UI (Bengali ০–৯), and **one numeral system per screen**.
- Many fonts have no tabular figures for local digits. For timers, scores and ranks, render each
  digit in a fixed-width box so nothing shifts as values change. Test it.
- Format dates, currency (৳) and thousands separators by locale (the South Asian lakh grouping
  1,00,000 where users expect it).

## Copy

- Write in the local language first, then translate to English, not the other way round.
- Use the respectful form of address the audience expects (Bangla: আপনি).
- Keep English only for terms users actually use (Pro, Heatmap).
- Expect text expansion: German +30%; scripts like Bangla often need more height rather than width.
- Keep strings in catalogs with keys, never in code. Lint the catalogs for banned claims.

## RTL (Arabic, Urdu, Hebrew)

- Mirror the layout, navigation and directional icons (back arrows), not media controls or clocks.
- Use logical properties (`margin-inline-start`, `padding-inline`, `inset-inline-end`) instead of
  left and right, and `dir="rtl"` on the root.
- Mirror motion too: forward navigation slides from the left in RTL; progress fills right to left.
- Charts: time axes usually stay left to right; check with native readers.
- Before choosing a visual style, ask how well it mirrors: **full** (needs no directional rework),
  **partial** (mirrors, but icons, carousels, motion paths and charts need per-component checks) or
  **caveats** (the style encodes reading direction, for example a left-to-right timeline as the hero).
  Say so before recommending a caveats style for an RTL product, and offer a mirrorable alternative.
- Mixed-direction text (an English product name inside Arabic) needs bidi isolation (`<bdi>`,
  `unicode-bidi: isolate`).
