# Marketplace listing kit

Copy for publishing UI/UX Studio.

## GitHub repository

**Repository name:** `ui-ux-studio` (keep it identical to the skill `name`, so `npx skills add
awalhadi/ui-ux-studio` works and the marketplaces index one entry).

**Description** (GitHub shows about 350 characters):

> UI/UX design, animation and design system skill for Claude Code, Codex, Cursor and other AI
> coding agents. Design tokens, motion design, components, accessibility (WCAG 2.2), UI code audits
> and human UX copy for React, Next.js, Tailwind, Flutter, SwiftUI, Compose and React Native.

**Website field:** the skills.sh page once it exists.

**Topics** (GitHub allows 20):

```
agent-skills  claude-code  claude-skills  skills  ui-ux  ui-design  ux-design  design-system
design-tokens  animation  motion-design  micro-interactions  frontend  accessibility  wcag
tailwindcss  react  nextjs  flutter  swiftui
```

**Social preview image** (Settings, General): 1280 x 640, the name, the one-line tagline, and one
real before/after screen. Listings and shared links use it.

## Short copy for each listing

| Where | Length | Copy |
|---|---|---|
| Tagline | 1 line | UI/UX design, animation and design systems for AI coding agents |
| skills.sh, SkillsMP (taken from `SKILL.md`) | description | Already in the `SKILL.md` frontmatter; keywords lead it |
| Claude Marketplaces, claudeskills.info, Skillselion (submissions) | about 160 characters | Senior-designer method for AI agents: distinctive UI, design tokens, motion with code for 10+ stacks, WCAG checks and UI code audits. |
| Awesome-list pull request | 1 line | [ui-ux-studio](https://github.com/awalhadi/ui-ux-studio): UI/UX design, motion and design-system skill with contrast and UI lint scripts. |
| Social post | 2–3 lines | One before/after image, the install command, and one sentence on what it fixes (generic AI-looking UI, missing states, janky animation). |

## Primary keywords (use them in this order)

1. **ui ux** / **ui/ux design**: the category name on every marketplace
2. **design system** / **design tokens**
3. **animation** / **motion design** / **micro-interactions**: the least crowded, and the skill's strength
4. **frontend design**, **web design**, **mobile app design**
5. **accessibility**, **wcag**
6. Stack names: react, nextjs, tailwind, shadcn, flutter, swiftui, jetpack compose, react native

Long-tail phrases worth one natural mention each in posts and the README: "claude code skill for
ui design", "make ui look less ai generated", "design tokens dark mode contrast", "page transitions
nextjs", "react native animation skill", "flutter design system".

## What moves the ranking

Install counts drive the skills.sh leaderboard and most "most installed" boards; stars and search
matches on name and description come next. So:

1. **Publish on GitHub** with the exact name, description and topics above; tag a release
   (`v1.0.0`).
2. **Install it once with `npx skills add`** on a clean machine; this creates the skills.sh entry
   and checks that the install path works.
3. **Submit** to Claude Marketplaces, claudeskills.info, Skillselion, SkillsMP and mcp.so (skills).
4. **Open pull requests** to awesome lists for Claude Code skills and agent skills.
5. **Show, do not tell**: one short screen recording of a generic page turned into a distinctive one,
   with its motion, posted where front-end developers read (X, Reddit r/ClaudeAI and r/webdev,
   Hacker News "Show HN", dev.to).
6. **Keep it trustworthy**: no hooks, no network calls, scripts readable in a minute. Several
   directories warn about unsafe skills; say plainly in the README that this one runs nothing on its
   own.
7. **Update often**: a dated changelog and regular releases keep the listing in "recently updated"
   views.
