---
name: engagement-booster
description: Engagement and reach playbook for a small Arabic creator account on Instagram (most reach from non-followers) — what to do before/after each post, a 15-minute daily routine, comment prompts and Story stickers, collab outreach, trial reels, posting-time tests, KPIs (send rate, save rate, follows per 1k reach) and red lines (no pods, bots or follow/unfollow). Plans and drafts only; never logs in or posts.
---

# Engagement Booster — small account, stranger reach

Owner replies are short Arabic. This skill is the **growth layer around a post**. It does NOT duplicate
`community-manager` (reply wording, keyword funnel, ManyChat, closed DMs, action limits, triage,
escalation) — use that for every actual reply. Link: `~/.claude/skills/community-manager/SKILL.md`.
Related: `growth-strategist` (cadence, monetisation), `analytics-reviewer` (diagnose numbers),
`script-writer` (hooks), `profile-designer` (bio/highlights), `content-director` (what to post).
Inputs already in the workspace: `./ENGAGEMENT_PLAYBOOK.md` (CTA card,

Handle note: the creator names the account `your account`; `community-manager` still says `your account`.
Confirm which is current and fix the old file.

## What the evidence says (and how sure we are)
Instagram publishes almost nothing; most numbers below are third-party. Confidence in brackets.
- Core ranking signals (Mosseri, Jan 2025): **watch time, sends per reach, likes per reach**. Sends are
  the signal most tied to reaching non-followers; "3–5x a like" is a marketing-blog estimate, not
  Instagram's. Saves are used but their weight is disputed. [medium] — eClincher / Sprout / Dataslayer
  summaries: https://www.eclincher.com/articles/how-the-instagram-algorithm-works-in-2026 ,
  https://sproutsocial.com/insights/Instagram-algorithm/ ,
  https://dataslayer.ai/blog/instagram-algorithm-2025-complete-guide-for-marketers
- Our own data agrees: the best reel had the highest share (2.3%) and save (2.2%) rates, lowest skip
  and low likes. Optimise sends and saves, not likes.
- Early replies: many guides say reply to everything in the first hour; the claimed lift (e.g. "up to
  20%") is anecdotal. Cheap, so do it anyway. Pinning a comment does **not** change distribution; it
  only controls what visitors read first. [low–medium] —
  https://www.inro.social/blog/get-more-instagram-comments-guide , https://socialk.it/en/blog/pinned-comments-strategy
- Specific prompts beat open ones ("why?", "which one?", A/B, rank 1–3, unpopular opinion), and the call
  to comment should sit in the first 2 caption lines before the "more" cut. [low–medium] — same sources.
- Trial Reels: show the reel only to non-followers; you read results (guides say ~24–72 h, unconfirmed)
  then share to followers or let it auto-share if it clears the bar (threshold unpublished). Use it:
  Check the in-app toggle for current rules. [medium] —
  https://www.inro.social/blog/what-is-a-reel-trial , https://publer.com/blog/instagram-trial-reels-guide/
- Collab posts: one post shown on both accounts' profiles/audiences; up to 5 collaborators; no follower
  minimum; needs acceptance. Emplifi (H1 2026, brand profiles under 10k) reports ~5x interactions for
  accepted collabs; brand data, not creators, so indicative only. Pick by niche fit and audience, not
  follower count. [low–medium] — https://emplifi.io/resources/instagram-collaborations-boost-organic-engagement/ ,
  https://skedsocial.com/en-au/blog/instagram-collaboration-feature
- Stories: polls are the lowest-effort interaction, quizzes keep people tapping through slides,
  question stickers turn replies into DMs. "DMs are weighted most in 2026" is an unverified vendor
  claim. Nothing solid on whether re-sharing your own reel to Stories boosts reach — test it. [low] —
  https://skedsocial.com/en-au/blog/ideas-to-boost-interactions-on-instagram-stories-in-2026
- Posting time for Saudi: sources disagree (Meltwater 2024: 8–10 PM weekdays; Time to Post 2026:
  3–5 PM, peak 4 PM; generic guides: mornings). Do not trust any; **A/B test** (see below). [low] —
  https://meltwater.com/en/blog/instagram-insights-the-benefits-of-an-optimised-po ,
  https://timetopost.co/best-time-to-post/instagram/saudi-arabia/
- Frequency: Buffer's 2M-post dataset (secondhand summary) links 3–5 posts/week to ~+12% reach per post
  vs 1–2/week and more growth at higher frequency; correlation only, assumes quality holds. For
  accounts under 1k followers Reels reach more than carousels. [medium] —
  https://buffer.com/resources/how-often-to-post-on-instagram/ , https://inmagic.ai/how-often-to-post-on-instagram/
- Broadcast channel: Professional accounts can open one, no follower minimum, anyone can see it but
  only joiners get notified; growth only comes from promoting it inside videos. Claims of "+20–40%
  https://www.sendible.com/insights/instagram-broadcast-channels
- Threads: IG-linked login; cross-sharing IG posts exists; Reels support in cross-post not confirmed.
  Useful for text opinions/threads about AI, not for reel reach. One creator reported Instagram video
  outperforming Threads (Buffer, Apr 2026). Treat as an optional 5-minute extra. [low] —
  https://buffer.com/resources/switching-threads-to-instagram/ , https://socialbee.com/blog/how-to-use-threads-app/
- Pods / bots / follow-unfollow: against Meta's inauthentic-activity rules; sources link them to action
  blocks and reduced recommendation. No official 2026 Meta statement found; the logic of risk is enough.
  [medium] — https://contentstudio.io/blog/instagram-shadowban , https://storrito.com/resources/instagram-penalizes-aggressive-automation/

## Daily 15-minute routine (creator does it; Claude drafts text on request)
Same hour each day. Phone only. Use `community-manager` wording for replies.
1. **Min 0–4 — Replies.** Open the latest reel's comments. Answer every real comment with a specific
   reply that ends in a question back (varied wording; no copy-paste). Keyword comments follow the
   community-manager funnel. Hide/ignore trolls.
2. **Min 4–7 — Stories (2–3 slides).** One poll or "this or that" tied to the latest reel, one question
   sticker, and re-share the latest reel with a one-line reason to watch (test, see KPI log). Never
   more than 3 slides; skip a day rather than post filler.
3. **Min 7–11 — Give before asking.** Leave 5–8 genuine, specific comments (more than a few words) on
   Arabic AI/tech creators of similar size or slightly bigger, on their newest posts. Real comments
   only; no links, no "follow me". Not mass-liking strangers. Cap about 10 per day (limits in
   community-manager).
4. **Min 11–13 — Collab pipeline.** Add 1 creator to the shortlist or send 1 outreach (max 2 per day).
5. **Min 13–15 — Log.** One line in `analytics_log.md`: latest reel's reach, sends, saves, follows
   (and who/what made the comments). Tick the post checklist for tomorrow's reel.
On posting days add: pinned comment within 10 min, and stay in the comments for the first hour.

## Per-post checklist
**Before posting**
- [ ] Frame 0 is a strong moving visual, not black. Hook lands in 0–2 s.
- [ ] Length 20–30 s unless the content needs more.
- [ ] One "reason to send": who exactly should get it ("أرسله لصاحبك اللي ..."). One "reason to save"
      (steps/list/template). Neither is begging; both are in the video, not only the caption.
- [ ] Series badge + number (ENGAGEMENT_PLAYBOOK §1) and a "next episode" line.
- [ ] Caption: line 1 keywords, call to comment in the first 2 lines, a save/send line, 3–5 hashtags.
- [ ] Pinned comment text ready (real question; keyword line only if the DM funnel is live).
- [ ] Decide: post as **Trial Reel** (hook test) or normal. A/B time slot logged in the calendar.
- [ ] Collab invite prepared if a creator agreed (invite at publish screen).
- [ ] No forbidden bait (ENGAGEMENT_PLAYBOOK "الممنوع"), no emoji on screen.
**After posting**
- [ ] Minute 0–10: pin comment. Share to Story with a poll about the topic.
- [ ] Minute 0–60: reply to every comment (community-manager style). Be on the phone.
- [ ] Hour 2 and evening: second reply pass; add best question as second pin.
- [ ] Hour 24: log reach, sends/saves/follows, skip rate, retention drop point.
- [ ] Hour 48: `analytics-reviewer`; decide whether the format becomes a series or dies.
- [ ] Trial reel passing? Share to followers and Story it. Failing? Change the hook, not the idea, once.

## 20 comment prompts and Story stickers (Saudi dialect; no emoji)
Comment prompts (pinned comment, caption line 2, or end of video). Specific beats open-ended.
1. «أي نسخة تختار: الذكاء الاصطناعي يسوي لك الشغل كله، ولا تسويه بنفسك وهو يصلّح؟ ليش؟»
2. «مين تختار: Claude ولا ChatGPT لهذا الشغل؟ اكتب سبب واحد بس.»
3. «وش أول شي بتجربه من الثلاثة؟ رتّبها لي ١-٢-٣.»
4. «رأي غير مشهور: الذكاء الاصطناعي ما بيقدر يسوي لعبة كاملة لحاله. معي ولا ضدي؟»
5. «وش آخر أداة ذكاء اصطناعي وفّرت عليك وقت فعلًا؟ اسمها وكم وفّرت.»
6. «تتوقع كم ساعة أخذت؟ خمّن قبل لا أقول.»
7. «أي لقطة في المقطع كانت الأصعب بنظرك؟ الأولى ولا الأخيرة؟»
8. «تشتغل ولا تدرس؟ وش اللي تتمنى الذكاء الاصطناعي يسويه عنك؟»
9. «لو عندك ساعة وحدة، وش تبي أبني لك فيها بالذكاء الاصطناعي؟ أختار تعليق وأسوّيه حلقة.»
10. «قبل ولا بعد: أي نسخة أحسن؟ ١ أو ٢ مع السبب.»
11. «أي مجال تبي أشرحه بعدين: برمجة، تصميم، ولا فلوس؟»
12. «جربتها؟ وش كانت النتيجة، نجحت ولا خربت؟»
13. «وش أكثر شي يخليك ما تثق بالذكاء الاصطناعي؟ أجاوب على أحسن تعليق بمقطع.»
14. «لو خيّروك: وظيفتك تتغير للذكاء الاصطناعي بس راتبك يتضاعف، توافق؟»
15. «وش أغرب شي طلبته من الذكاء الاصطناعي؟ أبي أضحك.»
16. «مين أول واحد بتجرّب عليه هذي الحيلة؟ أرسله له وقول لي وش قال.»
17. «تبي الجزء الثاني نبني فيه ميزة جديدة ولا نصلّح الأخطاء؟ صوّت.»
18. «كم تعطي المقطع من ١٠؟ وش اللي نقصه عندك؟»
19. «أي خطوة ضيّعتك؟ أشرحها بالتفصيل في حلقة.»
20. «وش اسم الحلقة الجاية بنظرك؟ أحسن اسم أستخدمه وأذكر صاحبه.»
Note: #14 and #4 are debate bait but legitimate (real question). Never «اكتب ١ إذا ...».

Story sticker ideas (use 2–3 per day, rotate):
- Poll: «مين أحسن لك؟ A / B» على أداتين أو شكلين. Poll: «تبي حلقة عن ... ولا ...؟»
- Poll: «شفت الريل الجديد؟ لا / إيه» (يرجّع الناس للريل بدون تسوّل).
- Quiz: «وش المدة اللي أخذها هذا الشغل؟ ٥ دقايق / ساعة / يوم» ثم الجواب في السلايد التالي.
- Quiz: «أي صورة مولّدة بالذكاء الاصطناعي؟» (صورتين).
- Question: «اسألني أي سؤال عن الذكاء الاصطناعي، أجاوب ٣ أسئلة بكره.»
- Question: «وش المشكلة اللي تضيّع وقتك يوميًا؟ أحلّها بأداة.»
- Slider: «كم تثق في الذكاء الاصطناعي من ١ إلى ١٠؟»
- Countdown/«الحلقة الجاية» sticker before the next series episode.
- Behind-the-scenes screenshot (the prompt, the failed attempt) with «ليش فشل هذا؟» question.
- Re-share of the reel with one reason line: «٣ خطوات بس، الثالثة أهمهم.»
Answer every question-sticker reply inside Stories next day (builds the "he answers" reputation).

## Collab outreach
**Pick 10 similar creators (30 minutes, once a week until 10 are filled)**
- Source: search hashtags and Reels audio our audience uses; check who comments on our best reel; look at
  use them only to find their smaller neighbours).
- Filter: Arabic (preferably Saudi/Gulf) AI / tech / gamedev / productivity; 500 to 20k followers (not
  celebrities); posted in the last 14 days; their recent reels get views far above their follower count
  (a sign of reach, not fake followers); real comments from real accounts; no giveaways-only or
  engagement-pod looking comment sections (كلها ردود قصيرة متشابهة بنفس الثواني).
- Complementary, not competitor: they teach another angle (design, coding, business) with the same
  audience age (18–34). Prefer accounts that already use collab posts.
- Record in `./collab_shortlist.md`: handle, followers, niche, best recent reel,
  idea for the joint reel, contact status. Contact only after 3–4 genuine comments on their posts.
**Message (Arabic; the creator sends it manually; max 2 per day; one follow-up after 5 days, then stop)**
«السلام عليكم [الاسم]، أنا [اسمك]، أسوي مقاطع قصيرة بالعربي عن الذكاء الاصطناعي وبناء الألعاب بالأدوات. تابعت [مقطع محدد] وعجبتني [نقطة محددة]. عندي فكرة مقطع مشترك [الفكرة في سطر]: أنت تسوي [الجزء ١] وأنا [الجزء ٢]، وننزله بخاصية Collab عشان يطلع عند جمهورنا نحن الاثنين. الشغل علي أنا لو تحب، وتقدر تعدّل أو ترفض عادي، ما عندي مشكلة. وش رأيك؟»
Rules: one specific compliment, one concrete idea, who does what, an easy "no". No attachments or links.
Collab format ideas: «نفس الطلب في أداتين»، «نفس المشروع: أنا بالذكاء الاصطناعي وأنت بالطريقة العادية»،
«أسئلة وأجوبة متبادلة»، «ريأكشن على ناتج الآخر».
Escalation of any reply or business terms to the creator (community-manager escalation list).

## Posting time test (Saudi)
Run for 4 weeks, equal content type: Slot A about 4 PM AST, Slot B about 9 PM AST, alternate days.
Log reach at 24 h and sends per 1k. Choose the slot with higher median sends/1k, then retest.
Also check Insights → Total followers → Most active times (once we have more followers).

Baseline = best reel (17 h): reach 2,012, views 2,289, shares 42, saves 45, comments 39, follows 19,
profile visits 27. Typical reel: 100–140 views. Define everything on **reach** (accounts reached) from
Insights, same window (24 h and 7 d).
| KPI | Formula | Best reel | Floor (healthy) | Target next 5 reels |
|---|---|---|---|---|
| Send rate | shares ÷ reach | ~2.1% | 1% | 1.5–2% on 3 of 5 |
| Save rate | saves ÷ reach | ~2.2% | 1% | 1.5–2% on 3 of 5 |
| Comment rate | comments ÷ reach | ~1.9% | 0.5% | 1%+ |
| Skip rate (first 3 s) | from Insights | 48.5% | under 55% | under 45% |
| Follows per 1k reach | follows ÷ reach × 1000 | ~9.4 | 4 | 6–9 |
| Profile-visit rate | visits ÷ reach | ~1.3% | 0.8% | 1.5% |
| Visit to follow | follows ÷ visits | 70% | 40% | keep 50%+ |
| Reach per reel | median of last 5 | ~120 typical | 500 | 1,000 |
not by followers. Priority order: (1) skip rate/hook, (2) send rate, (3) save rate, (4) follows per 1k.
Also log: story reply count, collab acceptance, trial vs normal result of the same hook.

## Red lines
- No engagement pods / comment groups / "like for like", no buying followers, likes, comments or views.
- No follow/unfollow cycling; no mass follows or mass likes; no auto-comment bots; ManyChat only for
  genuine keyword DMs (per community-manager).
- No cold DMs to strangers; collab outreach to max 2 creators per day after genuine engagement.
- No bait that violates platform rules: «اكتب ١ إذا ...»، «لايك إذا توافق»، «تابع وإلا ...»، giveaways
  needing follow+tag. Prompts must be real questions.
- No fake claims in comments («أرسلتلك» only if sent), no steps/links in public replies.
- No identical replies; vary wording. Stay under the limits in community-manager.
- Not logging in, posting, commenting or messaging from Claude, ever. Account safety: creator moves the
  Instagram login email off the suspended Google account and enables 2FA before any automation.
- Never edit analytics numbers to look better; log what Insights shows.

## Output format when invoked
1. One-line diagnosis (which KPI is the bottleneck). 2. Today's 15-min list. 3. Ready-to-paste text
(pinned comment, Story stickers, reply drafts for the creator to review). 4. What to log. Short Arabic.
