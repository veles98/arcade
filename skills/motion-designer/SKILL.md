---
name: motion-designer
description: Design and render animated Arabic typography, line icons, diagrams, lower-thirds, progress bars and end cards for short vertical explainer videos, using Python (Pillow, numpy, uharfbuzz), libass/ffmpeg, or Blender, on Windows. Covers correct Arabic RTL shaping, Windows font choices, easing, and alpha export. Use whenever a video needs on-screen graphics beyond plain captions, or Arabic text must be rendered into an image or 3D scene.
---

# Motion Designer — calm, smart, Arabic-first graphics


Look: minimal line graphics, generous spacing, one accent colour, eased motion. No
emoji, no clip-art, no rainbow gradients, no bounce on everything, no red/white flashes.

## Tools available on this PC (checked 
- ffmpeg 9.0.2 (ffmpeg on PATH) with libass + HarfBuzz + FriBidi.
- Python: Pillow 12 (NO raqm), numpy, uharfbuzz, arabic-reshaper, python-bidi, faster-whisper.
  Not installed: skia-python, moviepy, cv2, freetype-py (`pip install` if truly needed).
- Blender (see blender-* skills). Blender 3D text does NOT shape Arabic.

## Arabic text: pick the right renderer
| Need | Use | Why |
|---|---|---|
| Captions, titles, lower-thirds, animated text over video | libass (`.ass`) via ffmpeg | Real HarfBuzz shaping, bidi, `\fad \move \t \blur \clip` animation |
| Text into a PNG with alpha (for compositing or Blender) | libass on a transparent canvas | same quality, alpha out |
| Quick Pillow drawing | arabic-reshaper + python-bidi + a font WITH presentation forms | Pillow here has no raqm |
| Blender 3D text | reshaped string + font with presentation forms, or image plane from libass PNG | Blender text has no shaping |

snippets with OFL fonts (Cairo Black/Bold, Reem Kufi) to one transparent PNG, then crops each cell
bidi, gold gradient text (`background-clip:text`), pills, bubbles, numbered badges.

Tested traps:
- «·» (middle dot) between Arabic text and Arabic-Indic digits reads as «٠»: "— ١" not "· ١".
- Reem Kufi's Arabic-Indic digits look like letters (١ ≈ ا): set digits/numbers in Cairo.
- RTL diagrams: loops read right -> top -> left -> bottom; flows and wipes run right-to-left.
  text, gold #D2B37A accent (gradient #fff3c4 -> #c8902f for titles), green #9FC08A = success,
  muted rose #C48C7C = error (never red).
- Dubai, Arabic Typesetting, Aldhabi, Arabic Square lack U+FE80 (isolated hamza) or all
  presentation forms: with arabic-reshaper the "ء" shows as a box. Pillow/Blender path:
  use Segoe UI Bold, Tahoma Bold, Arial Bold, Sakkal Majalla Bold, Simplified Arabic, Andalus.
  With libass, Dubai is fine (HarfBuzz uses the font's own shaping).
- libass: wrap every Arabic line in U+202B...U+202C or mixed Latin lands on the wrong side.
- libass: never put override tags mid-line in Arabic (word order scrambles). Animate per
  line/layer with tags in the leading block; highlight words with `\clip` layers
- ffmpeg `drawtext` (text_shaping=1) joins letters but orders mixed lines LTR: avoid for Arabic.

### Text to transparent PNG / alpha MOV via libass (tested)
```bash
FF=ffmpeg
$FF -f lavfi -i "color=c=black@0.0:s=1080x1920:d=2:r=30,format=rgba" -vf "ass=title.ass:alpha=1" -c:v qtrle title.mov
$FF -ss 1 -i title.mov -frames:v 1 -update 1 title.png        # one RGBA still
```
Animated title line (leading block only):
```
Dialogue: 0,0:00:00.00,0:00:02.00,T,,0,0,0,,{\an5\pos(540,960)\fad(250,200)\blur0.6\t(0,300,\fscx100\fscy100)\fscx94\fscy94}<U+202B>كيف صنعت لعبة بالذكاء الاصطناعي في Unreal 5<U+202C>
```
(write the real control characters from Python: `"\u202b" + text + "\u202c"`).

### Pillow path (only with a presentation-form font)
```python
import arabic_reshaper
from bidi.algorithm import get_display
from PIL import Image, ImageDraw, ImageFont
f = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 72)
s = get_display(arabic_reshaper.reshape("صنعت لعبة بالذكاء الاصطناعي"))
```
Supersample: draw at 2x then `resize(..., Image.LANCZOS)` for clean edges.

## Fonts (Windows, licence-safe for video)
- Installed and good: Dubai (Light/Regular/Medium/Bold) — modern, clean, best default
  with libass; Segoe UI (Arabic) — neutral UI look; Sakkal Majalla — classic naskh for
  quotes; Tahoma — small sizes.
- Recommended free installs (OFL, Google Fonts): IBM Plex Sans Arabic, Tajawal,
  Cairo, Almarai, Noto Kufi Arabic, Readex Pro. Install per-user (right-click > Install)
  and keep the TTF path for HarfBuzz measuring.
- Pair: one Arabic family (2 weights max) + its Latin or Inter for code/tool names.
- Size on 1080x1920: titles 84–120 px, captions 74–86 px, labels 44–56 px; line
  height 1.35–1.5 for Arabic (tall ascenders/descenders); never letter-space Arabic
  (breaks joining), use kashida sparingly only in display titles.

## Motion rules
- Easing: entrances ease-out (cubic/expo out), exits ease-in, moves ease-in-out.
  Durations at 30 fps: small UI 6–9 frames, titles 9–14, scene graphics 15–24.
- Stagger lists 3–4 frames per item. Hold readable text ≥ 1.2 s + 0.3 s per word.
- Motion vocabulary: fade+rise 20–40 px, mask reveal (wipe from right for Arabic,
  following reading direction), scale 94->100%, line draw-on, soft blur-in (6->0 px).
- RTL direction everywhere: progress bars fill right-to-left, arrows/timelines read
  right-to-left, list bullets on the right.
```python
def ease_out_cubic(t): return 1-(1-t)**3
def ease_in_out_cubic(t): return 4*t**3 if t<.5 else 1-(-2*t+2)**3/2
```

## Building blocks (Python frame generators -> ffmpeg pipe)
Render RGBA frames with Pillow/numpy, pipe raw to ffmpeg:
```python
import subprocess, numpy as np
p = subprocess.Popen([FF,"-y","-f","rawvideo","-pix_fmt","rgba","-s","1080x1920","-r","30",
     "-i","-","-c:v","qtrle","out.mov"], stdin=subprocess.PIPE)
for i in range(N): p.stdin.write(frame(i).tobytes())   # frame() returns RGBA PIL image
p.stdin.close(); p.wait()
```
- Line icons: draw with `ImageDraw.line/arc/rounded_rectangle` at 4x, stroke 6–8 px
  (at 1080 width), round caps; draw-on by animating path length. Or use Lucide/Tabler
  SVG icons (MIT) rasterised once per size. No emoji glyphs.
- Diagrams: boxes with 24–32 px radius, 2 px strokes at 40% white, arrows that draw on,
  one node lit in accent at a time to follow the narration.
- Lower-third: rounded panel (#0F172A @ 80%), accent bar 6 px on the RIGHT edge,
  name 56 px + role 40 px; enters with mask wipe right->left 10 frames, holds 3 s.
- Progress/series tag: top area y 220–300, small pill "الحلقة 3" in accent.
- End card (last 2–3 s): next-episode title + one CTA line; no emoji; calm fade.
- Number counters: ease-out over 20–30 frames, tabular digits; choose Arabic-Indic
  (٠١٢) or Western digits once per video and stay consistent.

## Blender path (3D titles, logo reveals, diagram depth)
- Prefer: render text PNG via libass, use as image plane (Import Images as Planes),
  animate the plane (eased keyframes, see `blender-animation`).
- If 3D extruded Arabic is required: reshape + bidi in Python first, use a
  presentation-form font (Segoe UI Bold), check every letter joins in a viewport
  screenshot before rendering.
- Render EEVEE, 1080x1920, PNG RGBA sequence or ProRes 4444, film transparent on.

## Composite
```bash
$FF -i base.mp4 -i gfx.mov -filter_complex "[0][1]overlay=0:0:format=auto" -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a copy out.mp4
```

## QA (graphics)
- [ ] Every Arabic word joined correctly, no boxes, correct RTL order with mixed Latin.
- [ ] Inside 9:16 safe area (x 90–990, y 220–1480); nothing under the caption zone.
- [ ] Max 3 colours + neutrals, accent used for one meaning only.
- [ ] Motion eased, no element moving without purpose, text holds long enough to read.
- [ ] No emoji, no flashes; icons are line icons with consistent stroke.

## Engagement and retention (every short)
- Numbered series tag on screen + cover + caption («حيلة الأسبوع — ٢»).
- One calm CTA card at 60–70 % of the runtime (save, send to a friend, or a comment keyword); never in the first 3 s.
- End card = a follow reason tied to the next episode.
- Structure: Hook -> open loop -> rehook at ~40% -> second open loop -> payoff at the end.
- Topic test: "does a non-tech person care?" Favour warnings, money, daily life and visual challenges.
