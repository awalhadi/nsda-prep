# 06. Screens, navigation and flows

## Designing a screen

1. **Name its job** in one sentence. If it needs two sentences, it may be two screens.
2. **Answer the 3 questions** (where do I stand, what now, what do I get) and place the answers
   top to bottom, in that order.
3. **Choose the one primary action.** Write its label as a verb plus the payoff.
4. **Lay out zones** from top to bottom. On mobile, the primary action sits in thumb reach.
5. **Bind every number to data.** For each number, name its source and the rule for when it is
   hidden (too little data, a cohort that is too small, not yet validated).
6. **Design every state:** first-time user with no data, loading, empty, error, offline, a
   limit reached (free quota), and the "done for today" state.
7. **Write acceptance criteria** as "Given … then …", including at least one edge case.

Use `assets/screen-spec.template.md`.

### Example zone layout: a home "command center"

```
┌──────────────────────────────────┐
│ [Target v]   [flame] 12  [Pro] o │  header: context switcher, streak, plan, avatar
├──────────────────────────────────┤
│ Readiness 62 (estimated)       ^ │  zone 1: where do I stand + one computed insight
│ "You can gain 4 more marks       │
│  in Literature: early era"       │
├──────────────────────────────────┤
│ Today's target: 25 min           │  zone 2: what to do now
│ 1. Review 16 mistakes  10m [>]   │  <- the only primary button sits on the
│ 2. Topic set: Geography 10m      │     first unfinished task
│ 3. Mini mock           5m        │
├──────────────────────────────────┤
│ (o) LIVE  Weekly mock, 18:00     │  zone 3: time-bound and secondary items
│ [Mistakes: 84] [Heatmap: new]    │
└──────────────────────────────────┘
```

A brand-new user sees a "first 20 questions" path where the readiness value would be, rather
than a fake zero.

## Navigation patterns

**Mobile**
- Bottom tab bar with 3 to 5 tabs, each a noun with an icon and a label. No hamburger menu for
  main areas, because hidden navigation is navigation nobody uses.
- Profile, settings and less frequent tools open from the header avatar or home cards.
- The back gesture always works and never loses input without a warning.
- At most 5 bottom tabs. One navigation pattern per level: do not mix tabs, a drawer and a
  segmented control for the same set of places.
- The current place is marked by more than colour (weight, an indicator bar, a filled icon).

**Web**
- A left sidebar (about 240 px, collapsible to 64) for apps; top navigation for content sites.
- `Ctrl`/`Cmd`+`K` global search for products with many objects.
- Breakpoints: under 600 px mobile layout, 600–1024 tablet, over 1024 desktop.
- Data-heavy views (treemaps, charts) always have a table alternative.

## Flow design

Write each core journey as one line, then design the transitions:

```
First 3 minutes  Pick a goal → 5-question check (no login) → first result unlocked
                 → save progress (OTP) → offer, with a visible free option
Daily loop       Home → status and 3 tasks → 10-minute review → next best set → streak
```

Rules:
- **Value before sign-up.** Let users feel the product before asking for a phone number or email.
- **Ask at the moment of need.** Ask for login when there is something to save; ask for push
  permission after the user sees what push is for.
- **The free option is visible** in every offer. Hiding it destroys trust.
- **Every dead end has an exit:** empty states, errors and limits each offer one next action.

## Layout patterns by platform

- Reading and answering: single column on mobile; on the web a two-pane split (question fixed on
  the left, detail on the right), or 70/30 with a side panel for tools.
- Long forms: one topic per step, a visible progress indicator, saved drafts.
- Form validation: on blur, not on each keystroke; once an error shows, re-check as the user types
  so it clears promptly. After a failed submit with several errors, move focus to a summary that
  links to each field. Never clear what the user typed.
- Dashboards: a bento grid of `StatTile`s, each with one number and one meaning; at most one
  hero tile.
