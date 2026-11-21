# 16. Typography and layout craft

Typography carries the personality of the page. Layout decides what is read first. Both are
choices, not settings.

## Typefaces

- **One family or two.** If two, make them clearly different (a serif with a sans, a grotesque
  with a humanist), each with one job. Two similar sans faces look like a mistake.
- **Choose deliberately.** Not the family you would reach for on any project. The face should fit
  the subject's vernacular (14). Check that it covers every script and numeral system you need (09).
- **Use type as an active part of the design** when it is a headline or visual element: size
  contrast, weight, width, tight or open tracking, a deliberate crop or break. It is not just a
  neutral delivery vehicle.
- Each family and weight costs download size. Bundle only the weights used; subset; `font-display:
  swap` with a system fallback.

## Pairing by register (starting points, not answers)

Pick the register from the subject, then choose and test a face. These are places to start
looking; a choice copied from a list is a default (15), so check each against the brief, its
scripts and its weight budget, and say why it fits.

| Register | Direction | Faces worth trying |
|---|---|---|
| Precise, institutional (finance, legal, health) | A sober grotesque or neo-grotesque; tabular figures; one weight for emphasis | IBM Plex Sans, Source Sans 3, Public Sans, Instrument Sans |
| Warm, human (education, care, community) | A humanist sans, open apertures, friendly but not rounded for long reading | Atkinson Hyperlegible, Nunito Sans, Figtree, Lexend |
| Editorial, considered (publishing, culture, long reads) | A text serif for body or display, paired with a plain sans for UI | Source Serif 4, Literata, Fraunces (display), Newsreader |
| Technical, engineered (developer tools, data) | A geometric or grotesque sans with a monospace used only for real code | Geist + Geist Mono, JetBrains Mono for code, Space Grotesk |
| Expressive, loud (fashion, music, events, games) | A display face with character used large and sparingly; a quiet text face below | Bricolage Grotesque, Syne, Unbounded, Archivo (widths) |
| Playful, young (kids, casual games) | Rounded or soft forms for display only; a readable body face | Baloo 2, Fredoka (display), Quicksand for short labels only |
| Multi-script products | A superfamily that covers every script the product ships | Noto Sans / Serif families, IBM Plex (Arabic, Devanagari, Thai), Inter for Latin |

Before committing: check script and numeral coverage (09), the size of the weights you need, the
licence, and how the digits look in a timer or price. On native apps the system font (SF Pro,
Roboto, Segoe UI) is often the right body face; spend the identity on one display face.

## A type scale (in the spirit of *The Elements of Typographic Style*)

- Pick a ratio and derive the sizes from it rather than picking numbers one by one: 1.2 (minor
  third) for dense apps, 1.25 (major third) for most products, 1.333–1.5 for editorial and
  marketing.
- 6–8 roles are enough (04 lists them). Display sizes can break the ratio once, on purpose.
- **Weights:** two or three, with clear jobs (for example 400 body, 600 emphasis, 700 display).
- **Tracking:** tighten large display type slightly; open small all-caps (if used at all) slightly;
  leave body text alone.
- **Measure (line length):** 45–75 characters for body text, never over 80. Serif body can run a
  little longer than sans.
- **Leading (line height):** 1.5–1.7 for body; serif body gets a little more than sans; complex
  scripts 1.6–1.7 (09); display 1.05–1.3.
- **Mobile:** body text at least 16 px; captions never under 12 px.
- **Numbers:** tabular figures for tables, timers and scores (with a fixed-width box where the
  script's font has none, see 03).

## Layout

- **Write the layout as one sentence first**, then an ASCII wireframe. "A narrow reading column with
  the sample question pulled into the margin" is a decision; "hero, features, testimonials, CTA" is a
  template.
- **Alignment:** left-align reading text in left-to-right scripts. Centre only short, isolated
  lines (a one-line headline, an empty state). Justify only with good hyphenation and a long
  measure; never on narrow mobile columns.
- **Grid:** pick a column grid and a spacing scale (04) and keep to them. Break the grid once, on
  purpose, for the one bold move.
- **Hierarchy by contrast of size, weight and space**, not by adding boxes. Space separates groups
  better than borders.
- **Radius has hierarchy:** containers, controls and pills can differ. Nested radius = outer radius
  − padding. One radius on everything is a tell (15).
- **Check widths:** 375, 768, 1024 and 1440 px, plus phone landscape (whatever the project's own
  breakpoints are; 06 suggests 600 and 1024). No horizontal page scroll
  at any width. Never disable zoom in the viewport meta.

## CSS specificity traps

Generated CSS often contains classes that cancel each other out.

- **Do not name a section wrapper after its content type** when the content inside uses the same
  word. A band with class `facts` and a list inside with class `facts` share every rule, so the
  list's `padding: 0` and grid hit the band. Use an attribute for the band
  (`section[data-section="facts"]`) and keep classes for components.
- **Spacing between sections belongs to one owner.** Either the layout (a `gap` or
  `* + *` rule on the parent) or the section, never both. Two owners give doubled or cancelled
  margins that differ by page.
- Keep selectors flat (one class) and avoid mixing element selectors (`section`, `h2`) with
  component classes at the same level. Prefer `:where()` for base styles so components can override
  them without a specificity fight.
- Check the result in the browser's computed styles, not the source, when spacing looks wrong.
