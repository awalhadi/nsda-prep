---
name: <product>-design
description: <Product>'s design rules for any UI work in this repo, in <app folders>. Use it whenever a task adds or changes a screen, component, colour, font, spacing, copy, animation, empty or error state, paywall, or anything visual or interaction-related in <Product>, even a small tweak. It loads the general ui-ux-studio method and adds <Product>'s sources of truth and checks.
---

# <Product> design

First load the general method: the `ui-ux-studio` skill. Use its workflow, non-negotiables and review
gate. This file adds what is specific to <Product>, and where the two differ, **<Product>'s own
sources win**.

## Sources of truth

- **Spec, by area.** Read the part for the screen you are touching before designing it:
  - <area>: `<path to spec or PRD chapter>`
  - <area>: `<path>`
- **Tokens:** `<path/to/tokens.json>` is the only token source. It generates `<outputs>`. A new
  colour, size, duration or component is a design-system change first: add it there, declare its
  contrast pairs, rebuild, run `<contrast command>`.
- **Components to reuse:** `<path to component library>` (<list the main ones>).

## Rules the checks enforce

- <lint rule, for example "no raw hex or px in components">
- <budgets, for example "first load ≤ 150 KB on funnel pages">
- <copy and i18n rules, banned claims, numerals, form of address>
- <truth rules, for example "counts hidden under 50">

## Visual direction

- The direction record is `direction-log.md` next to this file: the Master plus page overrides.
  Read it before any work that changes a look. Extend that direction; do not start a new one unless
  the owner asks. Add every attempt, including plan-only ones, to its *Directions tried* log.
- Run ui-ux-studio's Pass 1 (direction plan and genericity test) for: <which pages or screens>.
  <Area> screens keep their override (<dials>) and get the genericity test only.
- Generic tells used on purpose today (owner accepted): <list>. Do not spread them to new places.

## Motion

- Motion signature: <character, curves, the one moment>.
- Library: <CSS only / Motion / GSAP / platform APIs>; <budget rule>.
- No motion in: <high-stakes areas>.

## Project traps

- <a mistake that happened here, and the rule that prevents it>

## Open questions for the owner

- <decision not yet made; ask rather than guess>

## Before reporting a screen

Fill in ui-ux-studio's pre-delivery gate (`references/19-review-gate.md`) and include it in the report
or PR, stating what was measured and what was not checked. Also run: `<project commands>`.
