# 14. Visual direction: a point of view made for this subject

A usable screen can still look like every other screen. The client is paying for a point of view:
deliberate, opinionated choices of palette, type and layout that belong to *this* brief. Take an
aesthetic risk when the brief justifies it, and keep the risk inside the non-negotiables (contrast,
states, truth, calm in high-stakes moments).

## 1. Ground the design in the subject

Distinctive choices come from the subject's own world, not from a style catalogue. Before
designing, write down:

```
Subject (one concrete thing, not "a platform"):
Audience (who, age, what they already use daily):
The design's primary job (the one thing a visitor must do or understand):
Materials and artefacts of this world (paper, tools, places, objects, textures):
Vernacular (words, symbols, forms, numbering systems the audience already reads):
Emotional register (calm, competitive, celebratory, serious, playful):
What a competitor in this space looks like (so we know what not to repeat):
```

If the brief does not say what the product is, propose one concrete subject, audience and primary
job, and confirm it with the client. Use memory or project context as a hint. A toy for girls aged
8–11 and a dashboard for financial analysts must not come out looking alike.

**Reasoning from product type to direction** (ask, do not look up):

| Question | Pushes the direction toward |
|---|---|
| How high are the stakes (money, exams, health, law)? | Higher: quieter palette, explicit controls, less motion, more white space |
| What emotion does the user arrive with? | Anxious: warmth and reassurance; bored: rhythm and surprise; rushed: density and speed |
| How long and how often do they stay? | Hours a day: low-glare surfaces, restrained accent, strong reading type. Once a month: a stronger first impression |
| What must they trust? | Real data shown plainly, verifiable labels, no decoration near numbers |
| Which script and numerals? | Type choice, line height, letter-case rules (see 09) |
| What device and network? | The decoration budget (blur, shadows, images, fonts) |

## 2. Design dials

Set three dials from 1 to 10 in the plan. They turn "make it bolder" into decisions.

| Dial | Low (1–3) | Middle (4–6) | High (7–10) |
|---|---|---|---|
| **Variance** (how far from convention) | Familiar grid, system patterns, one accent | One unexpected element (type, crop, colour block) | Broken grid, oversized type, asymmetric composition; only where the stakes are low |
| **Motion** | State changes only (120–200 ms) | One orchestrated page-load or reveal moment | Choreographed sequences; never in exams, payments or dense tools |
| **Density** | Generous space, 1 idea per view (marketing, onboarding) | Balanced (most apps) | Compact tables and panels (consoles, analysts); spacing steps shrink, type stays readable |

Typical settings: a staff console is variance 2–3, motion 1–2, density 7–8. A public landing page
is variance 5–7, motion 3–5, density 2–4. A live exam is variance 1, motion 1, density 4.

## 3. The hero, or the first screen

The first thing a visitor sees should be the most characteristic thing in the subject's world, in
the form that suits it best: a headline, an image, a real product moment, a live demo, an
interactive sample. Choose deliberately.

- A big number with a small label, supporting stats and a gradient accent is the default. Use it
  only when a number really is the story, and the number is real.
- A real product moment (a sample question that can be answered, a real receipt) usually beats an
  illustration of the product.
- In apps, the "hero" is the status zone: it answers *where do I stand* (see 02, the 3-Second Rule).

## 4. Restraint

- **Spend boldness in one place.** Name the one memorable element in the plan. Everything around it
  is quiet: fewer colours, one radius family, a consistent rhythm.
- **Remove one accessory.** Before shipping, look at the screen and take one thing away: a second
  accent, a decorative border, a gradient, a badge, a label nobody needs.
- **Quality floor, without announcing it:** responsive down to 360–375 px, visible keyboard focus,
  reduced motion respected, contrast measured, a palette that holds together in dark mode.

## 5. The direction plan (Pass 1 output)

Keep it to one screen. It is what the genericity test (15) reviews and what the direction record
(`assets/direction.template.md`) keeps.

```
Subject / audience / primary job:
Vernacular we borrow from:
Colour (4–6 named values):   e.g. "Slate ink #1E293B: text and rules", …
Type: family → role (display / body / digits), scale ratio, weights used
Layout: one sentence + ASCII wireframe; alignment (left / centre / justified) and why
Dials: variance _ / motion _ / density _
Motion signature: character, curves, the one moment (see 10)
Principles (3, specific to this brief):
The one bold move:
Genericity test result: which axes changed after review, and why
```

Compare two layout ideas in ASCII before choosing one. They are cheap, and the comparison often
shows which one has a reason.

```
A: split hero                         B: sample-first
┌───────────────┬──────────┐          ┌──────────────────────────┐
│ Headline      │ product  │          │ Real question, tappable  │
│ one line      │ moment   │          │  ( ) ( ) ( ) ( )         │
│ [Primary]     │          │          ├──────────────────────────┤
└───────────────┴──────────┘          │ Headline · [Primary]     │
                                      └──────────────────────────┘
```

## 6. Bring it into the system

A direction is not done until it is tokens: the named colours become semantic tokens with pairs
(04), the type becomes the scale (16, 04), the dials become spacing, motion and radius values. A
direction that lives only in one page's CSS will be lost on the next page.
