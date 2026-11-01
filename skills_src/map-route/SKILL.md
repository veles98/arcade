---
name: map-route
description: Animated map-route video in the style of a navigation app - a 3D-tilted city map, a route line that draws itself from start to destination, a moving dot, a destination pin drop and an ETA card. Use when the user types /map-route or asks for an animated map, route, trip, delivery or "how to get there" animation.
---

# map-route

Make a short looping animation of a trip on a stylised city map, like a premium navigation app.

## Scene
1. **Map (t=0, already visible):** a tilted city block grid (CSS `perspective` + `rotateX(50deg)` on a plane larger than the stage). Light theme: background `#eef1f4`, blocks as soft white extruded boxes (top face `#ffffff`, side face `#d9dee5`) with varied heights, a few green parks (`#a8dba0`) and one blue water strip. Dark theme if the user says night: `#0f1218`, blocks `#1c222c` / `#141921`.
2. **Route:** an SVG path on the map plane that follows the streets with 2 to 4 turns. Draw it with `strokeDashoffset` from full length to 0 over about 3 s (`power1.inOut`), stroke `#2f80ff`, width 22 px, round caps, over a 40 px wide translucent glow.
3. **Moving dot:** a white-ringed blue dot travels along the path in sync with the drawing. MotionPathPlugin is not available: sample points with `path.getPointAtLength` inside an `onUpdate`.
4. **Camera:** slowly pan and zoom the map plane so the dot stays near the centre (scale 1 to 1.25 over the trip).
5. **Pin:** at the end a destination pin drops from above (`back.out(2)`) with a ring pulse under it.
6. **ETA card:** a rounded frosted card slides up from the bottom: big time ("12 min"), distance ("4.3 km"), destination name and a coloured arrival time. Numbers count up.

## Content
Use the user's start and destination if given (any language). Otherwise: "Home" to a believable local cafe.

## Output contract
- Reply with ONE self-contained HTML file as an artifact. No explanation before it; one short line after it at most.
- The only external script allowed: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`. No images, no other libraries, no external fonts. Use `font-family: -apple-system, "SF Pro Display", "Segoe UI", Inter, system-ui, sans-serif`. Draw everything with HTML, CSS and inline SVG.
- Build on a fixed 1080x1920 (9:16) stage and scale it to fit the window: `transform: scale(min(innerWidth/1080, innerHeight/1920))`, centred, recomputed on resize. The page background outside the stage matches the stage edge colour, so it looks full-screen on a phone.
- It plays by itself on load: one GSAP timeline, 6 to 9 seconds, then holds the final frame 2 seconds and restarts (`repeat:-1, repeatDelay:2`). Tapping the stage restarts it.
- Motion quality: every element enters with an ease (`power3.out`, `expo.out` or `back.out(1.6)`), never linear except for drawing lines and counting numbers. Stagger related items by 0.06 to 0.15 s. Nothing pops in without motion. Keep one focal point at a time.
- Text: real content from the user's request (never lorem ipsum). If the user gives no details, invent specific, believable ones. Keep all text inside the stage with 80 px margins. Right-to-left languages get `dir="rtl"` on their text blocks, and words are separated by real spaces (never adjacent inline elements with no space between them, or the letters join across words).
- Composition fills the phone screen: the main content is centred vertically and uses at least 60% of the stage height. No big empty bands at the top or bottom.
- Before you answer, check: the first frame is not empty (something is already visible at t=0), nothing overlaps, nothing leaves the stage, and the loop restart is clean (use `fromTo` tweens so a restart resets every element).
