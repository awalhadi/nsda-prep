# 07. High-stakes flows: exams, payments, irreversible actions

When failure costs the user money, a result or their data, the UI gets calmer, more explicit and
less clever.

## Distraction-free mode

- No tab bar, banners, promotions, badges or notifications. Nothing animates except the timer.
- The theme never changes mid-session (a scheduled dark mode waits until the end).
- No haptics.
- A compact sticky header holds only progress ("Question 14 / 100"), the timer, the overview
  button and the save or offline status.

## Controls

- **Buttons, not swipes**, to move between items. Accidental swipes and the system back gesture
  conflict with swipe navigation.
- Answers can be changed until submission, like most real exams, unless the exam's rules lock them.
  Avoid "double-tap to lock" and short undo windows; they add errors and stress.
- Selected answers look like a filled bubble (OMR style) in tests, with no right or wrong hint.
- An "unsure" or flag toggle is cheap and helps review.
- Keyboard on the web: `1`–`4` choose, `←` `→` move, `F` flags. Never the Space bar. A full
  session must be possible with the keyboard alone.
- Tools match the real rules: a rough pad yes; a calculator only where that exam allows it.

## Timer

- Fixed-width digits so the layout never shifts.
- A colour change in the final minutes (using a tested text token), **no flashing**.
- Screen-reader announcements at milestones (for example 10, 5 and 1 minutes left).

## Submit and confirm

- A confirmation sheet lists what matters: unanswered and flagged counts, time left.
- The confirm button states the outcome ("Submit 96 answers"); the cancel button states the
  alternative ("Keep working").
- Destructive actions name the object and the consequence ("Delete 3 saved papers? This cannot be undone.").

## Offline and save states: never overclaim

Design the indicator as a short table of true states, each with an icon, colour and text:

| State | Message pattern |
|---|---|
| Online, saving | [shield icon] Saving |
| Offline, content stored on the device | [shield icon] No connection. Answers are saved on this phone and will submit when you are back online. |
| Offline, content stored, but timely submission matters (prizes, deadlines) | Same, plus: "To qualify, submit online before the deadline." |
| Offline, next content not stored | [warning icon] No connection. The next question cannot load. Your answers are saved. |

The screen never reloads on network loss. The indicator never claims protection the system cannot give.

## Results

- The score first, with fixed-width digits; a rank with the cohort size; a percentile only above
  a minimum cohort size.
- Explain what cost points in neutral terms, with a counterfactual if it is computed honestly
  ("15 negative marks moved your rank from 110 to 312").
- The primary action leads to learning from the mistakes, not to a purchase.

## Onboarding and sign-up

- **Value before sign-up**: let people see or try the product before an account, phone number or
  card is asked for (06).
- **Three steps or fewer before the first real result**, each with one decision. Show progress
  ("Step 2 of 3") and allow going back without losing answers.
- **Ask for permissions at the moment of need**, after explaining what the user gets; a refused
  permission leaves a working product, not a dead end.
- **Skip is a real option** wherever a step is optional, at touch size, never a faint link.
- **Money or personal data** (bank linking, ID checks): say what is collected, why, who sees it and
  how to remove it, before the request; no pre-ticked consents; nothing moves except feedback.
- Motion between steps orients (forward enters from the inline end, back reverses) and stays at
  `duration.slow` or less (10).

## Payments and paywalls

- What the user gets, the real price and the billing period stated plainly.
- A close control visible without scrolling, at least the minimum touch size.
- No pre-ticked add-ons; a "no auto-renewal" line where true.
- Real timers and real limits only.
- On failure: say whether money moved, what is safe, and how to retry or get help.
