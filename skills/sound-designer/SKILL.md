---
name: sound-designer
description: Sound for short explainer videos — music selection by mood from free, licence-clean sources only, SFX library rules and restraint, the one-command Voice Studio (voice_studio/studio.py: AI denoise, auto-edit of silences/fillers/retakes, studio chain, -14 LUFS, word timings), voice recording tips, ducking and loudness targets per platform. Use when choosing music or SFX, cleaning a voice-over, fixing "the audio sounds cheap/loud/muddy", or checking licences before upload.
---

# Sound Designer

Principle: the voice is the product. Music is a bed, SFX are punctuation. Calm,
premium, never busy. House rules: no repeated SFX file in one video, max ~6–8
accents per minute, no harsh risers/booms under explanations.

## Licence-clean sources only (verify the licence page on the day you download)
| Source | Licence | Notes |
|---|---|---|
| YouTube Audio Library | per-track (some need attribution) | safest for YouTube; read each track's terms for IG/TikTok |
| Pixabay Music / SFX | Pixabay Content License (free, commercial, no attribution) | some tracks get false Content ID claims: save the licence page + download date |
| Freesound.org | CC0 / CC-BY / CC-BY-NC per sound | use CC0 or CC-BY only; NC is forbidden; credit CC-BY in the description |
| Sonniss GDC bundles | royalty-free, commercial | huge pro SFX sets, free yearly |
| Kenney.nl audio | CC0 | UI clicks, interface sounds |
| Incompetech (Kevin MacLeod) | CC-BY 4.0 | credit required; recognisable, use sparingly |
| In-app libraries (IG/TikTok) | licensed in-app only | add at publish time in the app, never bake into the file |
Never use: ripped commercial songs, "no copyright music" YouTube re-uploads of
unknown origin, NC licences, anything the creator cannot prove.
Keep `./audio\LICENCES.md`: file, source URL, licence,
date, attribution line.

## Music by mood
| Video type | Mood | Genre/BPM | Level under VO |
|---|---|---|---|
| Tool explainer | focused, curious | minimal electronic / lo-fi, 80–100 BPM, no vocals | -20 to -24 dB under VO |
| Reveal / before-after | lift | build that resolves on the reveal cut | -16 dB on the reveal only |
| News/opinion | neutral | very sparse pulse or none | -24 dB or silence |
| Game combat clip | energy | the game's own audio first; music only if none | game audio -10 dB under VO |
- Cut music on phrase boundaries (4/8 bars); fade 0.3–0.6 s; end on the downbeat.
- Silence is allowed: dropping music for 1–2 s before a key line is a strong accent.

## SFX restraint
- Palette per video (choose before editing, max ~6 different files): 1 soft whoosh,
  1 UI click/tick, 1 subtle pop or chime for list items, 1 low impact for the reveal,
  1 paper/keyboard foley. Each file is used once; if a second similar accent is needed,
  use a different file from the same family.
- Levels: -18 to -24 dB below VO peaks; high-pass whooshes at 150 Hz so they don't mud the voice.
- Sync accents 1–2 frames BEFORE the visual event (sound perceived as on time).
- Never: laugh tracks, vine booms, airhorns, glitch packs, repeated whoosh on every cut.

## Voice recording
- Quiet small room with soft furnishings; mic 10–15 cm, slightly off-axis; pop filter.
- Record 48 kHz 24-bit, peaks around -12 dBFS. Record 5 s of room tone.
- One take per paragraph; re-take the hook 3 times with different energy.

## Voice: DEFAULT = Voice Studio (one command, 
Every new VO goes through `./voice_studio\studio.py` first:
```bash
python `./voice_studio/studio.py "memo.m4a" [--music bed.wav] [--name v04] [--demo 15]
# or drag the file onto `./voice_studio\studio.bat
```
It does: AI denoise (DeepFilterNet if importable; on this PC it is NOT, because `deepfilterlib` has no
Windows wheel and needs Rust, so it uses RNNoise, Xiph BSD-3, via `pip install --no-deps pyrnnoise`
(Apache-2.0); falls back to ffmpeg afftdn) with an 18 dB attenuation limit plus the dry signal blended
back, so it never goes robotic. Then gentle spectral de-reverb (max 6 dB). Then the auto-edit: faster-whisper
medium word timestamps (glossary `--hint`), silences over 0.35 s cut to 0.15 s, gap content -20 dB
(breaths), fillers (اممم/آآ) cut, retakes cut (the LAST take of a repeated sentence is kept), stutter
repeats cut. Then the studio chain: HPF 80, mud -2 dB, presence +2.5, air +1.5, de-esser, 2 gentle
compressors, limiter, and a two-pass *linear* loudnorm to -14 LUFS / ≤ -1.5 dBTP (dual-mono stereo).
Optional music is calibrated to sit 20 dB under the voice while he speaks (`--music-under`).
Outputs in `voice_studio\out\<name>\`: `_studio.wav`, `_speech_clean.wav` (edited, pre-master),
`_words.json` (word and caption-line timings on the edited timeline, for kinetic captions),
`_edits.json` (pieces + every cut with its reason), and `_report.md/.json` (before/after LUFS, noise floor,
band balance). ALWAYS read the report's cut list. "voice-in-gap" entries are untranscribed sounds;
check they were fillers. `--keep-retakes` / `--no-edit` turn the editing off.
-17.2 → -13.9 LUFS, 61.9 s → 33.6 s. Owner listen-check pending.
Recording tips for the creator: `voice_studio\RECORDING_GUIDE_AR.md`.

dynamic loudnorm on the voice (it pumped), no heavy denoise (robotic):
```bash
$FF -i vo_raw.wav -af "highpass=f=80,afftdn=nr=6:nf=-52,agate=threshold=0.012:ratio=1.6:range=0.5:attack=8:release=250,equalizer=f=180:t=q:w=1.0:g=2,equalizer=f=3000:t=q:w=1.4:g=2,deesser=i=0.2:m=0.4:f=0.5,acompressor=threshold=-20dB:ratio=3:attack=15:release=200:makeup=3,alimiter=limit=0.89:attack=5:release=60:level=disabled" -ar 48000 vo.wav
```
a different passage per video, ducked ≥ 20 dB under speech. For videos that do not feature the
```bash
FF=ffmpeg
# "clean" (good room)
$FF -i vo_raw.wav -af "highpass=f=80,afftdn=nr=8:nf=-48:tn=1,equalizer=f=250:t=q:w=1:g=-2,equalizer=f=3500:t=q:w=1.2:g=2,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=3,deesser=i=0.35" -ar 48000 vo.wav
# "rescue" (noisy room): raise nr to 12-16, add equalizer=f=120:t=q:w=1:g=-3; check for robotic artefacts
```
Tested chain , ffmpeg 9.0.2): filters parse, loudnorm second pass lands within 0.1 LU.

## Mix and master
- Ducking ≥ 18 dB under speech: `sidechaincompress` recipe in `video-editor-pro`.
- Final: two-pass `loudnorm` to -14 LUFS integrated, -1 dBTP, LRA ≤ 11 (all three
  platforms normalise near -14; louder files get turned down and lose punch).
- Verify: `$FF -i final.mp4 -af ebur128=peak=true -f null - 2>&1 | tail -12`.
- Listen once on phone speaker and once on earbuds before export.

## QA
- [ ] Every music/SFX file listed in LICENCES.md with a clean licence.
- [ ] No SFX file repeated; accents ≤ 8/min.
- [ ] Voice intelligible on phone speaker; no sibilance spikes; no pumping.
- [ ] -14 LUFS ±1, ≤ -1 dBTP; music ≥ 18 dB under VO during speech.

## Export rule
Always export a second version without our music bed/SFX (voice-only, or silent for wordless reels) so the creator can add Instagram trending music without clashing.

