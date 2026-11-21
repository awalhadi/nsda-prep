# 03. Critique method: Proposal → Problem → Change

World-class design teams do not just add ideas. They test every idea against evidence and keep
the intent while fixing the flaw. Use this table for any design direction, brief, moodboard,
competitor copy or stakeholder request.

| Proposal | Problem (with evidence) | Change |
|---|---|---|
| What was asked or shown | Why it fails: measured, cited or reasoned | What to do instead, keeping the intent |

**Rules for a good row**
- The problem has evidence: a measured contrast ratio, a platform guideline, a gesture conflict,
  a byte budget, a legal or policy rule, a research finding, or a clear logical consequence.
- The change keeps what the requester actually wanted (urgency, delight, brand feel) and removes
  the harm.
- "It looks dated" or "I don't like it" is not a problem. Find the functional reason or drop the row.

## Common traps to check every time

These are the issues most often found in real reviews. Each line is a possible table row.

**Colour and contrast**
- Vivid amber, mint, coral or emerald used for text. They usually fail 4.5:1 on light backgrounds
  (amber #F59E0B on white is about 2.1:1). Use vivid colours for dots, fills and large graphics;
  use darker tested shades for text.
- Brand indigo or blue used as text on dark backgrounds; it often falls to about 3:1. Lighten it
  for dark mode.
- A "warm" background that is really cool blue-grey (#F8FAFC). Check the hue, not the name.
- Cards whose background differs from the page by less than about 1.1:1 and have no border or
  shadow. They disappear on cheap screens.
- Brand colour equal to a status colour (green brand when green means success).

**Theme**
- Dark mode forced on at a set time. It overrides the user's choice. Follow the system and offer
  an optional schedule.
- Health claims for dark mode or "blue light" without evidence.

**Typography**
- Three or more font families, especially rounded display faces for long reading.
- `tabular-nums` assumed to work for non-Latin digits. Many scripts' fonts have no tabular
  figures. Put each timer or score digit in a fixed-width box and test it.
- Captions below 12 px.

**Interaction**
- Swipe navigation in high-stakes flows: accidental swipes and conflicts with Android's back
  gesture. Allow swipe only in low-stakes browsing; use buttons in exams and payments.
- "Double-tap to confirm" or short undo windows for important answers. They add errors and stress.
- Space bar as "next" on the web. It conflicts with scrolling and screen readers. Use number keys
  and arrows instead.
- Haptics that "punish" (double buzz on wrong). Use a light tap for success and a soft single tick
  for an error, only where appropriate, and follow the system setting.
- Spinners for loading content instead of skeletons.

**Truthfulness**
- Invented counts ("4,892 people taking this now"), invented urgency, unvalidated percentages
  ("92% chance"), "Safe zone" or "pass chance" labels without a validated model.
- "Verified by experts" on content that was only sampled or AI-generated.
- "Offline protected" when only some content is cached.
- Share cards with real names or phone numbers by default. Use an alias by default.

**Genericity and identity** (see `15-generic-tells.md`)
- A look from the five clusters with no reason in the brief (cream + serif + terracotta, near-black
  + acid accent, broadsheet hairlines, the SaaS card kit, template chrome).
- An eyebrow, label or divider that carries no information; numbered markers on a non-sequence.
- Fade-up on every section, hover lift on every card, decorative gradients.
- No single memorable element, or several competing ones.
- Placeholder copy that could belong to any product.

**Layout and CSS**
- A section wrapper class named after its content type, sharing rules with the list inside.
- Two owners for the space between sections (doubled or cancelled margins).
- Clipping, one-word lines or sideways scroll at 375 px.

**Feature fit**
- Tools that break the simulation, such as a calculator in an exam whose real rules do not allow
  one. Make such tools a per-context setting.

## Writing up a critique

1. One-line verdict: what is strong and what blocks quality.
2. The table, ordered by the priority list in SKILL.md: accessibility, touch, truthfulness and
   performance first, then fit to subject, layout, type and colour, motion, forms, navigation,
   charts. Tag rows with rule IDs from `20-rule-quick-reference.md` where one applies.
3. The three changes with the biggest effect.
4. What you could not check (for example "not tested with a screen reader").

## Critique from screenshots, not from the source

When the environment can render the UI, review pictures, not code:

1. Capture light and dark, 375 px and about 1440 px, with reduced motion on (so content that
   reveals on scroll is not caught half-visible).
2. Look at each capture for three seconds and answer the 3-Second Rule questions (02).
3. Squint or blur: does the hierarchy still read? Is there one memorable element?
4. Grayscale: does every meaning survive without colour?
5. Run the genericity test (15) and the human-touch check (13) on what you see, not on what you intended.
6. Remove one accessory, capture again, and compare.

Say in the report which captures were taken and which were not possible.
