---
name: trend-scout
description: Find and analyse current short-form trends (formats, sounds, edit styles, hooks) for an Arabic AI/gamedev explainer account, and turn your reference screenshots or clips into a precise, reusable style spec. Use when the creator sends a reel/TikTok reference ("make it like this"), asks "what is trending", wants a new format, or before planning a new series. Maintains the style library file.
---

# Trend Scout

## What Claude can and cannot see
- Claude CANNOT browse Instagram or TikTok feeds, Reels audio pages, or logged-in
  analytics (login walls, no API). Do not pretend to have watched a reel.
- Sources that work: (1) your screenshots, screen recordings and downloaded
  clips (best), (2) WebSearch/WebFetch on public articles, creator blogs, YouTube pages,
  platform newsroom posts (about.instagram.com, newsroom.tiktok.com, blog.youtube),
  TikTok Creative Center pages if they load, (3) frame analysis of local video files with ffmpeg.
- Always label findings: "seen in creator reference" vs "from web article (date)" vs "my inference".

## Workspace
`./` (create on first use)
- `style_library.md` — every approved style spec (below). The single source of look truth.
- `trends_log.md` — dated trend notes, each with source and a "use / ignore" verdict.
- `refs\YYYY-MM-DD_<slug>\` — creator reference files + extracted frames.

## 1. Reference clip -> measured spec
When the creator gives a clip (`ref.mp4`):
```bash
FF=ffmpeg
FP=ffprobe
$FP -v error -show_entries stream=width,height,r_frame_rate:format=duration -of json ref.mp4
# cut points (scene changes) -> pacing
$FF -i ref.mp4 -vf "select='gt(scene,0.3)',showinfo" -an -f null - 2>&1 | grep -o "pts_time:[0-9.]*"
# contact sheet, 1 frame / 0.5 s
$FF -i ref.mp4 -vf "fps=2,scale=270:-1,tile=6x5" -frames:v 1 sheet.png
# first 3 s at 10 fps for hook analysis
$FF -i ref.mp4 -t 3 -vf "fps=10,scale=360:-1" hook_%02d.png
# loudness + music/voice balance
$FF -i ref.mp4 -af ebur128=peak=true -f null - 2>&1 | tail -12
```
Then read the sheet/hook frames (Read tool on PNGs) and write the spec.

## 2. Screenshot-only reference
From stills you can measure: layout grid, safe margins, font class (geometric
kufi-like vs naskh vs rounded sans), weight, size as % of frame height, colour hexes
(sample with Pillow), caption position, box/outline style, window treatment (radius,
shadow, padding). You cannot measure timing from stills: ask the creator for the clip
or mark timing fields "assumed" and use the `video-editor-pro` defaults.
```python
from PIL import Image
im = Image.open("shot.png").convert("RGB"); W,H = im.size
print(W,H, im.getpixel((W//2, int(H*0.7))))   # sample colours at points you name
```

## Style spec template (append to style_library.md)
```
## <name> (v1, YYYY-MM-DD, source: creator ref / web / own)
Use for: <video types>
Canvas: 1080x1920, 30fps | background: <hex gradient / footage>
Hook: <what happens in 0-1.5 s, text size, motion>
Pacing: avg shot <x> s, cuts at <beat/phrase>, zoom style <eased 1.0->1.5 in 0.5 s>
Captions: font <name weight px>, colours <hex>, box/outline, position y, words per chunk, highlight rule
Titles: font, size, entrance (frames), exit
Window/screen: radius px, shadow (blur, opacity, offset), padding %, background
Transitions: <types and durations>, max per video
Audio: music genre/BPM, ducking dB, SFX list with count per minute, VO loudness
Colour: palette hexes, grade
End: CTA type, loop trick
Do NOT: <things from the ref we reject: emoji, flashes, etc.>
Proof: <path to sheet.png / measured numbers>
```
Rules: specs are measurements, not adjectives ("fast" is useless; "avg shot 1.2 s"
is useful). Version specs; never silently overwrite an approved one.

## 3. Web trend research loop (weekly, ~15 min)
1. WebSearch (standard mode first): "<platform> trends this week", "TikTok Creative
   Center trending songs", "Instagram Reels trends <month year>", "AI tools news this
2. Prefer primary sources (platform newsrooms, Mosseri posts quoted verbatim, YouTube
   Creator Insider) over SEO blogs; note when numbers are unverified.
3. For each candidate trend record: format, why it works (hook mechanism), fit with
   the niche (AI/gamedev, calm smart look), effort, and a verdict.
4. Topic trends (new AI model, tool release, engine update) beat audio trends for this
   niche: being first with a clear Arabic explanation within 24–72 h is the edge.
5. **Tech-channel sources (since :** Anthropic news + Claude / Claude Code release notes,
   OpenAI and Google AI blogs, The Verge / TechCrunch AI sections, Product Hunt (AI tools of the
   week), Hacker News front page, YouTube search «ذكاء اصطناعي» filtered to this week, Arabic tech
   spaces on X. Arab AI/tech creators: Claude cannot browse IG/TikTok, so ask the creator for 5-10
   accounts he watches (or screenshots) and log their formats in `trends_log.md`; otherwise study
   creator TYPES (Arabic AI-tool explainer, Saudi programmer diary, Gulf productivity, Arabic indie
   gamedev) through public YouTube pages.

## 4. Daily brief routine (since  — output `./trends\TRENDS_<YYYY-MM-DD>.md`
Rerun every day (or on "وش الترند اليوم"). Reply to the creator in Arabic, short. Reference run: `trends\TRENDS_.md` (copy its layout).
**Steps:**
1. Search window = last 72 h. WebSearch in this order, each with "<topic> <month year>": (a) AI/tech news normal people care about: phones, apps they use (Chrome/WhatsApp/Android/iOS/Spotify/ChatGPT/Meta), scams and deepfakes, money and prices, jobs, games, viral AI stunts; (b) Saudi/Gulf angle (SDAIA, CST, HUMAIN, Absher/Tawakkalna, Saudi police warnings); (c) short-video formats trending on IG/TikTok tech niches (split-screen comparison, POV filmed screen, code-art, "I asked AI to…", before/after). Use `extended` mode for the news sweeps, `standard` for follow-ups.
2. **Verification gate (hard rule):** each fact needs 2 independent sources with dates inside the window or clearly labelled older. Prefer primary or major outlets (company blogs, TechCrunch, BleepingComputer, Fortune, AFP/Reuters, Okaz/Arab News). Open at least one source with WebFetch to read the real numbers; a search snippet alone is not verified. If a page returns 403/451, say so in the file and mark it "headline only". Aggregators (aiweekly, killtheai, hellogrowth, local-ai-zone, tech-insider, vendor blogs) have been wrong on numbers and model names: use them only to discover leads, never as a source. Model names differ between outlets; attribute names to the outlet or avoid them. Format-trend claims from a single marketing blog = "medium/low confidence", never presented as fact. Drop anything unverified and list it under "اللي حذفناه".
3. Score each surviving idea 1–5 on: Relevance to ordinary life (R, x3), first-frame visual hook (V, x2), debate/share potential (S, x2), feasibility without the creator filming (F, x1), freshness (T, x1), accuracy confidence (A, x1). Total max 50. Rank; keep TOP 7. Quick filter before scoring: "does it matter to someone who knows no tech?" if no, change the angle or drop it.
4. For each of the 7 write: hook line in Arabic (Saudi, max 8 words, one of the proven forms: warning / number+result / shocking story / money / secret), why now (dated), format (from the list in step 1c), visuals we can make ourselves (code-art, motion graphics, game footage, split-screen numbers, simulated UI clearly labelled «توضيح تصميمي»; creator POV filming only as optional), 2 sources with URLs and dates, a risk/accuracy note (what we must NOT claim; numbers that are another party's claim).
5. Add sections: formats-that-work table with confidence level, "what I noticed about sources", "dropped as unverified", a short backup list (real but older than 72 h), suggested publishing order. State the date used if the system date and the file date differ.
6. Append a one-line verdict per trend to `trends_log.md` (use / ignore) and hand the top 1–3 to `script-writer` (hook mechanism) and `content-director` (calendar).
**Never:** log in, post, or message anyone; fabricate screen recordings or quotes; clone a real person's voice or face; give step-by-step instructions for risky actions (TV hacking, exploits); print earnings claims we cannot prove.
**Style guard:** captions and CTA follow `ENGAGEMENT_PLAYBOOK.md` (keyword in comments, steps via DM, not in public comments); covers follow the v3 template.

## Format catalogue that fits this niche (2025–2026)
- "I built X with AI in N minutes" — result first, then the steps.
- Before/after split or wipe (game scene, character, level) — strong for sends.
- "3 AI tools that do X" list — save-bait; one tool per 5–8 s, show real UI.
- Myth vs reality / "stop doing X" — opinion hook, drives comments.
- Screen-recorded walkthrough with Screen-Studio window + eased zooms.
- Reaction/explain of a viral AI clip (use own capture of public info, not reposted video).
- Green-screen over a news page / tool page (creator on camera, page behind).

## Sounds
- For explainers with VO, trending sounds matter less than voice clarity; use a
  trending sound at low level only when it does not fight the VO.
- Never reuse commercial music in YouTube uploads; on IG/TikTok use the in-app sound
  library at publish time when needed (licensed in-app), not baked into the file.
  See `sound-designer` for licensing.

## Hand-off
- To `video-editor-pro`: the spec name to apply.
- To `script-writer`: the hook mechanism and structure observed.
- To `growth-strategist`: trend verdicts that affect the content calendar.
