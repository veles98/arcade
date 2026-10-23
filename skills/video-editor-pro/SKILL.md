---
name: video-editor-pro
description: Edit playbook for short vertical AI/gamedev explainer videos (Instagram Reels, TikTok, YouTube Shorts) in Arabic, built with ffmpeg/Python/Blender on Windows. Use whenever cutting, assembling, captioning, mixing, colour-grading or exporting a short video, when the creator says an edit "looks cheap/noisy/amateur", or before publishing any clip (run the QA checklist).
---

# Video Editor Pro — calm "smart AI explainer" edits


Target look: a clean, confident tech explainer. Think Screen-Studio-style screen
recordings (floating window, rounded corners, soft shadow, calm gradient behind,
eased auto-zooms on the action) cut with a clear voice-over and quiet sound design.
Viewers should feel "this person knows what they are doing", not "this is loud".

Tools: ffmpeg at (ffmpeg on PATH)
(9.x, has libass+harfbuzz+fribidi, xfade, loudnorm, afftdn, arnndn, sidechaincompress).
Python: Pillow, numpy, faster-whisper, arabic-reshaper, python-bidi, uharfbuzz.
Pillow has NO raqm here, so shape Arabic yourself (see `motion-designer` skill).
Related: `creator-studio` (router), `sound-designer` (music/SFX licences, VO presets),
`motion-designer` (graphics), `thumbnail-designer` (covers).

## Hard rules (never break)
1. No emoji in on-screen text, captions, titles or end cards.
2. No loud red/white full-frame flashes, no strobe, no glitch-shake spam.
3. Never reuse the same whoosh/riser/pop twice in one video. Max ~6–8 SFX accents per minute.
7. Captions render the SCRIPT's words with Whisper's timings — never Whisper's spelling.

- `script_vNN.py`: lines (L01…) with `*keyword` and `|` pause marks = single source of truth.
- `comp.py`: numpy compositor; scenes are functions of t; every beat anchored to a word
  (`wd("L05","ينفذ")`), so any voice re-times the edit. Windows with rounded corners + soft
- `timing.py`: faster-whisper medium (audio decoded by our ffmpeg — PyAV path in faster-whisper is
  broken here), fuzzy char alignment to the script, last-good-take per line, silence cut
  (inside line 0.30 s, [وقفة] 0.55 s, between lines 0.22–0.42 s), proportional fallback when the
  voice does not match (lets you test with an old voice).
- `finish.py <voice>`: all of the above + 5 parallel chunks per format + mux + covers + QA_*.md
  with contact sheets, black-frame and loudness checks. `--test` for trial voices, `--preview`
  for a silent pre-build from provisional timing.
4. Never use a still image when real footage of the thing exists (game capture,
   screen recording, Blender viewport). Stills only for quotes, diagrams, screenshots of text.
5. Never ship without the QA checklist at the bottom passing.

## Format
- 1080x1920, 30 fps (60 only for fast game capture), H.264 High, yuv420p, BT.709,
  CRF 18, preset slow, AAC 48 kHz 192 kb/s, `-movflags +faststart`.
- Length: 25–45 s default; up to 60–90 s only if the story needs it (completion rate beats length).
- Safe area (9:16): keep text/faces inside x 90–990, y 220–1480. Bottom ~420 px is
  covered by UI (caption, buttons) on Reels/TikTok; right ~120 px has the action rail.

## Structure and pacing (per second)
| Time | Job |
|---|---|
| 0.0–1.5 s | Hook: the result/payoff or the surprising claim on screen + spoken + as text. Motion in frame 1, no logo, no "hi guys". |
| 1.5–3 s | Open loop: why it matters / what we will see. |
| 3–Ns | Body: one idea per beat, a visual change every 1.5–3 s (cut, zoom, overlay, B-roll). |
| last 2–4 s | Payoff + one CTA (comment keyword / follow for part 2). Loop-friendly last frame if possible. |

- Remove every breath gap > 0.25 s and every filler ("يعني", "اممم") with jump cuts; hide
  the jump with a 105–110% punch-in or a cut to the screen recording.
- Visual change cadence: calm explainer 2–3 s; energetic segment 0.8–1.5 s.

### Calm vs energetic
- Calm (default): tutorials, "how I built X", AI workflow explainers. Eased zooms,
  crossfades/slide 8–12 frames, soft music bed, 2–4 accents total.
- Energetic: game combat reveals, before/after, "watch this" moments. Hard cuts on
  the beat, punch zooms 3–4 frames, one impact accent per hit — still within the
  6–8/min cap and no flashes. Switch back to calm right after; contrast is the point.

## The Screen-Studio look in ffmpeg
Background gradient + rounded window + shadow, recording centred at ~88% width:
```bash
FF=ffmpeg
# 1) calm gradient background (deep navy -> teal), 1080x1920
$FF -f lavfi -i "gradients=s=1080x1920:c0=0x0F172A:c1=0x134E4A:x0=0:y0=0:x1=1080:y1=1920:d=40:speed=0.002" -t 40 bg.mp4
```
Rounded corners + shadow are easiest as a Python-made PNG mask (alpha) applied with `alphamerge`:
```python
from PIL import Image, ImageDraw, ImageFilter
W,H,R = 950, 534, 28              # window size, corner radius
m = Image.new("L",(W,H),0); ImageDraw.Draw(m).rounded_rectangle((0,0,W-1,H-1),R,fill=255); m.save("mask.png")
s = Image.new("RGBA",(W+120,H+120),(0,0,0,0)); d=ImageDraw.Draw(s)
d.rounded_rectangle((60,75,60+W,75+H),R,fill=(0,0,0,110)); s.filter(ImageFilter.GaussianBlur(28)).save("shadow.png")
```
```bash
$FF -i bg.mp4 -i rec.mp4 -loop 1 -i mask.png -loop 1 -i shadow.png -filter_complex "\
[1:v]scale=950:534,format=rgba[r];[2:v]format=gray[m];[r][m]alphamerge[win];\
[0:v][3:v]overlay=(W-w)/2:(H-h)/2-40:shortest=1[b1];[b1][win]overlay=(W-w)/2:(H-h)/2-40:shortest=1" \
-c:v libx264 -crf 18 -pix_fmt yuv420p out.mp4
```
Both overlays need `shortest=1`: `-loop 1` image inputs are infinite and the render
never ends otherwise (tested .
### Eased auto-zoom
Never linear. Use smoothstep easing over 12–18 frames, hold, ease out. Do zooms in
Python (crop+resize per frame with numpy/Pillow, piping raw frames to ffmpeg) — `zoompan`
jitters on sub-pixel moves. Zoom to 1.4–1.8x on the click/region, never > 2.2x.
```python
def ease(t): return t*t*(3-2*t)          # smoothstep 0..1
# z(t) = 1 + (Z-1)*ease(clamp((t-t0)/0.5)) ; centre lerps with the same ease
```
Optional: smoothed cursor (moving-average 6–8 frames) + soft click ripple (circle,
alpha 0.35 -> 0, 10 frames).

## Transitions
- Default: hard cut. Between sections: `xfade=transition=fade|smoothleft|slideup:duration=0.3`.
- Allowed sparingly: zoom-through (scale 1 -> 1.15 + 6 px motion blur), whip-pan only in energetic segments.
- Forbidden: star wipes, spins, flash-to-white, glitch packs, more than one transition type per section.
```bash
$FF -i a.mp4 -i b.mp4 -filter_complex "[0][1]xfade=transition=smoothleft:duration=0.3:offset=4.7" ...
```

## Captions (word-level, Arabic)
1. Transcribe with faster-whisper, word timestamps:
```python
from faster_whisper import WhisperModel
m = WhisperModel("large-v3", device="cuda", compute_type="float16")   # cpu+int8 if no GPU
segs,_ = m.transcribe("vo.wav", language="ar", word_timestamps=True, vad_filter=True)
words = [(w.word.strip(), w.start, w.end) for s in segs for w in s.words]
```
2. Proof-read words against the script (Whisper misspells English tech terms; keep
   tool names in Latin: "Unreal", "Blender", "ChatGPT").
3. Group into chunks of 2–4 words (≤ 22 chars), never split a name.
4. Render with libass (`.ass`); this ffmpeg build shapes Arabic via HarfBuzz+FriBidi.
   Style: Dubai Bold (or Tajawal/Cairo ExtraBold if installed), 74–86 px, warm white,
   6–8 px dark outline or rounded box (`BorderStyle=3`, back `&H66000000`), ONE accent
   for the active word (teal `&H00D4C22D`, BGR order). No rainbow, no per-word bounce.
   Centre y 1250–1420 (above the UI zone). `Encoding=178`.
5. Generate the file with the bundled helper (word highlight done the safe way):
```bash
$FF -i in.mp4 -vf "ass=caps.ass" -c:a copy out.mp4   # libass finds Windows system fonts itself
```
   `words.json` = `[{"w":"هذا","s":0.10,"e":0.42}, ...]` from step 1.

### libass Arabic traps (all tested , ffmpeg 9.0.2 gyan essentials)
- NEVER put an override tag in the middle of an Arabic line (`هذا {\c..}الذكاء{\c..} ...`):
  word order scrambles, even with U+202B/U+2067 controls. Tags go only in the leading block.
- Mixed Arabic+Latin lines ("... في Unreal 5") render with LTR base unless wrapped in
  U+202B ... U+202C (RLE/PDF). Always wrap.
- Word highlight = layer 0 full line white + layer 1 same line in accent with
- `ffmpeg drawtext` shapes letters but puts Latin on the wrong side: titles go through libass too.
- Do NOT pass `fontsdir=C:/...` from Git Bash (MSYS rewrites the path); use PowerShell
  or `MSYS_NO_PATHCONV=1` if a custom font folder is needed.
Key on-screen titles (not captions): max 5–7 words, appear with a 6–8 frame fade+rise 20 px.

## Audio mastering chain
Order: clean voice -> EQ -> compress -> de-ess -> mix with ducked music + SFX -> loudnorm.
```bash
# Voice (mono 48k): gentle denoise, high-pass, presence, compression, de-ess
$FF -i vo_raw.wav -af "highpass=f=80,afftdn=nr=10:nf=-45:tn=1,\
equalizer=f=250:t=q:w=1:g=-2,equalizer=f=3500:t=q:w=1.2:g=2.5,equalizer=f=11000:t=h:w=1:g=1.5,\
acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=3,deesser=i=0.4" -ar 48000 vo.wav
```
- Denoise gently (`nr` 6–12). Over-denoising = robotic voice. `arnndn` only for bad rooms (needs an `.rnnn` model file).
- Music ducking ≥ 18 dB under speech:
```bash
$FF -i vo.wav -i music.wav -filter_complex "[1:a]volume=-6dB[m];[0:a]asplit[v][sc];\
[m][sc]sidechaincompress=threshold=0.02:ratio=20:attack=15:release=350:makeup=1[md];\
[v][md]amix=inputs=2:normalize=0[mix]" -map "[mix]" mix.wav
```
  Measure: music alone under speech should sit ~18–24 dB below voice. If the
  compressor cannot reach it, pre-lower the bed to -20 dB and automate `volume` with `enable='between(t,a,b)'`.
- Final loudness: -14 LUFS integrated, -1.0 dBTP, LRA ≤ 11, two-pass:
```bash
$FF -i mix.wav -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null -   # read measured_*
$FF -i mix.wav -af loudnorm=I=-14:TP=-1:LRA=11:measured_I=..:measured_TP=..:measured_LRA=..:measured_thresh=..:offset=..:linear=true -ar 48000 master.wav
```
### SFX restraint
- Budget: ≤ 6–8 accents/min. Each accent must mark something (section change, reveal, result).
- Keep a used-SFX list per video; each file used at most once. Vary pitch ±2 semitones only as a last resort.
- SFX level -18 to -24 dB under voice peak; soft UI clicks/ticks > big whooshes.
- Music: calm lo-fi/ambient/minimal electronic, licence-clean, no vocals under speech.

## Colour
- Calm palettes: deep navy/charcoal backgrounds (#0F172A, #111827), one accent
  (teal #2DD4BF or soft violet #A78BFA), warm white text (#F8FAFC). Max 3 colours + neutrals.
- Game footage: gentle grade only — `eq=contrast=1.04:saturation=1.06:gamma=0.98`,
  or a `.cube` LUT via `lut3d`. Never crush blacks, never oversaturate skin.
- Keep brand colours identical across videos (store in the style library, see `trend-scout`).

## Assembly workflow
1. Script (hook line first) -> record VO -> clean VO -> transcribe.
2. Cut VO tight (gap removal) -> build an edit decision list (JSON: clip, in, out, effect).
3. Render visuals per segment in Python/ffmpeg -> concat -> captions -> mix -> master -> mux.
4. Export a 1-frame contact sheet every 2 s (`fps=0.5,tile=4x4`) and review it before QA.

## QA checklist (all must pass)
- [ ] Frame 1 has motion and the hook text; hook lands in ≤ 1.5 s.
- [ ] No emoji anywhere on screen; no red/white flash; no strobe.
- [ ] No still where video of the same thing exists.
- [ ] Every caption matches the spoken word, Arabic shaped (letters joined, RTL order correct), inside safe area.
- [ ] Visual change at least every 3 s; no dead air > 0.3 s.
- [ ] SFX count ≤ 8/min and no file used twice (list them).
- [ ] Music ≥ 18 dB under voice during speech; no clipping.
- [ ] Integrated -14 LUFS ±1, true peak ≤ -1 dBTP (verify with `ebur128` filter).
- [ ] 1080x1920, yuv420p, faststart, plays in a phone player; no black frames at head/tail (`blackdetect`).
- [ ] Ending loops or gives one clear CTA; brand colours/fonts match the style library.

## Export rule
Always export a second version without our music bed/SFX (voice-only, or silent for wordless reels) so the creator can add Instagram trending music without clashing.

## Engagement and retention (every short)
- Numbered series tag on screen + cover + caption («حيلة الأسبوع — ٢»).
- One calm CTA card at 60–70 % of the runtime (save, send to a friend, or a comment keyword); never in the first 3 s.
- End card = a follow reason tied to the next episode.
- Structure: Hook -> open loop -> rehook at ~40% -> second open loop -> payoff at the end.
- Topic test: "does a non-tech person care?" Favour warnings, money, daily life and visual challenges.
