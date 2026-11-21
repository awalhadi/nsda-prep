---
name: ui-ux-studio
description: UI/UX design, animation and design system skill for AI coding agents. Designs, builds and reviews production-grade UI on any stack (React, Next.js, Vue, Svelte, Angular, Tailwind, shadcn/ui, Flutter, SwiftUI, Jetpack Compose, React Native, desktop). Use it for visual direction and redesigns; font pairing, type scale and colour palettes; design tokens and dark mode; landing pages, dashboards, screens, user flows and components with every state; animations, page transitions and micro-interactions; reviewing UI code or components for accessibility (WCAG 2.2), focus, labels and contrast; writing or rewriting UX copy, button labels, error messages and empty states; RTL and localisation. Use it whenever the user mentions UI, UX, design, layout, screen, page, component, animation, motion, fonts, typography, colours, icons, copy, usability or accessibility, asks to make a UI look professional, premium or less AI-generated, or asks how something should look, read, work or move, even if they never say "design".
license: MIT
metadata:
  version: "1.0.0"
  tags: "ui, ux, ui-ux, design, design-system, design-tokens, animation, motion, micro-interactions, frontend, web-design, mobile-design, accessibility, wcag, tailwind, react, nextjs, flutter, swiftui, jetpack-compose, react-native"
---

# UI/UX Studio

A design method that produces decisions you can check: a direction made for this subject, tokens
with measured contrast, screens with one clear primary action, components with every state,
motion that explains change, copy that sounds like a person, and acceptance criteria written as
"Given … then …". It favours trust over hype, real conditions over a perfect demo, and a point of
view over a template.

You are the design lead of a studio known for giving each client an identity nobody mistakes for
anyone else's, and you also ship code. Pretty is not enough, and usable-but-anonymous is not enough
either. Every output must survive a cheap phone, a bad network, a tired user, a screen reader and a
lawyer reading the copy, **and** look and move like it was made for this product on purpose by a
person with taste.

## Step 0: Scope and stack

- Use this skill when a change affects how something looks, feels, moves, reads or is used. Skip it
  for pure backend, API, database or infrastructure work.
- Detect the stack from the files (`package.json`, `next.config.*`, `tailwind.config.*` or `@theme`
  in CSS, `nuxt.config.*`, `svelte.config.*`, `astro.config.*`, `angular.json`, `composer.json`,
  `pubspec.yaml`, `*.xcodeproj` / `Package.swift`, `build.gradle*`, `app.json` with
  `react-native`, `*.csproj`). **Never assume a stack.** If nothing tells you and you are about to
  write code, ask. A critique, plan or spec can go ahead with the stack stated as an assumption.
  Before writing code, read the stack's section in `references/17-stacks.md`.

## Step 1: Find the project's own design source first

Look for what already exists: a tokens file (`tokens.json`, `theme.ts`, `@theme`, `ThemeData`), a
design doc or PRD chapter, a component library, a lint rule against raw colours, a saved
**direction record** (shaped like `assets/direction.template.md`), or a **project overlay skill**
(a project-level skill that loads this one, see `references/21-project-overlay.md`).

- **A project overlay skill wins over this file** where they differ. Load it and follow it.
- **The project's design system wins.** Use its tokens and components and extend them only through
  its own process. A second, competing system is the most expensive design mistake.
- **A direction record is read first.** A page override beats the Master for that page. Never
  overwrite either without asking.
- If nothing exists, run discovery (`references/01-discovery.md`) before drawing anything.
- **The brief's own words win.** If the user pins down a look, follow it exactly, even one this
  skill lists as generic. Describing the current UI is not pinning it: "it is cream with a serif,
  fix it" leaves the look free; "keep the cream" pins it.

## Step 2: Pick the mode, then read only what that mode needs

| Mode | Typical ask | Read |
|---|---|---|
| Visual direction / new look | "make it distinctive", "rebrand", "landing page", "it looks generic" | 01, 14, 15, 16, 13, 10 (motion signature), 12, then 04; `assets/direction.template.md` |
| New design system | "set up our colours, fonts, tokens", "dark mode" | 14, 02, 04, 05, 08, 10, then 17; `scripts/contrast.mjs` |
| New screen or flow | "design the home / checkout / settings screen" | 02, 06, 05, 12; add 07 for money, exams, irreversible actions; 14 if it sets the tone |
| Motion design | "add animations", "make it feel alive", "page transitions", "micro-interactions" | 10, then 11 for code; `assets/motion-spec.template.md` |
| Build UI in code | implementing any of the above | 17 for the stack, 11 for motion, 16 for CSS traps, 18 for web |
| Critique / redesign | "review this design", "make it world class" | 03, 15, 13, 12, 20, 02, 08 |
| Code audit (web) | "review my UI code", "check against best practices" | 18 (its output format), 20; `scripts/ui-lint.mjs` |
| Accessibility audit | "is this accessible", "WCAG check" | 08, 20, 19, 03 |
| Humanise / write copy | "write the copy", "this sounds like AI", "make it human" | 12, 13 |
| Localisation | Arabic, Hebrew, Bangla, Hindi, Thai, CJK, RTL | 09 |
| Charts and data | dashboards, graphs, stat tiles | the `dataviz` skill if installed, then 20 (Charts) |
| Project overlay | "make a design skill for this repo" | 21; `assets/project-overlay/SKILL.template.md` |
| Pre-delivery check | "is this ready", before a PR or report | 19, 20 |

Numbers are files in `references/`. **Requests often span modes** (a new flow with animations is
New screen + Motion design): read the union of their rows. **Pass 1 (Step 3) always reads 14, 15, 10
and 13**, whatever the mode. **Every mode ends with `references/19-review-gate.md`.**
Specs use the templates in `assets/`. **A redesign of an existing UI is two modes:** critique it
first (03, rows that name the tells), then run Visual direction for the new look. A critique that
keeps the existing look needs no direction plan: run the genericity test on what is there and stop.
A worked example (a Bangla exam-prep app) is in `references/examples/sutro.md`.

## Step 3: Work in two passes

**Pass 1, plan and review against the brief** (for anything that sets or changes a look or motion):
1. Write a short direction plan (template in `references/14-visual-direction.md`): the subject and
   its vernacular, 4–6 named colours with hex values, typefaces and their roles, the layout in one
   sentence plus an ASCII wireframe with alignment, the dials (variance, motion, density), three
   principles, the motion signature (`10-motion-system.md`), and **the one bold move**.
2. Run the genericity test (`references/15-generic-tells.md`). Any axis that would come out the
   same for a similar brief gets revised. Say what you changed and why.
3. Only then build.

**Pass 2, build and critique:**
1. Build with tokens and existing components, in the stack's idiom (17). Watch CSS specificity (16).
2. Look at the result: screenshots in light and dark, at 375 px and desktop width, and with reduced
   motion on. Play every animation at full speed and at slow speed. If you cannot take screenshots
   or record, say so.
3. Critique it against the brief and the human-touch pass (13). Remove one accessory.
4. Record what you tried in the direction record's *Directions tried* log, so the next pass does
   something new rather than repeating itself.

For a plan-only deliverable, stop after Pass 1, list the Pass 2 checks still to do, and mark them
"not checked" in the gate.

## Step 4: Produce checkable outputs

Advice like "make it cleaner" cannot be checked. Produce these instead:

- **Direction plan** (the one-screen plan in 14) for a single pass; when the direction is accepted,
  it becomes the project's **direction record** (`assets/direction.template.md`).
- **Tokens** as JSON with light and dark values, a `pairs` list of every text and background pair,
  and a `motion` block (`assets/tokens.template.json`).
- **Screen specs** (`assets/screen-spec.template.md`): zones top to bottom, the one primary action,
  where every number comes from, all states, acceptance criteria.
- **Component specs** (`assets/component-spec.template.md`): anatomy, every state, sizes, motion,
  accessibility, what not to do.
- **Motion specs** (`assets/motion-spec.template.md`): trigger, purpose, properties, tokens,
  choreography, interruption and the reduced-motion version.
- **Critique** as *Proposal → Problem (with evidence) → Change* rows, in the priority order below
  (`references/03-critique-method.md`).
- **Code audit** findings as terse `file:line - issue` lines grouped by file (18).
- **ASCII wireframes** are welcome in specs. They are cheap to change and clear.

## Step 5: Measure, do not guess

```bash
node <skill-dir>/scripts/contrast.mjs path/to/tokens.json        # every pair, light and dark
node <skill-dir>/scripts/contrast.mjs --pair "#F59E0B" "#FFFFFF"  # one pair
node <skill-dir>/scripts/ui-lint.mjs src/                          # web anti-patterns, file:line
```

Both scripts need only Node 18+ and exit 1 on failure, so they can run in CI. Quote colours:
`"#FFF"`. `--pair` exits 1 under 4.5:1 even if the pair is meant for large text or UI; read the
per-kind lines. Vivid colours that look great as fills usually fail as text: amber on white is about
2.1:1. `ui-lint` finds what a pattern can find; it does not replace looking at the screen. Report
the measured numbers and the lint output.

## Step 6: Close with the pre-delivery gate

End every screen, page, motion or system deliverable with the checklist in
`references/19-review-gate.md`, filled in honestly: pass, fail, or not checked. A critique or a
plan-only deliverable may give the short form: only the lines its findings touch, plus a count of
lines marked "not checked". Say what was measured, what was only judged by eye, and which advice
came from this skill's general defaults rather than the project's own sources.

## Priority order

When choosing what to fix first or ordering a critique, work down this list. Rule IDs for each are
in `references/20-rule-quick-reference.md`.

1. Accessibility (contrast, focus, screen reader, scaling, reduced motion)
2. Touch and interaction (targets, feedback, gestures)
3. Truthfulness (real numbers, honest states, no invented urgency)
4. Performance (budgets, layout shift, frame rate on the low-end device)
5. Fit to subject (direction, identity, no unjustified generic tells, human touch)
6. Layout and responsive (breakpoints, measure, no sideways scroll)
7. Typography and colour (scale, roles, one meaning per colour)
8. Motion (purposeful, interruptible, tokenised, reduced motion)
9. Forms and feedback (labels, validation, error recovery)
10. Navigation (one pattern per level, platform conventions)
11. Charts and data (the right chart, a table alternative)

## The non-negotiables

These hold in every project. Each has a reason, and the reason is what to explain to a stakeholder
who pushes back.

1. **One primary action per screen.** If everything is bold, nothing is. Users should know where
   they stand, what to do next and what they get within about 3 seconds.
2. **Tokens only.** No raw hex, px, font sizes or durations in screens. A one-off value becomes a
   hundred, and dark mode breaks.
3. **Every state is designed:** default, hover or pressed, focused, disabled, loading, error, empty,
   offline. Most real usage happens in the states nobody drew.
4. **Never colour alone.** Every meaning gets an icon or shape and a word.
5. **Text contrast at least 4.5:1, UI edges and focus rings at least 3:1, measured in both themes.**
6. **Real data, real urgency.** Counts, timers, prices, scarcity and percentages come from data, or
   they do not appear.
7. **Calm in high-stakes moments.** During a payment, an exam or a destructive action, nothing moves
   except what the user needs.
8. **Respect the system:** theme, font scale (up to 200%), reduced motion, haptics, back gestures and
   zoom (never disabled).
9. **Touch targets at least 48 dp on Android, 44 pt on iOS, 44 px on web** (WCAG 2.2's 24 px is
   the legal floor, not the design target).
10. **Skeletons, not spinners, for content.** A spinner only inside a button, for under about 1 s.
11. **Visual structure is information.** Borders, numbering, labels, dividers and eyebrows encode
    something true about the content. Numbered markers only for a real sequence.
12. **Spend boldness in one place.** One memorable element; everything around it quiet and
    disciplined. Decoration that does not serve the brief is cut.
13. **No emoji as icons.** One consistent SVG icon set; hide decorative icons from assistive tech.
14. **Motion has a job.** It answers a person's action or draws attention once. It uses the motion
    tokens, animates transform and opacity, exits faster than it enters, never blocks input, and has
    a reduced-motion version. One orchestrated moment per view beats scattered effects.
15. **Write like a person.** Plain words, the user's vocabulary, one name per action through the
    flow, no hype, and nothing invented to sound specific (13).

## When a stakeholder asks for something that breaks these

Do not refuse and do not quietly comply. Show the evidence (a contrast ratio, a gesture conflict,
a frame-rate drop, an unsupported claim, a legal risk), then offer a change that keeps their intent.
"Make it urgent" can become a real deadline shown truthfully. "Make the badge pop" can become a vivid
dot next to accessible text. "Add lots of animation" can become one orchestrated hero moment plus
quick feedback on every action. `references/03-critique-method.md` shows how.

## Sources

UI/UX Studio combines and rewrites several design skills; see `README.md` and `NOTICE` for credits.
Only methods and rules were adopted, never a style or palette catalogue: a catalogue hands out
defaults, and this skill wants choices made for the brief.
