---
name: follower-graph
description: Animated growth chart video - a big number that counts up while a smooth curve draws itself, the "0 to 100K followers" look. Use when the user types /graph or /follower-graph or asks for an animated growth chart, follower count, revenue, views or any number-going-up animation.
---

# follower-graph

Make a clean keynote-style growth animation: one huge number counting up and a curve that draws itself underneath.

## Scene
1. **Frame (t=0, already visible):** white background `#ffffff` (or `#0b0b0f` if the user says dark). A small grey label above the number ("Followers", or the metric the user names), 40 px, `#8a8f98`.
2. **Big number:** 260 px, weight 800, tabular numbers, letter-spacing -4px. Counts from the start value to the end value over about 4 s: one tween with `power2.in` to 35% of the value, then one with `power3.out` to the end, so it feels like real growth (slow, a surge, then settling). Thousands separators.
3. **Curve:** an SVG chart under the number, about 900 x 900 px so the number and chart together fill the middle of the stage: month labels along the bottom (Jan to Sep, small grey), a smooth hockey-stick curve (flat for 60% of the width, then rising sharply), stroke 6 px near-black (white in dark mode). Draw it in sync with the counter with `strokeDashoffset`. A soft gradient fill under it fades in after the line.
4. **End dot:** a solid dot rides the tip of the line (sample with `getPointAtLength`) and pulses once with a ring at the end.
5. **Badge:** when the count finishes, a small green pill pops in next to the number with the growth ("+312%", computed from start and end, or "+100K" when the start is 0), `back.out(2)`.

## Content
Use the user's numbers and metric. Default: Followers, 0 to 100,000, Jan to Sep.

## Output contract
- Reply with ONE self-contained HTML file as an artifact. No explanation before it; one short line after it at most.
- The only external script allowed: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`. No images, no other libraries, no external fonts. Use `font-family: -apple-system, "SF Pro Display", "Segoe UI", Inter, system-ui, sans-serif`. Draw everything with HTML, CSS and inline SVG.
- Build on a fixed 1080x1920 (9:16) stage and scale it to fit the window: `transform: scale(min(innerWidth/1080, innerHeight/1920))`, centred, recomputed on resize. The page background outside the stage matches the stage edge colour, so it looks full-screen on a phone.
- It plays by itself on load: one GSAP timeline, 6 to 9 seconds, then holds the final frame 2 seconds and restarts (`repeat:-1, repeatDelay:2`). Tapping the stage restarts it.
- Motion quality: every element enters with an ease (`power3.out`, `expo.out` or `back.out(1.6)`), never linear except for drawing lines and counting numbers. Stagger related items by 0.06 to 0.15 s. Nothing pops in without motion. Keep one focal point at a time.
- Text: real content from the user's request (never lorem ipsum). If the user gives no details, invent specific, believable ones. Keep all text inside the stage with 80 px margins. Right-to-left languages get `dir="rtl"` on their text blocks, and words are separated by real spaces (never adjacent inline elements with no space between them, or the letters join across words).
- Composition fills the phone screen: the main content is centred vertically and uses at least 60% of the stage height. No big empty bands at the top or bottom.
- Before you answer, check: the first frame is not empty (something is already visible at t=0), nothing overlaps, nothing leaves the stage, and the loop restart is clean (use `fromTo` tweens so a restart resets every element).
