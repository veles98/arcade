---
name: exploded-view
description: Exploded-view product animation - a device (a phone by default) floats in 3D, then its layers separate vertically with labelled callout lines, like an engineering breakdown. Use when the user types /breakdown or /exploded-view or asks to show what is inside a product, its layers, parts or components.
---

# exploded-view

Make a premium "what's inside" animation: an object assembled at first, then its layers fly apart in 3D with callout labels.

## Scene
1. **Stage (t=0, already visible):** dark background `#0d0e12` with a faint radial light behind the object. A small caption at the top in spaced caps: "PHONE / EXPLODED VIEW" (or the user's product), 30 px, `#8b8f99`.
2. **Object:** 5 to 7 layers as rounded rectangles in one 3D container (`perspective: 2200px`; container `rotateX(58deg) rotateZ(-38deg)`, `transform-style: preserve-3d`). Each layer has its own look: cover glass (subtle gradient and a reflection streak), display (vivid gradient with a "9:41" clock), frame (metallic grey border only), logic board (green-grey with small chip squares), battery (dark grey with a label), back glass (frosted colour). Each layer gets a thin top highlight and a soft shadow.
3. **Assemble, then explode:** start stacked tightly (translateZ 0 to 12 px). After 0.8 s, move each layer to its exploded height (translateZ steps of about 110 px) with `expo.out`, staggered 0.08 s, while the whole container slowly rotates (rotateZ -38 to -28 deg) for the whole timeline.
4. **Callouts:** for each layer a thin line (1.5 px, `#5d6270`) draws out to the side from the layer, then its label fades in: number ("01"), part name (white, 34 px, 600) and a tiny spec line ("6.1 in OLED", "Titanium") in grey. Labels line up in one column. Place labels in 2D, outside the 3D container, at the layers' on-screen heights (measure with `getBoundingClientRect` after the explode position is known, or precompute).
5. **Hold:** at the end everything floats gently (yoyo translateY 6 px).

## Content
Use the user's product and parts. Default: a smartphone with the six layers above.

## Output contract
- Reply with ONE self-contained HTML file as an artifact. No explanation before it; one short line after it at most.
- The only external script allowed: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`. No images, no other libraries, no external fonts. Use `font-family: -apple-system, "SF Pro Display", "Segoe UI", Inter, system-ui, sans-serif`. Draw everything with HTML, CSS and inline SVG.
- Build on a fixed 1080x1920 (9:16) stage and scale it to fit the window: `transform: scale(min(innerWidth/1080, innerHeight/1920))`, centred, recomputed on resize. The page background outside the stage matches the stage edge colour, so it looks full-screen on a phone.
- It plays by itself on load: one GSAP timeline, 6 to 9 seconds, then holds the final frame 2 seconds and restarts (`repeat:-1, repeatDelay:2`). Tapping the stage restarts it.
- Motion quality: every element enters with an ease (`power3.out`, `expo.out` or `back.out(1.6)`), never linear except for drawing lines and counting numbers. Stagger related items by 0.06 to 0.15 s. Nothing pops in without motion. Keep one focal point at a time.
- Text: real content from the user's request (never lorem ipsum). If the user gives no details, invent specific, believable ones. Keep all text inside the stage with 80 px margins. Right-to-left languages get `dir="rtl"` on their text blocks, and words are separated by real spaces (never adjacent inline elements with no space between them, or the letters join across words).
- Composition fills the phone screen: the main content is centred vertically and uses at least 60% of the stage height. No big empty bands at the top or bottom.
- Before you answer, check: the first frame is not empty (something is already visible at t=0), nothing overlaps, nothing leaves the stage, and the loop restart is clean (use `fromTo` tweens so a restart resets every element).
