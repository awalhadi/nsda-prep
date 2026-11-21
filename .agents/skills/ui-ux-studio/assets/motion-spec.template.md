# Motion: <name of the animation or interaction>

**Where:** <screen / component>   **Trigger:** <tap, hover, route change, data arrives, scroll position, none (load)>
**Job (one of):** feedback / orientation / state change / attention / continuity
**Why it is needed:** <one sentence; if you cannot write it, cut the animation>

## What moves
| Element | Property (transform / opacity only) | From | To | Token (duration, easing or spring) |
|---|---|---|---|---|
| | | | | |

Origin: <transform-origin, the trigger it grows from>
Direction: <forward / back; mirrored in RTL?>

## Choreography
```
0 ms     container fades and rises 14 px   (duration.base, ease.out)
+40 ms   item 1                            (stagger 40 ms, max 6 items)
+80 ms   item 2
…        rest arrive together
exit     all at once, duration.base exit (130 ms), ease.in
```
Total length: ___ ms (≤ 600 ms, or ≤ duration.slow for navigation)

## Interruption and repeats
- A new action mid-animation: <reverses from the current value / jumps to the final state>
- Rapid repeats: <final state set explicitly; no reliance on animation-end events>
- Input during the animation: never blocked

## Gestures (if any)
- Tracks the finger 1:1; release continues with velocity into <spring token>
- Threshold to start: ___ px   Dismiss when: <distance or velocity>
- Button and keyboard alternative: <control>

## Reduced motion
<what replaces it: a fade at duration.fast, or the final state instantly; which loops stop>

## Platform notes
<web: CSS / View Transitions / library · iOS · Android · desktop; haptics, if any, and the system setting they follow>

## Performance
- Target: 60 fps on <low-end device>
- `will-change` only during the animation; paused when off screen; cleaned up on unmount
- Asset budget (Lottie or Rive): ___ KB

## Acceptance criteria
- **AC:** Given <trigger>, then <element> reaches <final state> within <duration> using <token>.
- **AC:** Given reduced motion is on, then <fallback>.
- **AC:** Given the user acts again mid-animation, then <result>, with no input lost.
