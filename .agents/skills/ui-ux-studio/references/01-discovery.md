# 01. Discovery: design for the real person, not the demo

Most bad UI is designed for the designer's own conditions: a new laptop, fast Wi-Fi, a calm
afternoon, perfect eyesight. Discovery replaces those assumptions with the user's.

## The design brief (fill this in before drawing)

If you cannot ask the user now, fill it in with stated assumptions, propose a concrete subject,
audience and primary job (see 14), and list the assumptions to confirm in your answer.

```
Product / feature:
Primary users (who, how many hours a day, why they are here):
Their emotional state when using it (calm, anxious, rushed, bored, tired):
Devices (lowest realistic: RAM, screen size, OS version, browser):
Network (always on, patchy, metered, offline for hours):
Physical context (one hand on a bus, desk, dark room at 1 a.m., outdoors in sunlight):
Languages and scripts; numerals; reading direction:
Accessibility needs known in this audience (low vision, older users, colour blindness):
The 3 jobs users hire this screen/product for:
What failure costs the user (lost money, lost exam, embarrassment, lost time):
Hard constraints (app size, page weight budget, legal rules, platform policies):
What success looks like, measurably (task success, time, first-click accuracy, retention):
Subject's materials, artefacts and vernacular (objects, places, words, symbols the audience knows):
What competitors look like (so the design does not repeat them):
Stack and platform (detected from the repo, never assumed):
```

## Questions that change designs

- **What is the worst device?** It sets the animation budget, the image strategy, and whether
  blur and shadows are affordable at 60 fps.
- **What happens offline?** Decide per screen: works fully, works read-only, or explains clearly.
  Never let a screen reload and lose input when the network drops.
- **What is at stake?** The higher the stakes (money, exams, health, legal), the calmer and
  more explicit the UI must be, and the less you can rely on gestures and hidden affordances.
- **When do they use it?** Late at night means dark mode quality matters, but follow the system
  setting rather than forcing it.
- **What would make them distrust us?** Fake numbers, hidden prices, a close button that is
  hard to find, an AI answer labelled as expert-reviewed. Design those risks out early.

## Personas: keep them short and true

One paragraph each, built from real research or real support tickets, not stock photos. Include
the device, the context, the fear and the goal. Example: "A job seeker studying 3–5 hours a day
on a 2 GB Android phone in a shared room, often after midnight, worried about wasting the last
months before an exam and suspicious of apps that promise guaranteed success."

## Outputs of discovery

1. The filled brief.
2. Two or three personas.
3. Three to five core journeys written as one line each, for example
   `Target → 5-question check (no login) → first explanation → save progress (OTP) → offer with a visible free option`.
4. A list of hard budgets: page weight, app size, frame rate, the minimum font size.
5. For anything that sets a look: the subject notes that feed the direction plan
   (`14-visual-direction.md`).
