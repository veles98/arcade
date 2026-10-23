---
name: analytics-reviewer
description: Read the Instagram, TikTok and YouTube Shorts statistics the creator pastes or screenshots (reach, views, watch time, retention graph, swipe rate, shares/sends, saves, follows), diagnose why each video did or did not work, and decide the next videos. Use when the creator shares numbers or insight screenshots, asks "why did this flop/work", or at the weekly review.
---

# Analytics Reviewer

Claude cannot log in to the platforms. Work only from what the creator pastes or
screenshots; say which numbers are missing instead of guessing.

## What to ask for (per video, after 48 h and again at 7 days)
- Instagram: views, reach, % non-followers, avg watch time, video length, skip rate
  (if shown), likes, comments, shares (sends), saves, follows; retention graph screenshot.
- TikTok: views, avg watch time, watched full video %, traffic source (For You / search /
  profile / following), shares, saves, comments, new followers; retention screenshot.
- YouTube Shorts: views, "viewed vs swiped away" %, avg view duration / avg % viewed,
  subscribers gained, shares, likes. Note: since 31 Mar 2025 Shorts views count every
  start/replay — compare % viewed and retention, not raw views across that date.

## Derived metrics (compute these, they normalise for reach)
- Hold rate = avg watch time / length (target > 60% for < 40 s videos).
- Hook rate = 1 − swipe/skip rate (YT viewed %; IG skip rate) — target > 70%.
- Sends per 1k reach, saves per 1k reach, follows per 1k reach, comments per 1k reach.
- Non-follower share of reach (discovery health).
- Search share (TikTok traffic source) — tells if keywords work.
Benchmarks are rough (third-party); the real benchmark is the account's own median.
Keep a rolling median of the last 20 posts per metric.

## Diagnosis tree
1. Low hook rate -> the first 1.5 s failed: first frame static? text unreadable? hook
   promise unclear or off-niche? Fix the hook, keep the topic.
2. Good hook, sharp drop at a timestamp -> look at what is on screen there (slow
   setup, talking without visuals, repeated point, music swell, jump in topic).
3. Good retention, low sends/saves -> content entertaining but not useful/shareable:
   add a takeaway, a resource (ManyChat keyword), or a "send to a friend who..." angle.
4. Good everything, low reach -> distribution: posting time, topic interest, trial
   reels, originality issues (watermark/reused clip), or simply variance — repost
   test with a new hook after 2+ weeks.
5. High views, few follows -> no reason to follow: missing series promise/identity,
   off-niche viral. Add series framing and a profile that matches the video.
Retention graph reading: a spike = rewatch (good, what caused it?), a cliff = exit cause.

## Output format (to the creator, in Arabic, short)
```
الفيديو: <name> | المدة: <s> | بعد: <48h/7d>
الأرقام المهمة: hook <%>, hold <%>, sends/1k <n>, follows/1k <n> (median: ...)
الحكم: نجح / متوسط / ضعيف — السبب الأرجح: ...
القرار: <keep / change hook / kill format / repost test>
الفيديو الجاي: <one concrete change to test>
```
One variable per test. Never conclude from a single post; call a pattern after 3.

## Log
Append each review to `./analytics_log.md`:
date, video, platform, hook type, format, length, key metrics, verdict. Feed the
weekly summary to `growth-strategist` (keep/kill/test decisions) and update the
calendar.

## Screenshot reading
Read insight screenshots with the Read tool; transcribe the numbers into a table
first, confirm with the creator if any value is blurry, then analyse.
