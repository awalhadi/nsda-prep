# UI/UX Studio: UI/UX design, animation and design system skill for AI coding agents

**UI/UX Studio** is an agent skill that makes Claude Code, Codex, Cursor, GitHub Copilot, Gemini CLI
and other `SKILL.md` agents design and build production-grade UI the way a senior product designer
would: a distinctive visual direction, design tokens with measured contrast, every component state,
motion design with real code, accessible flows, and copy that sounds human, not AI-generated.

```bash
npx skills add awalhadi/ui-ux-studio
```

Works on any stack: React, Next.js, Vue, Nuxt, Svelte, Astro, Angular, Laravel, Tailwind CSS,
shadcn/ui, Three.js, Flutter, SwiftUI, Jetpack Compose, React Native / Expo, WinUI, WPF, Avalonia
and JavaFX. MIT licensed, no dependencies to read, and two small Node scripts to check the work.

## What it does

| Area | What the agent gets |
|---|---|
| **Visual direction** | A design plan made for your product's subject, plus a genericity test against the looks that read as templated or AI-made (cream + serif, SaaS card kits, gradient heroes, fade-up on every section) |
| **Design system** | Semantic design tokens for colour, typography, spacing, radius, elevation and motion, light and dark mode, with every text and background pair contrast-checked |
| **Animation and motion design** | Motion tokens, choreography, gestures, springs, page and shared-element transitions, micro-interactions, and reduced-motion fallbacks, with copy-paste code for CSS, View Transitions, Motion (Framer Motion), GSAP, Tailwind, Vue, Svelte, Reanimated, Flutter, SwiftUI, Compose and XAML |
| **Screens and flows** | Screen specs with one primary action, all states (loading, empty, error, offline), and "Given … then …" acceptance criteria; checkout, paywall, onboarding and exam flows |
| **Components** | Component specs with anatomy, every state, sizes, motion and accessibility |
| **Accessibility** | WCAG 2.2 AA checklist, focus, screen readers, touch targets, text scaling, contrast measurement |
| **UI code audit** | Web interface rules with terse `file:line` findings, plus an automated anti-pattern scanner |
| **Human touch** | Visual craft details and a UX-copy humaniser: no hype words, no invented numbers, clear errors |
| **Localisation** | RTL mirroring, non-Latin scripts, numerals, bidi text |
| **Project overlays** | A template to add your own repo's design rules on top, so every agent follows your system |

## How it compares

| | UI/UX Studio | frontend-design | ui-ux-pro-max | web-design-guidelines |
|---|---|---|---|---|
| Distinct visual direction, anti-generic test | Yes | Yes | Style catalogue | No |
| Design tokens + measured contrast | Yes (script) | No | Yes | No |
| Every component and screen state | Yes | No | Partly | Partly |
| Motion system + code for 10+ stacks | Yes | Guidance only | GSAP presets | Rules only |
| Native mobile and desktop stacks | Yes | No | Yes | No |
| UI code audit (`file:line`) | Yes (+ scanner) | No | No | Yes |
| UX copy humaniser | Yes | Writing tips | No | Copy rules |
| Needs Python or a database | No | No | Yes | No |

UI/UX Studio builds on all three; see [NOTICE](NOTICE) for credits.

## Benchmark

In a trigger test with Claude Code (20 realistic prompts, half of them near misses), the agent
loaded UI/UX Studio for **8 of 10** design, motion, token, accessibility and RTL tasks, and for
**0 of 10** unrelated tasks. Method, data and a runner you can re-use are in
[docs/benchmark.md](docs/benchmark.md) and `evals/trigger/`.

## Install

The scripts need Node 18 or later; nothing else is required. The skill has no hooks and makes no network calls: it is Markdown plus two small scripts you run yourself.

```bash
# Any agent, with the skills CLI (installs to the right folder)
npx skills add awalhadi/ui-ux-studio

# Claude Code, every project
cp -r ui-ux-studio ~/.claude/skills/ui-ux-studio

# Claude Code, one project (commit it so the team shares it)
cp -r ui-ux-studio <project>/.claude/skills/ui-ux-studio

# Codex, Cursor and other agents that read .agents/skills
cp -r ui-ux-studio <project>/.agents/skills/ui-ux-studio
```

**Claude.ai and the Claude desktop app:** `zip -r ui-ux-studio.zip ui-ux-studio`, then upload it
under Settings, Capabilities, Skills.

Restart the agent after installing. In Claude Code, type `/ui-ux-studio`, or just ask for design
work: the skill loads by itself for any UI, UX, design, animation or accessibility task.

## Example prompts

- "Design the onboarding for our budgeting app, with calm, precise animations."
- "This landing page looks AI-generated. Critique it and propose a new direction."
- "Set up design tokens for light and dark mode and check the contrast."
- "Add page transitions and micro-interactions to our Next.js app."
- "Review `src/components` for accessibility and UI best practices."
- "Design the checkout screen in SwiftUI."
- "Rewrite our error messages so they sound human."
- "Create a design skill for this repository."

## Check the work

```bash
node ui-ux-studio/scripts/contrast.mjs path/to/tokens.json       # WCAG contrast, light and dark
node ui-ux-studio/scripts/contrast.mjs --pair "#4F46E5" "#FFFFFF"
node ui-ux-studio/scripts/ui-lint.mjs src/                       # web UI anti-patterns, file:line
```

Both exit 1 on failure, so they can run in CI.

## FAQ

**What is a UI/UX skill for Claude Code?**
A folder with a `SKILL.md` file that the agent loads when a task needs it. This one gives the agent a
complete design method, references and checks, so its UI output is consistent, accessible and
distinctive instead of generic.

**Does it work with Cursor, Codex, Copilot or Gemini CLI?**
Yes. It follows the open Agent Skills format. Install it with `npx skills add` or copy it into
`.agents/skills/`.

**Will it replace my design system?**
No. It reads your existing tokens, components and design docs first and extends them. Your project's
system always wins.

**Does it help with animations?**
Yes. It has a full motion system (durations, easing, springs, choreography, reduced motion) and
16 ready recipes with code for web, React Native, Flutter, SwiftUI, Compose and desktop.

**How does it stop UI looking AI-generated?**
Every new look goes through a direction plan and a genericity test that names the common AI
defaults, then a human-touch pass for craft details and copy.

**Is it heavy on context?**
No. `SKILL.md` is a short router; each task reads only the few reference files it needs.

## Layout

```
SKILL.md                 router: scope, project source first, modes, two passes, outputs, gate
references/01–21         one topic per file (the mode table in SKILL.md says which to read)
references/examples/     a worked example (a Bangla exam-prep app)
assets/                  templates: direction, tokens, screen, component, motion, project overlay
scripts/                 contrast.mjs, ui-lint.mjs
evals/evals.json         test prompts for skill evaluation
```

## Contributing

Edit the reference that owns a topic. Keep motion values identical across `04-tokens.md`,
`10-motion-system.md`, `11-motion-recipes.md` and `assets/tokens.template.json`, and run the prompts in
`evals/evals.json` after changing the description or the mode table.

## License

MIT. Adapted material keeps its original licence; see [NOTICE](NOTICE).

**Keywords:** UI/UX design skill, Claude Code skill, agent skill, AI design assistant, design system,
design tokens, UI animation, motion design, micro-interactions, frontend design, web design, mobile
app design, accessibility, WCAG, Tailwind, React, Next.js, Flutter, SwiftUI, Jetpack Compose,
React Native.
