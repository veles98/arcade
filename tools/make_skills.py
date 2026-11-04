#!/usr/bin/env python3
"""Turn every prompt section of p/index.html into a downloadable Claude skill.

For each entry in META it writes dl/<slug>.zip (one folder <slug>/SKILL.md inside) and
rebuilds s/skills.js, the list the skills library page (s/index.html) draws from.
The hook skill (dl/hook-writer.zip) is hand-written and only listed here, not rebuilt.

Usage:  python tools/make_skills.py
"""
import html
import io
import json
import pathlib
import re
import zipfile

ROOT = pathlib.Path(__file__).resolve().parent.parent

# id in p/index.html -> skill metadata.
# cat: content | build | daily | gamedev.  env: "claude" (claude.ai is enough) or "code" (needs Claude Code).
META = {
 "pixelanim": dict(slug="pixel-animals", word=None, cat="content", env="claude",
   what="يكتب لك برومبتات حيوانات بكسل بنفس الستايل، وخطوات تحريكها في CapCut.",
   desc="Writes matching pixel-art sprite prompts for a list of animals (or any characters), a 9:16 pixel background prompt, and CapCut steps to animate them into a short video. Use when the user wants a pixel-art animals or characters video."),
 "pixel": dict(slug="pixel-montage", word="بكسل", cat="content", env="claude",
   what="يحوّل كلامك لصور بكسل بنفس الستايل، صورة لكل جملة.",
   desc="Turns a voice-over script into a series of same-style retro pixel-art image prompts, one per sentence, for a pixel montage video. Use when the user wants pixel-art visuals for a script or reel."),
 "game": dict(slug="phone-game", word="لعبة", cat="build", env="claude",
   what="تعطيه فكرة لعبة، ويطلع لك لعبة جوال كاملة في ملف واحد.",
   desc="Builds a complete single-file HTML mobile game (canvas, touch controls, no external assets) from a one-line game idea. Use when the user asks for a game, a mini game or a playable prototype."),
 "char": dict(slug="talking-character", word="شخصية", cat="content", env="code",
   what="شخصية مرسومة تتكلم بصوتك، والفم يتحرك مع كلامك.",
   desc="Draws a layered SVG character and animates it (mouth shapes, blinks, head motion) on the user's voice recording, then renders a 1080x1920 video with Python and ffmpeg. Use when the user wants an animated talking character or avatar from their voice."),
 "reels": dict(slug="voice-to-reel", word="ريلز", cat="content", env="code",
   what="تسجيل صوتك يصير ريل بكابشن كلمة كلمة وحركة، بدون برنامج مونتاج.",
   desc="Turns a voice recording into a finished vertical reel: cleans the audio, times every word with Whisper, builds animated scenes and word-by-word captions with HyperFrames, and renders it. Use when the user wants a reel or short video made from their voice."),
 "montage": dict(slug="beat-text-video", word="مونتاج", cat="content", env="code",
   what="فيديو كلمات ثلاثية الأبعاد تتحرك على إيقاع الموسيقى.",
   desc="Makes a motion-typography video where 3D words and shapes move on the beat of a music file. Use when the user wants a kinetic text or lyric-style video synced to music."),
 "fx": dict(slug="motion-kit", word=None, cat="content", env="code",
   what="يبني لك كِت موشن جرافيكس: عناوين عربية، وأيقونات، وانتقالات.",
   desc="Builds a reusable motion-graphics kit (Arabic titles with shine, self-drawing icons, cards, transitions, particles) and renders sample clips. Use when the user wants video effects, motion graphics or animated titles."),
 "sky": dict(slug="code-drawn-video", word=None, cat="content", env="code",
   what="فيديو كامل مرسوم بالكود، بدون أي صورة أو مقطع جاهز.",
   desc="Writes and runs a Python script that draws a complete vertical video entirely in code (sky, planets, meteors) and renders it with FFmpeg, with preview frames first. Use when the user wants a video drawn by code or an astronomy or space visual."),
 "city": dict(slug="arabic-letters-art", word=None, cat="content", env="code",
   what="مدينة أو معلم مرسوم كله بحروف عربية.",
   desc="Draws a city skyline or landmark made entirely of Arabic letters as an animated code visual. Use when the user wants Arabic typography art or a city drawn with letters."),
 "site": dict(slug="free-website", word=None, cat="build", env="code",
   what="يبني لك موقع لحسابك ويرفعه على GitHub Pages مجانًا.",
   desc="Builds a personal or creator website and publishes it free on GitHub Pages. Use when the user wants a website, a link-in-bio page or a portfolio."),
 "themes": dict(slug="site-themes", word=None, cat="build", env="code",
   what="يضيف لموقعك قائمة ثيمات وزر تخصيص يتذكره الزائر.",
   desc="Adds a theme picker and a customiser to an existing website that remembers the visitor's choice. Use when the user wants themes, dark mode or a style switcher on their site."),
 "tool": dict(slug="chat-tool", word=None, cat="build", env="claude",
   what="يسوي لك أداة تفاعلية (حاسبة، جدول) تشتغل داخل المحادثة.",
   desc="Builds an interactive mini tool (calculator, tracker, converter) that runs inside the chat as an artifact, in Arabic RTL. Use when the user asks for a calculator or a small interactive tool."),
 "start": dict(slug="start-idea", word=None, cat="daily", env="claude",
   what="تعطيه فكرتك، ويطلع لك خطة وأول نسخة تشتغل اليوم.",
   desc="Turns a rough idea into a short plan and a first working version the user can try today. Use when the user has an idea and does not know where to start."),
 "ask": dict(slug="ask-first", word=None, cat="daily", env="claude",
   what="يسألك 5 أسئلة قبل ما يجاوب، عشان الجواب يطلع على مقاسك.",
   desc="Before answering a request (plan, email, project idea), asks the user five questions about their situation and goal, waits for the answers, then tailors the answer. Use when a request is open-ended or personal."),
 "project": dict(slug="project-brief", word=None, cat="daily", env="claude",
   what="يكتب لك تعليمات مشروع تخلي كل محادثة تعرف شغلك.",
   desc="Writes project instructions that make every chat know the user's work, style and goals. Use when the user sets up a Claude Project or wants persistent instructions."),
 "voice": dict(slug="family-scam-alert", word=None, cat="daily", env="claude",
   what="يكتب رسالة لقروب عيلتك عن كلمة السر ضد مكالمات الصوت المزيّف.",
   desc="Writes a short family group message that explains AI voice-cloning scam calls and sets up a family code word. Use when the user wants to warn family about voice scams."),
 "hooks": dict(slug="hooks-bank", word=None, cat="content", env="claude",
   what="30 قالب هوك بالعربي، يختار لك الأنسب لموضوعك.",
   desc="Picks and adapts the best of 30 Arabic hook templates for the user's video topic. Use when the user wants a hook, an opening line or a title for a reel."),
 "hitstop": dict(slug="unreal-hitstop", word=None, cat="gamedev", env="code",
   what="يضيف Hit-stop للضربات في Unreal عشان تحسها.",
   desc="Adds hit-stop (a short freeze on impact) to melee hits in Unreal Engine using CustomTimeDilation. Use when the user wants combat hits to feel heavier in Unreal."),
 "vision": dict(slug="unreal-enemy-vision", word=None, cat="gamedev", env="code",
   what="يخلي العدو يشوفك بمخروط نظر وشعاع، في Unreal.",
   desc="Implements enemy line-of-sight in Unreal Engine (view cone plus LineTrace, or AIPerception sight). Use when the user wants enemies to see or detect the player."),
}

# Hand-written skills that are listed but not generated.
FIXED = [
 dict(id="hook", slug="hook-writer", word="سكيل", cat="content", env="claude", title="سكيل الهوك",
      what="تعطيه فكرة فيديو، ويطلع لك 10 بدايات قصيرة، وأقوى 3، ووش تحط بأول ثانية.",
      file="../dl/hook-writer.zip", example="فكرة فيديو: أحوّل صورتي لشخصية أنمي",
      prompt="أنت كاتب هوكات للريلز. لما أعطيك فكرة فيديو، اكتب 10 هوكات من 3 إلى 8 كلمات، فيها رقم أو صراع أو مفاجأة، تلمّح للنتيجة بدون ما تكشفها، ومفهومة بدون صوت. بعدها اختار أقوى 3 وقل ليش، واقترح للأقوى وش يطلع على الشاشة في أول ثانية."),
]

# Hand-written skills kept as folders in skills_src/<slug>/ (SKILL.md plus any scripts). Zipped as they are.
SRC = {
 "edit-studio": dict(cat="content", env="code", word=None, title="استوديو المونتاج",
   what="يعطي Claude Code عيون وأذون ويدين: يقص الوقفات، ويضبط الصوت، ويحط ترجمة كلمة كلمة وكلمات مضيئة."),
 "caption-writer": dict(cat="content", env="claude", word=None, title="الكابشن بلهجتك",
   what="تعطيه فكرة الريل، ويطلع لك كابشن بلهجتك وسؤال وهاشتاقات."),
 "map-route": dict(cat="content", env="claude", word="أنميشن", title="خريطة مشوار متحركة",
   what="اكتب /map-route ومن وين لوين، ويطلع لك أنميشن خريطة يرتسم فيها الطريق مثل تطبيقات الملاحة."),
 "follower-graph": dict(cat="content", env="claude", word="أنميشن", title="رسم نمو يعد",
   what="اكتب /graph والأرقام، ويطلع لك رقم يعد من صفر ومنحنى يرتسم تحته، مثل «من 0 لـ100 ألف»."),
 "exploded-view": dict(cat="content", env="claude", word="أنميشن", title="منتج يتفكك قطع",
   what="اكتب /breakdown واسم المنتج، ويتفكك قدامك طبقات في 3D وعلى كل قطعة اسمها."),
 "chat-story": dict(cat="content", env="claude", word="أنميشن", title="محادثة متحركة",
   what="اكتب /chat-story والفكرة، ويطلع لك محادثة مثل الآيفون رسالة رسالة، وآخرها قفلة."),
 "minimal-story": dict(cat="content", env="claude", word="أنميشن", title="أنميشن بسيط بجملة",
   what="اكتب /minimalistic-graphics وجملتك، ونقطة بيضا على خلفية سودا ترسم الفكرة بهدوء."),
 "wow-design": dict(cat="build", env="claude", word="تصميم", title="تصميم خرافي لأي موقع",
   what="سكيل سويته أنا: يخلي الذكاء الاصطناعي يصمم صفحتك مثل استوديو، بخط كبير وإضاءة وحركة، بدل القالب اللي في كل موقع."),
 "frontend-design": dict(cat="build", env="claude", word=None, title="تصميم مو شكله ذكاء اصطناعي",
   what="سكيل Anthropic الرسمي: يخلي المواقع اللي يسويها الذكاء الاصطناعي لها شخصية، بدل الخلفية الكريمي والكلمة الملونة اللي في كل موقع."),
 "tahadi-2-slipper-dodge": dict(cat="build", env="claude", word="شبشب", title="لعبة اهرب من الشبشب",
   what="تحدي يوم 2: السكيل يبني لك لعبة «اهرب من الشبشب» كاملة على الجوال، بنفس اللي في الريل."),
 "faceless-host": dict(cat="content", env="claude", word="شخصية", title="مقدّم بدون ما تطلع وجهك",
   what="سكيل سويته أنا: يسوي لك شخصية ثابتة تقدم محتواك، نفس الوجه واللبس والمكان في كل صورة، ويكتب لك برومبت أي لقطة تبيها."),
 "customer-reply": dict(cat="daily", env="claude", word=None, title="رد على العميل",
   what="تلصق رسالة عميل، ويطلع لك رد محترم بلهجته، جاهز ترسله."),
}

# Prompt sections left out of the library (2026-11-03 review): hooks duplicates the hook-writer skill,
# the two Unreal ones are game-dev niche for an audience that arrives from reels on phones.
DROPPED = {"hooks", "hitstop", "vision"}

TITLE_FIX = {  # cleaner card titles than the prompt-page headings
 "pixelanim": "فيديو حيوانات البكسل", "hooks": "30 هوك بالعربي", "reels": "صوتك يصير ريل",
 "montage": "كلمات على الإيقاع", "fx": "كِت موشن جرافيكس", "sky": "فيديو مرسوم بالكود",
 "hitstop": "Hit-stop في Unreal", "vision": "العدو شافك؟ في Unreal", "voice": "كلمة سر العيلة",
 "ask": "اسألني قبل ما تبدأ", "project": "تعليمات المشروع", "tool": "أداة داخل المحادثة",
 "site": "موقع لحسابك", "themes": "ثيمات لموقعك", "game": "لعبة جوال من فكرة", "char": "شخصية تتكلم بصوتك",
 "pixel": "مونتاج البكسل", "city": "رسم بالحروف العربية", "start": "ابدأ فكرتك اليوم",
}


# Card lines on the library (2026-11-03): what the visitor gets, 12 words max, Saudi dialect.
CARD_WHAT = {
 "hook": "تعطيه فكرة فيديو، ويطلع لك 10 بدايات تشد من أول ثانية.",
 "edit-studio": "Claude Code يقص الوقفات ويضبط الصوت ويحط ترجمة كلمة كلمة.",
 "caption-writer": "كابشن بلهجتك، مع سؤال للتعليقات وهاشتاقات تناسب الريل.",
 "map-route": "خريطة يرتسم فيها مشوارك من مكان لمكان، مثل تطبيقات الملاحة.",
 "follower-graph": "رقم يعد من صفر ومنحنى يطلع معه، مثل «من 0 لـ100 ألف».",
 "exploded-view": "جوالك أو أي منتج يتفكك قطع في 3D، وعلى كل قطعة اسمها.",
 "chat-story": "محادثة مثل الآيفون تطلع رسالة رسالة، وآخرها قفلة.",
 "minimal-story": "نقطة بيضا على خلفية سودا ترسم جملتك بهدوء.",
 "wow-design": "صفحتك تطلع مثل شغل استوديو، مو قالب الذكاء الاصطناعي المعتاد.",
 "frontend-design": "سكيل Anthropic الرسمي: مواقع لها شخصية بدل الشكل المكرر.",
 "tahadi-2-slipper-dodge": "لعبة جوال كاملة: تفادى الشباشب، مراحل وكومبو ورقم قياسي.",
 "faceless-host": "شخصية ثابتة تقدم محتواك بدالك، نفس الوجه في كل صورة.",
 "customer-reply": "تلصق رسالة العميل، ويطلع لك رد محترم جاهز ترسله.",
 "pixel-animals": "برومبتات حيوانات بكسل بستايل واحد، وطريقة تحريكها في CapCut.",
 "pixel-montage": "كل جملة من كلامك تصير صورة بكسل بنفس الستايل.",
 "phone-game": "تعطيه فكرة، ويطلع لك لعبة جوال كاملة تلعبها على طول.",
 "talking-character": "شخصية مرسومة تتكلم بصوتك، وفمها يتحرك مع كلامك.",
 "start-idea": "تعطيه فكرتك، ويطلع لك خطة وأول نسخة تشتغل اليوم.",
 "family-scam-alert": "رسالة لقروب العيلة تحميهم من مكالمات الصوت المزيّف.",
 "code-drawn-video": "فيديو كامل مرسوم بالكود، بدون ولا صورة جاهزة.",
 "voice-to-reel": "تسجيل صوتك يصير ريل بترجمة كلمة كلمة، بدون مونتاج.",
 "beat-text-video": "كلمات ثلاثية الأبعاد تتحرك على إيقاع الأغنية.",
 "arabic-letters-art": "مدينة أو معلم مرسوم كله بحروف عربية متحركة.",
 "free-website": "موقع لحسابك مرفوع على GitHub Pages ببلاش.",
 "site-themes": "قائمة ثيمات لموقعك، والزائر يختار وموقعك يتذكر اختياره.",
 "motion-kit": "عناوين عربية وأيقونات وانتقالات جاهزة لفيديوهاتك.",
 "ask-first": "يسألك 5 أسئلة أول، عشان الجواب يطلع على مقاسك.",
 "project-brief": "تعليمات مشروع تخلي كل محادثة تعرف شغلك وأسلوبك.",
 "chat-tool": "حاسبة أو جدول أو أداة صغيرة تشتغل داخل المحادثة.",
}


def clean(fragment):
    t = re.sub(r"<br\s*/?>", "\n", fragment)
    t = re.sub(r"</(p|li|h2|h3|div|pre)>", "\n", t)
    t = re.sub(r"<button[^>]*>.*?</button>", "", t, flags=re.S)
    t = html.unescape(re.sub(r"<[^>]+>", "", t))
    t = re.sub(r"[ \t]+\n", "\n", t)
    return re.sub(r"\n{3,}", "\n\n", t).strip()


def sections():
    page = (ROOT / "p" / "index.html").read_text(encoding="utf-8")
    for sid, body in re.findall(r'<section id="([a-z0-9-]+)" class="card glass">(.*?)</section>', page, re.S):
        title = clean(re.search(r"<h2>(.*?)</h2>", body, re.S).group(1))
        lead = re.search(r'<p class="s">(.*?)</p>', body, re.S)
        blocks = [clean(b) for b in re.findall(r"<pre[^>]*>(.*?)</pre>", body, re.S)]
        rest = re.sub(r"<h2>.*?</h2>|<p class=\"s\">.*?</p>", "", body, count=2, flags=re.S)
        yield sid, title, clean(lead.group(1)) if lead else "", blocks, clean(rest)


def skill_md(m, title, lead, full):
    tool = "Claude Code" if m["env"] == "code" else "Claude"
    return (
        f"---\nname: {m['slug']}\ndescription: {m['desc']}\n---\n\n"
        f"# {title}\n\n{m['what']}\n\n"
        "## طريقة الشغل\n"
        "- المرجع تحت هو الطريقة اللي استخدمها أنس (@anas.ai.ar) في الريل. طبّقها على طلب المستخدم.\n"
        "- أي شي بين قوسين مربعة [مثل كذا] يتبدّل بكلام المستخدم. إذا ناقص، اسأله سؤال واحد قصير قبل ما تبدأ.\n"
        "- رد بلهجة المستخدم، وخل الخطوات قصيرة وواضحة.\n"
        + (f"- هذا السكيل يحتاج {tool} لأنه يشغّل أوامر ويطلّع ملفات. قل للمستخدم كل أمر قبل ما تشغّله.\n" if m["env"] == "code" else "")
        + f"\n## المرجع\n\n{lead}\n\n{full}\n"
    )


def main():
    entries = list(FIXED)
    for slug, m in SRC.items():
        folder = ROOT / "skills_src" / slug
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
            for f in sorted(folder.rglob("*")):
                if f.is_file() and "__pycache__" not in f.parts:
                    z.writestr(f"{slug}/{f.relative_to(folder).as_posix()}", f.read_bytes())
        (ROOT / "dl" / f"{slug}.zip").write_bytes(buf.getvalue())
        entries.append(dict(id=slug, slug=slug, file=f"../dl/{slug}.zip", prompt="" if m["env"] == "code" else
                            re.sub(r"^---.*?---\s*", "", (folder / "SKILL.md").read_text(encoding="utf-8"), flags=re.S), **m))
    for sid, title, lead, blocks, full in sections():
        m = META.get(sid)
        if not m or sid in DROPPED:
            continue
        md = skill_md(m, TITLE_FIX.get(sid, title), lead, full)
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
            z.writestr(f"{m['slug']}/SKILL.md", md)
        (ROOT / "dl" / f"{m['slug']}.zip").write_bytes(buf.getvalue())
        entries.append(dict(id=m["slug"], slug=m["slug"], word=m["word"], cat=m["cat"], env=m["env"],
                            title=TITLE_FIX.get(sid, title), what=m["what"], file=f"../dl/{m['slug']}.zip",
                            prompt=blocks[0] if blocks else "", src=sid))
    for e in entries:
        e["what"] = CARD_WHAT.get(e["id"], e["what"])
    js = "// Generated by tools/make_skills.py. Edit META there, not here.\nvar SKILLS=" + json.dumps(entries, ensure_ascii=False, indent=1) + ";\n"
    (ROOT / "s" / "skills.js").write_text(js, encoding="utf-8")
    print(f"{len(entries)} skills -> s/skills.js")
    for e in entries:
        print(f"  {e['id']:<22} {e['cat']:<8} {e['env']:<6} {len(e['prompt']):>5} chars prompt")


if __name__ == "__main__":
    main()
