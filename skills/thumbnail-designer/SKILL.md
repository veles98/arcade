---
name: thumbnail-designer
description: Design clean, smart covers and thumbnails for Arabic AI/gamedev videos — Instagram Reel covers (9:16 with 3:4 grid crop), TikTok covers, YouTube Shorts frames/custom thumbnails and long-form 16:9 thumbnails — with correct Arabic title rules, safe areas and a consistent series look. Use when a video needs a cover, the profile grid looks messy, or the creator asks for a thumbnail.
---

# Thumbnail Designer


Goal: a cover that reads in 0.5 s at phone-grid size and makes the profile look like
a coherent library. Calm, premium, one idea. No emoji, no arrows-and-circles clutter,
no shocked-face cliché unless the creator wants his face in it, no red/white glare.

## Sizes and safe areas
| Placement | Canvas | Keep title/face inside |
|---|---|---|
| Instagram Reel cover | 1080x1920 | centre 1080x1440 (grid crops 240 px top+bottom, 3:4 since Jan 2025); feed preview crops to ~4:5 too |
| TikTok cover | 1080x1920 | y 300–1400 (UI covers top/bottom); title at 35–55% height |
| YouTube Shorts | 1080x1920 frame (pick frame) or custom upload where available (rolled out to YPP creators) | centre square-ish area |
| YouTube long-form | 1280x720 (export 1920x1080) | avoid bottom-right 260x110 (timestamp) |
Check the grid: render a 3x3 mock of the last 9 covers cropped to 3:4.

## Layout recipe (series look)
- Background: a real frame from the video (game shot, tool UI) slightly darkened
  (brightness -15%, blur 0–4 px behind text area) or the brand gradient (#0F172A -> #134E4A).
- Title: 2–4 Arabic words, max 2 lines, 120–170 px on 1080 width, weight Bold/ExtraBold,
  warm white #F8FAFC; ONE keyword in accent (teal #2DD4BF). Right-aligned or centred,
  never left-aligned Arabic.
- Series pill top-right: "الحلقة 4" in accent, same position every episode.
- Subject: one clear focal object (character, before/after split, tool logo only if
  allowed by its brand guidelines) occupying 40–60% of the safe area.
- Contrast check: title luminance contrast ≥ 4.5:1 against what is behind it.

## Arabic title rules
- Render with libass or a presentation-form font (see `motion-designer`): Dubai via
  libass; Segoe UI Bold / Tahoma Bold via Pillow+reshaper. Verify letters join and
  hamza shows; mixed Latin on the correct side (wrap line in U+202B...U+202C for libass).
- Line height 1.3–1.4; no letter-spacing; break lines at phrase boundaries, never split
  "ال" constructions or a name.
  the hook delivers the tension.

## Render (Pillow, tested pattern)
```python
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter
import arabic_reshaper
from bidi.algorithm import get_display
bg = Image.open("frame.png").convert("RGB").resize((1080,1920))
bg = ImageEnhance.Brightness(bg).enhance(0.85)
d = ImageDraw.Draw(bg)
f = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 140)
w = d.textlength(t, font=f)
d.text(((1080-w)/2, 760), t, font=f, fill=(248,250,252), stroke_width=4, stroke_fill=(15,23,42))
bg.save("cover.png")
```
For Dubai or per-word accent colour, render the title with libass to an RGBA PNG and
paste it (see `motion-designer`, "Text to transparent PNG").

Grab the background frame:
```bash
$FF -ss 12.4 -i final.mp4 -frames:v 1 -update 1 frame.png
```

## Series templates
One template per series: blurred frame of the video, one sharp hero (UI window or object), 2-line title (neutral line + accent line), series pill on top, thin accent frame. Export 1080x1920, its 1080x1440 grid crop, a 1280x720 YouTube thumbnail and a grid preview with the previous covers. Keep all content inside y 240–1680.

## A/B and review
- Make 2 variants (different focal frame or title wording), show the creator both at
  real grid size (270 px wide) side by side.
- After 7 days, compare reach/views from profile vs followers (analytics-reviewer).
- Keep a cover template per series in `./covers\` (PSD-free:
  the Python script + font + colours) so every episode matches.

## QA
- [ ] Readable at 270 px wide; title ≤ 4 words; one accent word.
- [ ] Inside the 3:4 grid crop and TikTok UI safe area.
- [ ] Arabic shaped correctly; no emoji; no glare/flash colours.
- [ ] Matches the series template and style library palette.

## Engagement and retention (every short)
- Numbered series tag on screen + cover + caption («حيلة الأسبوع — ٢»).
- One calm CTA card at 60–70 % of the runtime (save, send to a friend, or a comment keyword); never in the first 3 s.
- End card = a follow reason tied to the next episode.
- Structure: Hook -> open loop -> rehook at ~40% -> second open loop -> payoff at the end.
- Topic test: "does a non-tech person care?" Favour warnings, money, daily life and visual challenges.
