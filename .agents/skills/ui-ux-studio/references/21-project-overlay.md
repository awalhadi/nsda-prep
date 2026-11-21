# 21. Project overlay: a design skill for one repository

UI/UX Studio is general. A real product needs its own rules on top: where its tokens live, which
components to reuse, what its lint enforces, which claims are banned, what its owner has already
accepted or rejected. Put those in a small **project overlay skill** inside the repo. The overlay
loads ui-ux-studio, then adds and overrides. This keeps the general method updatable and the project's
decisions versioned with its code.

## When to create one

- A product with more than a few screens, or more than one person or agent designing it.
- A design system, tokens file, or brand rules that must not be reinvented each session.
- Owner decisions that should stop being re-litigated ("the P4 site was rejected; do not propose it
  again").

## Where it goes

```
<repo>/.claude/skills/<product>-design/SKILL.md      Claude Code
<repo>/.agents/skills/<product>-design/SKILL.md      Codex, Cursor and other agents
<repo>/.claude/skills/<product>-design/direction-log.md   the direction record (Master + overrides)
```

Start from `assets/project-overlay/SKILL.template.md` and `assets/direction.template.md`.

## What belongs in it

| Section | Content | Example |
|---|---|---|
| Load order | "First load ui-ux-studio; where the two differ, this project's sources win" | (none) |
| Sources of truth | The spec chapters, ADRs, tokens file, component library paths per area | `packages/ui/tokens/tokens.json` generates CSS and Dart |
| Rules the checks enforce | Lint rules, budgets, i18n rules, banned claims, CI commands | "No raw hex in web code"; "funnel pages ≤ 150 KB" |
| Visual direction | A pointer to `direction-log.md`; which areas need Pass 1; which have fixed dials | "Console keeps variance 2 / motion 1 / density 8" |
| Motion rules | The motion signature, the library allowed (budget), places where motion is banned | "Live exams: nothing moves but the timer" |
| Project traps | Mistakes that happened here and must not happen again | "Never name a section band after its type; it collides with the list inside" |
| Open questions | Decisions the owner has not made yet, so agents ask instead of guessing | "Sample numbers in mockups: allowed or not?" |
| Before reporting | Which gate to fill in, plus project commands | "`flutter analyze` and `flutter test` in `apps/mobile`" |

## Writing rules

- Keep it short (under about 150 lines). It states differences, not the whole method again.
- Name files and commands exactly; an agent should be able to act on every line.
- Record why a rule exists in a few words; a rule without a reason gets broken.
- Never copy secrets, customer data or private URLs into it.
- Update the *Directions tried* log in the direction record after every look-changing attempt,
  including plans the owner only saw.

## The description line matters

The overlay's `description` decides when it loads. Name the product, the app folders and the kinds
of change: "<Product>'s design rules for any UI work in this repo, in apps/web, apps/console or
apps/mobile. Use it whenever a task adds or changes a screen, component, colour, font, spacing,
copy, animation, empty or error state …, even a small tweak. It loads ui-ux-studio and adds <Product>'s
sources of truth and checks."

A worked overlay for a real product, with its direction record, is summarised in
`examples/sutro.md`.
