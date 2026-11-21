# Benchmark

Two measurements, run on 2026-11-21. Both can be re-run with the files in `evals/trigger/`.

## 1. Does the agent load the skill when it should? (trigger accuracy)

**Method.** A small Next.js + Tailwind demo project with `ui-ux-studio` installed as a project skill
(`.claude/skills/ui-ux-studio`). Each of 20 prompts was sent once with `claude -p` (max 3 turns),
and the runner recorded which skill the agent loaded. 10 prompts should load the skill (design,
motion, tokens, accessibility review, copy, RTL, type); 10 are near misses that should not (unit
tests, SQL, matplotlib charts, CI, SVG conversion, a Bauhaus blog post, a backend bug, a pitch deck,
a rename, a CSS question). A competing general design skill (`product-ui-ux`) was also installed
at user level, as in a real setup with older skills.

| Version of the description | Recall (should load) | False positives | Lost to competing skill |
|---|---|---|---|
| v1 (first SEO description) | 7 / 10 | 0 / 10 | 0 |
| v2 (adds "reviewing UI code for accessibility", "font pairing", "error messages and empty states") | **8 / 10** | **0 / 10** | 1 |

Remaining misses in v2: a landing-page hero prompt went to the competing skill (it disappears once
the old skill is uninstalled), and "rewrite our error messages" was answered without any skill
(the agent judged it simple).

**Limits.** One run per prompt, one model, one demo project: treat ±1 as noise. Run
`python3 evals/trigger/run_trigger_bench.py <project> evals/trigger/trigger-eval.json out.json`
with more runs before quoting it as a rate.

An earlier attempt with skill-creator's `run_eval.py` scored 0/10. That was a harness artefact:
in an empty folder the agent explored files with Bash first and the 45 s timeout ended each run
before any skill call. The demo-project runner above avoids that.

## 2. Can people and agents find it? (marketplace search)

**Method.** `npx skills find "<query>"` (the command the `find-skills` skill tells agents to run)
for 14 queries an agent would form for this skill's use cases. Top result shown.

| Query | Top result today | Installs |
|---|---|---|
| ui ux | nextlevelbuilder/ui-ux-pro-max-skill@ui-ux-pro-max | 463.5K |
| ui design | vercel-labs/agent-skills@web-design-guidelines | 887.6K |
| ux design | github/awesome-copilot@penpot-uiux-design | 13K |
| design system | arvindrk/extract-design-system@extract-design-system | 131.9K |
| design tokens | julianoczkowski/designer-skills@design-tokens | 6.3K |
| animation | heygen-com/hyperframes@hyperframes-animation | 1M |
| motion | remotion-dev/skills@remotion-create | 390.9K |
| ui animation | mblode/agent-skills@ui-animation | 11.2K |
| micro interactions | wondelai/skills@microinteractions | 7.6K |
| frontend design | anthropics/skills@frontend-design | 1.1M |
| accessibility | addyosmani/web-quality-skills@accessibility | 72.7K |
| wcag | wshobson/agents@wcag-audit-patterns | 13.3K |
| dark mode | owl-listener/designer-skills@dark-mode-design | 2.9K |
| studio | remotion-dev/skills@remotion-studio | 352.5K |

**What the results show.**
- In all 14 queries the top results contain the query words in the **skill name**. Search weighs
  the name most, then installs.
- Descriptions are searched too: "gsap presets" and "font pairings", words that appear only in
  ui-ux-pro-max's description, return it first.
- Re-packaged copies count as separate entries: "ui ux" returns 9 entries named `ui-ux-pro-max`
  from different collections, so being included in curated collections multiplies visibility.
- Authors with several focused skills in one repo (for example 4 animation skills from one
  author in the top 5 for "animation") occupy several result slots.
- The `find-skills` skill tells agents to prefer skills with **1K+ installs**, to be cautious under
  **100**, and to check that the source repo has **100+ stars**. A new skill will not be
  recommended automatically until it crosses those thresholds.
