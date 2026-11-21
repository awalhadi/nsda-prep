# 19. Review gate and usability testing

## Pre-delivery checklist (every new screen, page, component, motion or system, before merge)

Sections follow the order a reviewer works in. Lines that do not apply (for example DIRECTION on a
small fix inside an existing look, or MOBILE on a desktop-only tool) are marked "n/a" with a reason,
not deleted.

Record each line as **pass**, **fail** or **not checked**, with a note. Paste it into the PR.

**Short form** (critiques and plan-only deliverables only): list the lines your findings touch with
their result, then one line: "Not checked: N of the remaining lines (needs a build, screenshots or
devices)." A built screen always gets the full list.

```
Screen / page: ____________________   Reviewer: ________   Date: ________
Mark each line: pass / fail / not checked, with a note.

PROCESS
[ ] Project design source, overlay skill and direction record read first; no competing system added
[ ] Direction plan written; genericity test run; changes noted (looks only)
[ ] Screenshots reviewed: light, dark, 375 px, desktop, reduced motion
[ ] Animations played at full speed and in slow motion
[ ] scripts/contrast.mjs and (web) scripts/ui-lint.mjs run; output attached
[ ] One accessory removed after the first build
[ ] Directions tried log updated

DIRECTION
[ ] The one bold move is named and is the only loud element
[ ] No generic tell from 15 without a one-line reason from the brief
[ ] Structure is information: numbering only for sequences; every label and border means something
[ ] Real content for this subject (no lorem ipsum, no generic filler)
[ ] Human-touch check (13, part C) passed

VISUAL
[ ] Tokens only: no raw colours, sizes, font values or durations (lint passes)
[ ] Type from one scale; body measure under 80 characters; line height per script
[ ] One SVG icon set, one stroke width and style per level; no emoji as icons
[ ] Official brand and logo assets used with correct proportions and clear space
[ ] One meaning per colour; brand and status colours do not compete
[ ] One elevation scale; shadows and blur used for meaning, not decoration

INTERACTION
[ ] One primary action; label is a verb plus payoff
[ ] 3-Second Rule: status, next action and payoff visible without scrolling
[ ] All states: default, hover/pressed, focus, disabled, loading, empty, error, offline, limit
[ ] Pressed or hover feedback within 100 ms; not colour alone; no layout shift on press
[ ] Touch targets >= 48 dp / 44 pt / 44 px, with at least 8 px between targets
[ ] No conflicting gestures in one region; every gesture has a button and keyboard path

MOTION
[ ] Every animation has a job (feedback, orientation, state, attention, continuity)
[ ] Durations and easing come from motion tokens; exits faster than enters
[ ] Only transform and opacity animated; no transition: all
[ ] Interruptible; never blocks input; correct final state after rapid repeats
[ ] At most one orchestrated moment per view; no fade-up on every section
[ ] Reduced motion: fades or no motion; loops, parallax, shimmer and autoplay stop
[ ] 60 fps on the low-end target device; off-screen animations paused

THEME
[ ] Theme follows the system
[ ] Dark mode contrast measured on its own (never assumed from light)
[ ] Borders, dividers and every interaction state visible in both themes
[ ] Scrims and modals measured against the real background in both themes

LAYOUT
[ ] Every width the product supports checked: phones at 375 px and landscape; 768 / 1024 / 1440 px
    for web and tablet; mark the rest n/a with the reason
[ ] No horizontal scroll; text, chips and badges reflow without clipping
[ ] Safe areas respected (notch, home indicator, system bars); fixed bars do not hide content
[ ] Gutters adapt by width and orientation; long text keeps a readable measure on large screens
[ ] Zoom not disabled; font scaling to 200% with no clipping or overlap

ACCESSIBILITY
[ ] Contrast measured: text >= 4.5:1, UI >= 3:1, both themes (tool output attached)
[ ] Never colour alone: icon/shape + word on every status
[ ] Screen reader: labels, roles, state changes and results announced; order matches the visual order
[ ] Decorative icons beside visible text hidden from assistive tech
[ ] Keyboard (web): full task completes; focus visible and not obscured; dialogs trap and return focus
[ ] Failed forms keep input and inline errors; several errors focus a linked summary
[ ] Sign-in allows password managers and paste
[ ] Auto-rotating content can be paused and stops on focus and reduced motion

COPY
[ ] Actions keep one name through the flow; buttons say what happens
[ ] Errors state what happened, what is safe and what to do; no apology, no vagueness
[ ] No hype verbs or invented specifics (13, part B)

TRUTH
[ ] Every number bound to data; hidden-below thresholds applied
[ ] Copy passes the banned-claims list (12); no invented urgency
[ ] Saved / offline / verified marks shown only when true

PERFORMANCE
[ ] Page or frame budget met on the low-end device
[ ] Images sized (no layout shift); heavy parts and animation libraries lazy-loaded
[ ] Localised rendering checked (scripts, numerals, one numeral system, RTL mirroring)
```

A screen without the recorded checklist is not approved.

## Usability testing protocol

Run before launch and before each major release.

- **Participants:** at least 8 target users per round, on the realistic low-end device, including
  the hardest context (for example late at night in dark mode).
- **Methods**
  - *3-second test:* show the screen for 3 seconds, hide it, ask "where do you stand, what would
    you do next?"
  - *First-click test:* "You want to do X. Where do you tap?" Target: at least 80% correct within 3 seconds.
  - *Task success:* the main journeys end to end (for example take an exam, review mistakes, pay).
    Record success, time and errors.
  - *Trust interview:* show badges, paywalls and claims. Ask "what does this mean?" and "do you
    believe it?" Misreadings are bugs.
- **Record** results and decisions for each round. Fix every issue that blocks a task before release.

## Reporting a design deliverable

End with:
1. What was designed (files, screens, tokens).
2. What was measured (contrast output, budgets, screenshots) and what was judged by eye.
   Say which advice came from this skill's general defaults rather than the project's sources.
3. The checklist above.
4. Open questions for the product owner.
