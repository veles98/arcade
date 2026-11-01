---
name: minimal-story
description: Minimal motivational graphic animation - black background, one white dot, thin lines and bars that grow into a simple visual metaphor with one short line of text. Use when the user types /minimalistic-graphics or /minimal-story or asks for a minimal, aesthetic, quote or motivational animation.
---

# minimal-story

Make a quiet, elegant animation where one tiny shape tells the whole idea, like a design-studio quote card.

## Scene
1. **Frame (t=0, already visible):** pure black `#000`. One white dot (18 px) in the centre, breathing gently.
2. **Metaphor:** turn the user's idea into ONE simple visual made only of thin white lines (2 px), outlined rectangles and the dot. Examples: "every step feels small" becomes outlined bars of rising height appearing left to right while the dot hops onto each; "consistency" becomes a line that keeps extending in small steps; "you are not behind" becomes two dots on separate paths that both reach the top. The dot is the hero and moves along the metaphor.
3. **Payoff:** at the end, a wrapper scales down to reveal the whole shape, and the dot glows (a white ring pulse and a few tiny star dots twinkling around it).
4. **Text:** one short line in white, 40 px, weight 300, letter-spacing 1px, in the top third. It appears in two parts that match the motion: the first half at the start, the second half at the payoff ("every step feels small" ... "until you look back"). Fade with a slight rise, never a typewriter.
5. **Pace:** slow and calm: `power2.inOut` and `sine.inOut`, 0.6 to 1 s per move, nothing bouncy.

## Content
Take the user's sentence or theme. Default: "every step feels small" / "until you look back".

## Output contract
- Reply with ONE self-contained HTML file as an artifact. No explanation before it; one short line after it at most.
- The only external script allowed: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`. No images, no other libraries, no external fonts. Use `font-family: -apple-system, "SF Pro Display", "Segoe UI", Inter, system-ui, sans-serif`. Draw everything with HTML, CSS and inline SVG.
- Build on a fixed 1080x1920 (9:16) stage and scale it to fit the window: `transform: scale(min(innerWidth/1080, innerHeight/1920))`, centred, recomputed on resize. The page background outside the stage matches the stage edge colour, so it looks full-screen on a phone.
- It plays by itself on load: one GSAP timeline, 6 to 9 seconds, then holds the final frame 2 seconds and restarts (`repeat:-1, repeatDelay:2`). Tapping the stage restarts it.
- Motion quality: every element enters with an ease (`power3.out`, `expo.out` or `back.out(1.6)`), never linear except for drawing lines and counting numbers. Stagger related items by 0.06 to 0.15 s. Nothing pops in without motion. Keep one focal point at a time.
- Text: real content from the user's request (never lorem ipsum). If the user gives no details, invent specific, believable ones. Keep all text inside the stage with 80 px margins. Right-to-left languages get `dir="rtl"` on their text blocks, and words are separated by real spaces (never adjacent inline elements with no space between them, or the letters join across words).
- Composition fills the phone screen: the main content is centred vertically and uses at least 60% of the stage height. No big empty bands at the top or bottom.
- Before you answer, check: the first frame is not empty (something is already visible at t=0), nothing overlaps, nothing leaves the stage, and the loop restart is clean (use `fromTo` tweens so a restart resets every element).
