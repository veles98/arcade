---
name: creator-studio
description: Index and router for an Arabic short-video creator workflow (AI/tech explainers on Instagram, TikTok, YouTube Shorts, made with ffmpeg/Python/Blender). Use first for any social-video task to pick the right skill and the order to run them: idea, script, edit, graphics, sound, cover, publish, review, growth. Planning and "what next" questions go to content-director first.
---

# Creator Studio — which skill when

## Read first, every video
`./LESSONS.md` — your own log of what worked and what you rejected (look, sound, captions, covers, process).
Add to it after every video; it outranks generic advice in the skills below.

## Director first
Planning, calendar, series, positioning, "what should I post", "is this idea good" -> `content-director` FIRST.
It reads goals/results/style library, proposes the next 3 videos, builds the week and dispatches the skills below.

## Pipeline order for one video
0. `content-director` — idea, series, target KPI, edit style.
1. `trend-scout` — topic/format choice, or turn a reference into a style spec (`video-watcher` to study a link).
2. `script-writer` — hook variants, dialect script, on-screen lines, CTA.
3. Record voice-over + screen captures (you).
4. `sound-designer` — clean the VO, pick licence-clean music/SFX.
5. `motion-designer` — Arabic titles, diagrams, lower-thirds, end card.
6. `video-editor-pro` — assemble, captions, mix, master, QA checklist.
7. `thumbnail-designer` — cover per platform.
8. Publish natively per platform (you approve and post; Claude never posts).
9. `analytics-reviewer` — at 48 h and 7 days.
10. `growth-strategist` — monetisation, funnels, collabs.
11. `community-manager` — first hour after posting and daily: replies, keyword funnel, pinned comment.
12. `engagement-booster` — daily 15-min routine, per-post checklist, Stories, trial reels, KPIs.
Any time: `originality-guard` before anything public.

## Quick router
| You say | Skill |
|---|---|
| «وش أنزل؟» / plan / calendar / series / weekly review | content-director |
| «شوف هذا الريل وسوي مثله» / reference screenshots | trend-scout, video-watcher |
| «اكتب لي سكربت / هوك / كابشن» | script-writer |
| «عدّل الفيديو» / «الإيديت رخيص» / captions / export | video-editor-pro |
| Arabic text animation, icons, diagram, end card | motion-designer |
| music, SFX, voice sounds bad, licence question | sound-designer |
| cover, thumbnail | thumbnail-designer |
| pasted stats / «ليش ما انتشر» | analytics-reviewer |
| «كيف أكبر الحساب» / monetisation | growth-strategist |
| «كيف أرفع التفاعل» / Stories / trial reels | engagement-booster |
| «وش أرد؟» / comments, DMs, keyword funnel | community-manager |
| «شكلنا مثل غيرنا» | originality-guard |

## House rules (all skills)
- No emoji in on-screen text, captions or covers (optional house style; drop it if you like emoji).
- No loud red/white flashes, no repeated SFX, at most 6-8 accents per minute.
- Frame 1 already shows the hook — never fade in from black.
- Real footage over stills whenever footage exists.
- Calm "smart explainer" look: rounded windows, soft shadows, eased zooms, one accent colour.
- Licence-clean audio and fonts only; log licences.
- Arabic text always shaped and RTL-correct (see motion-designer traps).
- Honest expectations; state downsides first.
- Claude cannot log in to analytics; rely on pasted stats, screenshots and web research.

## Workspace (your project folder, create on first use)
`PLAN_30_60_90.md`, `CALENDAR_week<N>.md`, `style_library.md`, `trends_log.md`, `calendar.md`, `analytics_log.md`,
`LESSONS.md`, `audio/LICENCES.md`, `covers/`, `refs/`, `projects/<date>_<slug>/` (script, VO, edit, exports).

## Tools
- ffmpeg built with libass/HarfBuzz/FriBidi, on PATH.
- Python: Pillow, numpy, faster-whisper, uharfbuzz, arabic-reshaper, python-bidi.
- Blender (optional) for 3D titles.
