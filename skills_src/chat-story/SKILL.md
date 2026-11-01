---
name: chat-story
description: Animated text-message conversation video - an iMessage or WhatsApp style chat where bubbles appear one by one with typing dots, read receipts and a punchline at the end. Use when the user types /chat-story or asks for an animated chat, text conversation, DM story or texting skit.
---

# chat-story

Make a short, funny or dramatic texting story that plays like a real phone screen.

## Scene
1. **Phone UI (t=0, already visible):** a full-stage chat screen. Header with a back arrow, a round avatar (initials on a colour), the contact name and a small "online" or "iMessage" subtitle. iMessage style by default: white background, sent bubbles `#0a84ff` with white text, received `#e9e9eb` with black text. WhatsApp style if asked: wallpaper `#efe7de`, sent `#d9fdd3`, received white, with ticks.
2. **Messages:** 6 to 8 bubbles that fill the screen from the header down to the input bar, max width 72%, 50 px text, 26 px radius with the tail corner. Before each received message show a typing bubble with three bouncing dots for 0.6 to 1 s. Each bubble enters with scale 0.6 to 1 and y 30 to 0 (`back.out(1.7)`) from its own corner, and the list scrolls up smoothly once it fills the screen.
3. **Rhythm:** quick exchanges early (0.5 s apart), a longer pause before the last message, which is the punchline. Under the last sent message, "Read 9:41" fades in.
4. **Typing:** an input bar sits at the bottom. For each sent message, the text first appears in the input field a few letters at a time, the send button pulses, then the bubble flies up into the chat.
5. **End beat:** the punchline bubble gets a small tap-back reaction (a heart or "Haha" chip) that pops onto its corner.

## Content
Write the conversation from the user's idea in the user's language (right-to-left languages: bubbles keep their sides, text gets `dir="rtl"`). The punchline lands in the last message. Default idea: a friend asks to borrow money and the replies escalate.

## Output contract
- Reply with ONE self-contained HTML file as an artifact. No explanation before it; one short line after it at most.
- The only external script allowed: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`. No images, no other libraries, no external fonts. Use `font-family: -apple-system, "SF Pro Display", "Segoe UI", Inter, system-ui, sans-serif`. Draw everything with HTML, CSS and inline SVG.
- Build on a fixed 1080x1920 (9:16) stage and scale it to fit the window: `transform: scale(min(innerWidth/1080, innerHeight/1920))`, centred, recomputed on resize. The page background outside the stage matches the stage edge colour, so it looks full-screen on a phone.
- It plays by itself on load: one GSAP timeline, 6 to 9 seconds, then holds the final frame 2 seconds and restarts (`repeat:-1, repeatDelay:2`). Tapping the stage restarts it.
- Motion quality: every element enters with an ease (`power3.out`, `expo.out` or `back.out(1.6)`), never linear except for drawing lines and counting numbers. Stagger related items by 0.06 to 0.15 s. Nothing pops in without motion. Keep one focal point at a time.
- Text: real content from the user's request (never lorem ipsum). If the user gives no details, invent specific, believable ones. Keep all text inside the stage with 80 px margins. Right-to-left languages get `dir="rtl"` on their text blocks, and words are separated by real spaces (never adjacent inline elements with no space between them, or the letters join across words).
- Composition fills the phone screen: the main content is centred vertically and uses at least 60% of the stage height. No big empty bands at the top or bottom.
- Before you answer, check: the first frame is not empty (something is already visible at t=0), nothing overlaps, nothing leaves the stage, and the loop restart is clean (use `fromTo` tweens so a restart resets every element).
