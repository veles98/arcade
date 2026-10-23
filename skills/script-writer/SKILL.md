---
name: script-writer
description: Write Arabic (Gulf/Saudi-dialect friendly) scripts for 20–90 s vertical explainer videos about AI tools and tech — hook formulas, retention structure, on-screen text lines, B-roll notes and a plain CTA. Use when you want a script, a hook, a caption, a title, or want to turn an idea, article, tool release or progress update into a short video.
---

# Script Writer — short Arabic explainers that hold attention

Voice: a Saudi developer explaining to a smart friend. Clear, confident, a little
dry humour, zero hype words ("خرافي", "مستحيل تصدق" only if literally true). Saudi
"white" dialect (مفهومة لكل الخليج): أبغى، وش، كذا، مره، يعني (sparingly), خلني أوريك.
Tech terms in English as spoken ("Prompt", "Render", "Blueprint", "Unreal").

## Output format (always)
```
العنوان الداخلي: <working title>
المدة المستهدفة: <s>   | السلسلة: <series + episode or none>
الهوك (0–1.5 ث):
  صوت: ...
  نص على الشاشة (≤ 6 كلمات): ...
  صورة: <what is on screen in frame 1 — real footage>
الجسم:
  [ث 2–6]  صوت: ...  | شاشة: ...  | B-roll: ...
  ...
الخاتمة/CTA (آخر 3 ث): صوت: ... | شاشة: ...
وصف المنشور (caption): 1–2 سطر + 3–5 كلمات بحث (عربي + إنجليزي)
كلمة ManyChat (إن وجدت): <one Arabic word>
```
Rules: no emoji anywhere (screen text, captions, descriptions). Each body line is one
idea. Every 2–3 s something new appears on screen (note it in the script).

- Number every spoken line (L01, L02 …) and mark pauses with [وقفة]. The edit is anchored to the
  words, so the same IDs go into the script data file (`script_vNN.py`: `*keyword`, `|` pause).
- Two columns per line: what is spoken / what appears on screen.
- Always end the doc with recording tips: quiet soft room, phone a hand-span away and off-axis,
  3 s silence first, one line at a time, **if you slip: pause 2 s and repeat the whole line**
  (the aligner keeps the last good take), how to pronounce English terms, send the raw file.
- Give 1–2 alternative lines (hook, CTA) the creator can swap before recording.
- Honesty line in the director note: what the tool really did and did not do.
- Avoid «·» between Arabic words and digits on screen (reads as ٠); use «—».

## Word budget
Saudi speech in explainers runs ~2.3–2.8 words/s. 30 s ≈ 70–80 words; 45 s ≈ 110;
60 s ≈ 150. Cut until it fits — never speed the VO up past 1.1x.

## Hook formulas (first line, ≤ 1.5 s spoken)
1. Result first: "هذي اللعبة سويتها لحالي بالذكاء الاصطناعي." (show it)
2. Curiosity gap: "فيه أداة تسوي لك الموديل ثلاثي الأبعاد من صورة وحدة."
3. Mistake call-out: "إذا تستخدم ChatGPT كذا، أنت تضيع وقتك."
4. Contrarian: "أغلب دروس Unreal تعلمك الطريقة الغلط."
5. Number promise: "ثلاث أدوات توفر عليك شهر شغل في صناعة الألعاب."
6. Direct pain: "تبغى تسوي لعبة بدون فريق؟ خلني أوريك وش يصير فعلًا."
7. Before/after: "قبل: مكعب رمادي. بعد: ..." (cut on the word بعد)
Hook must match the payoff — a hook the video does not pay off kills retention and trust.
Write 3 hook variants per script; the creator picks one (or test via Trial Reels).

## Retention structure
- 0–1.5 s hook (visual + spoken + text say the same thing).
- 1.5–4 s stakes/open loop: why this matters or what we will see at the end.
- Body: steps in the order the viewer would do them; each step = action verb + visible result.
- Pattern interrupt every ~8–10 s: a reveal, a zoom to a detail, a question, a quick before/after.
- Re-hook at ~50%: "والحين أهم جزء..." / "بس انتبه هنا".
- Payoff ≤ 3 s before the end; end on a line that loops into the first frame when possible.
- Delete: intros, "السلام عليكم يا شباب" before the hook (greet after the hook if at all),
  "لا تنسى تشترك" mid-video, repeated sentences, filler adjectives.

## CTA (one per video, plain text, no emoji)
- Comment keyword: "اكتب «برومبت» وأرسل لك الملف." (ManyChat funnel)
- Send prompt (drives sends): "أرسلها لصاحبك اللي يبغى يسوي لعبة."
- Question for comments: one specific question, not "وش رأيكم؟".

## Captions / descriptions
- **Line 1 = search keywords, not a slogan** (2-3 phrases joined by « | »,
  Arabic topic + English tool name + benefit, e.g. «كيف تكتب برومبت | ChatGPT و Claude | قالب جاهز بالعربي».
- Lines 2-3: what happens + the honest result. Last line: the reason to follow («تابع: …»).
- 3-5 hashtags from `./HASHTAGS_LIBRARY.md` (one Arabic general, one Arabic
  specific, one English tool, one English field, optional one brand tag). No #fyp/#viral/#اكسبلور.
- Also write: alt text (literal description + keyword) and the on-screen keyword list.
- Disclose sponsorships clearly.

## Accuracy
- Every factual claim about a tool (price, licence, feature, release date) is checked
  with WebSearch on the day of writing; put the source URL in a script note, not on screen.
- Never claim "free" or "commercial use allowed" without checking the licence.
- Demos must be real captures from your machine or game; no faked results.

## Self-check before handing over
- [ ] Hook ≤ 1.5 s spoken and has a matching first frame.
- [ ] Word count fits the duration; no line longer than ~12 words.
- [ ] Screen change noted at least every 3 s.
- [ ] One CTA, plain, no emoji. Dialect consistent (no switching to MSA mid-sentence
      unless quoting).
- [ ] Payoff delivered; no claim unchecked.

## Engagement and retention (every short)
- Numbered series tag on screen + cover + caption («حيلة الأسبوع — ٢»).
- One calm CTA card at 60–70 % of the runtime (save, send to a friend, or a comment keyword); never in the first 3 s.
- End card = a follow reason tied to the next episode.
- Structure: Hook -> open loop -> rehook at ~40% -> second open loop -> payoff at the end.
- Topic test: "does a non-tech person care?" Favour warnings, money, daily life and visual challenges.
