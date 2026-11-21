# 08. Accessibility (WCAG 2.2 AA as the floor)

Accessibility is not a final pass; it is cheaper in the tokens and components than in screens.

## Checklist

**Perceivable**
- [ ] Text contrast at least 4.5:1 (large text, 24 px or 18.66 px bold, at least 3:1), in both themes.
- [ ] Icons, focus rings, input borders and essential UI edges at least 3:1.
- [ ] Never colour alone: every status has an icon or shape and a word.
- [ ] Text scales to 200% without clipping, overlap or horizontal scrolling on main screens.
- [ ] Images and icons that carry meaning have text alternatives; decorative ones are hidden.
- [ ] Charts, heatmaps and treemaps have a table view with the same data.

**Operable**
- [ ] Touch targets: 48 dp Android, 44 pt iOS, 44 px web (WCAG 2.2 minimum is 24 px; aim higher).
- [ ] Everything works by keyboard on the web; tab order follows reading order.
- [ ] Focus is always visible and never hidden behind sticky headers.
- [ ] No keyboard shortcuts on single keys that clash with screen readers or scrolling (Space).
- [ ] No time limits without warning, except where the timing is the point (exams), and then announce milestones.
- [ ] Reduced motion respected everywhere: fades only, no pulsing, sliding, parallax or confetti.
- [ ] Nothing flashes more than 3 times a second.
- [ ] Dragging always has a button alternative; swipe-only actions have visible controls.
- [ ] Dialogs move focus in, keep it inside, close on Escape and return focus to the opener.
- [ ] After a route change, focus moves to the main content (or its heading).
- [ ] Carousels and moving content can be paused and stop on focus and under reduced motion.
- [ ] Sign-in allows password managers and paste; no cognitive test without an alternative.
- [ ] Help that repeats across pages stays in the same place; information already given is not asked again.

**Understandable**
- [ ] Labels are visible, not only placeholders.
- [ ] Errors say what went wrong and how to fix it, next to the field.
- [ ] Language is set on the page or widget so screen readers use the right voice.
- [ ] The same component behaves the same way everywhere.

**Robust**
- [ ] Native elements first (`button`, `input`, `Semantics` in Flutter), ARIA only when needed.
- [ ] Screen readers announce the question, options, selection state, results and timer milestones.
- [ ] Live regions for status changes ("Correct", "Saved"), polite unless urgent, announced as a full phrase without moving focus.
- [ ] Canvas, WebGL and custom-drawn UI expose an accessible equivalent (17).

## Testing

- Automated: axe or Lighthouse on the web, Flutter's semantics tests and accessibility guideline
  checks, the contrast script on the tokens.
- Manual: TalkBack, VoiceOver and a desktop screen reader on the main journeys; keyboard-only run;
  200% font scale; grayscale screenshot (does meaning survive?); sunlight or low-brightness check.
- State which of these were actually run.
