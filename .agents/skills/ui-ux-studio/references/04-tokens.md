# 04. Design tokens

Tokens are the single source of truth for every visual value. One file generates CSS variables,
Dart/Kotlin/Swift constants and documentation. Screens use only tokens, and a lint rule fails on
raw colours and sizes.

Why: consistency, working dark mode, a contrast check you can automate, and one place to change
the brand.

## Architecture

- **Semantic names, not paint names.** `color.text.muted`, not `gray-600`. A semantic name says
  where it may be used, so misuse is visible in code review.
- **Each colour has a light and a dark value.** Dark mode is not inverted light mode; tune each.
- **A `pairs` list declares every foreground and background combination in use**, with its kind:
  `text` (needs 4.5:1), `ui` (icons, focus rings, essential edges, 3:1) or `decorative` (unchecked,
  never carries meaning alone).
- **The build checks contrast** for every pair in both themes and fails under the minimum.
  `scripts/contrast.mjs` does this; `assets/tokens.template.json` shows the schema.

## Colour roles

| Role | Purpose | Rules |
|---|---|---|
| `bg` | App background | Light mode: a warm or neutral off-white reduces glare; check the hue |
| `surface` | Cards, sheets | If close to `bg` (under ~1.1:1), always add `border` + `elevation.1` in light mode |
| `border` | Card edges | Decorative unless it is the only edge of an input; inputs need 3:1 |
| `text`, `text-muted` | Main and secondary text | Both at 4.5:1 or more on `bg` and `surface`; aim for 7:1 for main text |
| `primary`, `on-primary` | Brand, the primary button, links | Text on primary at 4.5:1 or more |
| `danger`, `warning`, `success` | Status text | Dark, tested shades; never the vivid fill shades |
| `signal-*` | Vivid dots, fills, charts | **Never text.** Always next to an icon and a word |
| `chip-*-bg` | Tinted chip and badge backgrounds | Pair with the matching status text; check both themes |
| `focus-ring` | Keyboard focus | 3:1 against what it sits on |

Pattern for status colours: a **vivid fill** for dots and bars (e.g. #F59E0B), a **dark text
shade** for words (e.g. #92400E on light), and a **light chip background** (e.g. #FEF3C7).

## Typography

A scale of 6 to 8 roles is enough. Example:

| Token | Mobile | Web | Weight | Line height | Use |
|---|---|---|---|---|---|
| `display` | 28 | 32 | 700 | 1.3 | Scores, hero numbers |
| `h1` | 22 | 26 | 700 | 1.35 | Screen titles |
| `h2` | 18 | 20 | 600 | 1.4 | Card titles |
| `body-lg` | 18–19 | 18–20 | 400–500 | 1.6–1.7 | Reading content (questions, articles) |
| `body` | 16 | 17 | 400 | 1.6–1.7 | Default text |
| `caption` | 13 | 13 | 400 | 1.5 | Meta and tags (never under 12) |
| `digits` | per use | per use | 600 | 1.0 | Timers, scores, in fixed-width boxes |

- Complex scripts (Bangla, Devanagari, Thai, Arabic) need larger line heights (1.6–1.7) for
  stacked marks. See `09-localization.md`.
- One family per script. Bundle only the weights used, subset where possible, and use
  `font-display: swap` with a system fallback on the web.
- Support user scaling from 90% to 150% in the app and system scaling to 200% without clipping.

## Spacing, shape, elevation, motion

| Token | Recommended values | Notes |
|---|---|---|
| `space` | 4, 8, 12, 16, 24, 32, 48 | A 4-point base. Fewer steps means more consistency |
| `radius` | 8 inputs, 12 cards, 16 sheets, full for pills | Nested radius = outer − padding |
| `touch.min` | 48 dp Android, 44 pt iOS, 44 px web | Hit area can be larger than the visual |
| `elevation.1` | `0 1px 2px rgba(15,23,42,.06), 0 1px 3px rgba(15,23,42,.08)` | Light mode only; dark mode uses lighter surfaces instead of shadows |
| `motion.*` | see the motion table below | Durations, easing and springs are tokens like colours |
| `layout` | breakpoints 600 and 1024; sidebar 240 (64 collapsed) | Under 600 uses the mobile layout |

## Motion tokens

Motion is part of the system, not a per-screen choice. The rules behind these values are in
`10-motion-system.md`; code for each stack is in `11-motion-recipes.md`. In CSS they become
`--motion-duration-fast`, `--motion-ease-out` and so on.

| Token | Value | Use |
|---|---|---|
| `motion.duration.press` | 100 ms | Pressed and hover feedback starts within this |
| `motion.duration.fast` | 120 ms | Toggles, fades, tooltips, chips |
| `motion.duration.base` | 200 ms | Menus, popovers, sheets, dialogs |
| `motion.duration.slow` | 300 ms | Route transitions, shared elements, large surfaces |
| `motion.duration.emphasis` | 400–600 ms | The one orchestrated moment; count-ups (max 600 ms) |
| exits | about 65% of the enter | 80 / 130 / 200 ms |
| `motion.ease.out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entering, responding to input |
| `motion.ease.in` | `cubic-bezier(0.7, 0, 0.84, 0)` | Leaving |
| `motion.ease.inOut` | `cubic-bezier(0.65, 0, 0.35, 1)` | Moving between two on-screen positions |
| `motion.spring.ui` | duration 0.35 s, bounce 0 | Layout changes, drag release |
| `motion.spring.gentle` / `.playful` | 0.45 s bounce 0.15 / 0.5 s bounce 0.3 | Sheets settling / playful brands only |
| `motion.stagger` | 30–50 ms, about 6 items at most | Short lists only |
| `motion.distance` | 4–8 px nudge, 12–16 px reveal, max 24 px | Entrance offsets |
| `motion.reduced` | fade at `duration.fast`, or none | No sliding, scaling, parallax, pulsing, shimmer or confetti |

The motion dial (14) chooses how much of this a product uses, not different values: at motion 1–2
only press, state and overlay motion appear; at 3–5 one orchestrated moment is added; at 6+ shared
elements and scroll-linked moments are allowed where the stakes are low.

## Density

The density dial (14) changes the spacing steps, not the type size:

| Density | Spacing steps | Typical use |
|---|---|---|
| Spacious (1–3) | 8, 16, 24, 32, 48, 64, 96 | Marketing, onboarding |
| Standard (4–6) | 4, 8, 12, 16, 24, 32, 48 | Most apps |
| Dense (7–10) | 4, 8, 12, 16, 20, 24, 32 | Consoles, tables, analyst tools; body text stays ≥ 14 px on desktop |

## Adding a token

A new colour, size, duration or component needs a design-system change first: add it to the tokens file,
declare its pairs, run the contrast check, regenerate, document its use. Never add it in a screen.
