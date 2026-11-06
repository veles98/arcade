# الموقع | The site (arcade)

https://veles98.github.io/arcade/ — GitHub Pages, repo `veles98/arcade`, branch `main`.

## إضافة ريل أو لعبة | Add a reel or a game

العربي: كل اللي في الصفحة الرئيسية (الريلات، الأدوات، الألعاب) يجي من الملف `posts.json`. ما تلمس HTML.

```
python tools/add_post.py "عنوان الريل" "C:\path\cover.jpg" "https://www.instagram.com/reel/XXXX/" --n 3
python tools/add_post.py "لعبة الضفدع" "C:\path\cover.png" "frog/" --type game --desc "سطر واحد" --badge "جديدة"
```

- السكربت ينسخ الغلاف إلى `img/`، يضيف السطر في أول `posts.json`، يغيّر أرقام النسخ، ويطبع أوامر git.
- شغّل الأوامر اللي يطبعها (`git add`, `commit`, `push`). بعد الدفع انتظر دقيقة تقريبًا.
- `--n` رقم «الشحنة». `--date YYYY-MM-DD` إذا الريل مو لليوم. `--replace` يستبدل سطرًا بنفس الرابط.
- الترتيب: الأحدث أولًا (التاريخ، ثم رقم الشحنة، ثم ترتيب الملف). شبكة الريلات تعرض أحدث مضاعف للـ 3 (حد أقصى 12).
- سطر «آخر تحديث» يتحسب تلقائيًا من أحدث تاريخ في الملف.
- ألعاب جديدة: ضع الصفحة في مجلد (مثل `frog/index.html`) وفيه سطر ثيم + `counter.js` (انسخ رأس `hot/index.html`) + قبل `</body>`: `<div data-site="game"></div><script src="/arcade/nav.js"></script>`، ثم أضفها بالسكربت.

English: everything on the home page (reels, tools, games) is rendered from `posts.json` by `home.js`; no HTML to edit.
`tools/add_post.py "<title>" <cover> <link> [--type reel|game|tool] [--n N] [--desc ..] [--badge ..] [--date ..]` copies the cover into `img/`,
puts the entry on top of `posts.json`, bumps the cache versions and prints the git commands. Newest first = date, then `n` (الشحنة), then list order.

## الرأس والذيل الموحّد | One header and footer

العربي: رأس الموقع (الشعار، الألعاب، البرومبتات، تابعني، الثيم) وذيله موجودين في ملف واحد بس: `nav.js`. أي صفحة جديدة تحط بعد `<body>`:
`<div data-site="header"></div><script src="/arcade/nav.js"></script>` وفي آخرها `<div data-site="footer"></div>`. ممنوع تنسخ HTML الرأس داخل صفحة.
الألعاب اللي تملأ الشاشة تحط `<div data-site="game"></div>` بدلها: زر صغير «كل الألعاب» يختفي وقت اللعب. `bump_version.py --check` ينبّه لو صفحة ما تستخدمه.

English: the site header/footer markup and CSS live only in `nav.js` (placeholders `data-site="header|footer|game"`); `bump_version.py` versions it and warns about pages without it.

## الواجهة والمشاريع | Hero and featured projects

العربي: أرقام صفحة الألعاب تنحسب لحالها (`"stats": [{"auto": "games|lessons|reels|tools", "l": "..."}]` في `featured.json`) وتحتها «آخر تحديث». لا تكتب أرقام متابعين أو مشاهدات بيدك: تصير قديمة. بطاقات «المشاريع» في نفس الملف (`"kind": "game"` = تطلع في قسم الألعاب). عدّل النص بيده ثم `python tools/bump_version.py` وادفع. أول بطاقة تظهر عريضة على الكمبيوتر. `"soon": true` = بطاقة «قريبًا» بدون رابط. الصور في `img/feat_*.webp` (1200×750، أقل من 100 KB).

English: hero stats and the featured project cards live in `featured.json` (`stats: [{v,l}]`, `featured: [{title,kicker,desc,image,link,cta,badge,soon}]`), fetched by `home.js` with `cache: no-cache`. The first card is drawn wide on desktop. The «أ» medallion is `img/hero_medallion.webp` (cropped from brand/assets_pack_v1/04_end_card.png). Reel grid: 3 columns on phones, 6 on desktop, full rows only.

## ليش الموقع ما يتحدّث | Why the site did not update

العربي: GitHub Pages والمتصفح يخزّنون `theme.css` و`theme.js` و`counter.js` مدة طويلة. الحل: كل صفحة تطلبها برقم نسخة `?v=YYYYMMDDHHMM`.

```
python tools/bump_version.py          # قبل كل نشر (add_post.py يشغّله لحاله)
python tools/bump_version.py --check  # فحص بدون تغيير
```

- غيّرت `theme.css` أو أي JS؟ شغّل `bump_version.py` قبل الـ commit، وإلا بعض الأجهزة تشوف النسخة القديمة.
- `posts.json` يُجلب بـ `cache: no-cache`، فالريل الجديد يظهر حتى لو صفحة HTML نفسها لسه محفوظة (GitHub Pages يحفظ الـ HTML حتى 10 دقائق).
- نفس السكربت يزامن مقطع «طبّق الثيم قبل أول رسم» داخل كل صفحة من `tools/theme_init.html`. لا تعدّله يدويًا داخل الصفحات.

English: GitHub Pages and browsers cache `tokens.css`, `theme.css`, `theme.js`, `nav.js`, `counter.js` and `home.js` for a long time, so every page loads them with a `?v=YYYYMMDDHHMM` query.
`tools/bump_version.py` rewrites that stamp on every page (run it before each release; `add_post.py` runs it for you) and keeps the inline
"apply the saved theme before first paint" snippet in sync from `tools/theme_init.html`. `posts.json` is fetched with `cache: 'no-cache'`,
so new posts show up even while the HTML page is still cached (Pages serves HTML with up to 10 minutes of cache).

## الثيمات والتصميم | Themes and design system

العربي: الثيمات في القائمة: «ليل» (الافتراضي، الأسود والليموني) · ورق · حبر وذهب · «مخصّص» (خصّص). كل الألوان والمسافات والخطوط والحركة في ملف واحد:
`tokens.css`. المكوّنات (البطاقة، الأزرار، الشرائح، الأيقونات، قائمة الثيم) في `theme.css`. لا تكتب لون أو مقاس بيدك داخل صفحة: استخدم المتغيّرات.

English: one token file, `tokens.css` (loaded before `theme.css` on every themed page; `bump_version.py` warns if a page misses it):
- colours per theme on `<html data-theme>`: live = `night` (default, lime), `paper`, `inkgold`; the other nine blocks are legacy ids the theme init maps to a live theme.
  Roles: `--bg --fg --mute --gold (accent fill) --gold-text (accent text) --gold-ink (text on accent) --glass (card) --edge (hairline) --focus`,
  semantic aliases `--surface-0/1/2 --border --border-strong --accent --accent-text --on-accent --shadow-1/2/3 --glow`.
- spacing `--s-1..--s-20` (4/8 grid), radii `--r-xs/sm/md/lg/pill` (× the customiser's `--rad`), type `--t-xs (13px) .. --t-hero`,
  line-heights `--lh-body 1.8 / --lh-ui 1.5 / --lh-head 1.45 / --lh-display 1.25` (Arabic needs taller lines), controls `--h-tap 44px / --h-control 48px`,
  motion `--dur-1/2/3 = 120/180/240 ms`, `--ease-out`, `--ease-std` (all 0 under prefers-reduced-motion).
- `?theme=paper|night|inkgold` forces a theme for one visit (screenshots). Saved choice: `localStorage` key `anas_theme`.
- `python tools/check_contrast.py` checks WCAG AA in every live theme: body, muted and accent text on the page, the card, the raised surface and
  code boxes (4.5:1), the focus ring (3:1) and the button text. `--all` enforces the legacy themes too. The games keep their own night look;
  only the stage colour behind the canvas follows the theme (`--stage`).

Components in `theme.css`: `.card` (= `.glass`; anatomy `.card-meta` chips, `.card-title`, `.card-desc`, `.card-actions`), `.btn` primary /
`.btn.ghost` secondary / `.btn.quiet` text (`.lg`, `.block`), `.chip` tappable pill (old name `.pill`; `aria-pressed`/`aria-current` = selected),
`.tag` static label (`.tag-accent`, `.tag-key` = the reel keyword), `.i` icon, `.skip-link`, `.toast`, theme menu `.tm-*` and panel `.tc-*`,
cross-page View Transitions (≤240 ms, off under reduced motion).

## الخطوط | Fonts

Self-hosted in `fonts/` (no Google Fonts request on themed pages), `font-display:swap`, the two Arabic files are preloaded:
- Text: **IBM Plex Sans Arabic** 400 and 600 (Google Fonts' woff2 files, unmodified, split by `unicode-range` into Arabic and Latin; the font's
  Latin glyphs are Plex Sans, so English words match). Licence SIL OFL 1.1, `fonts/OFL-IBMPlexSansArabic.txt` (Reserved Font Name "Plex": do not subset or rename these files).
- Display: **Lalezar** 400, subset to Arabic + Latin with fontTools. SIL OFL 1.1, `fonts/OFL-Lalezar.txt` (no reserved name).
- Only these weights exist. `font-synthesis:none` is on, so a stray `font-weight:700/800` renders 600 instead of a fake bold.
  Lalezar is for short display lines only (page titles, section titles, the footer invite); everything else is Plex.
- Full-screen games keep their own fonts (their canvases are untouched).

## الأيقونات | Icons

One set: **Lucide** paths (ISC licence, https://lucide.dev/license), 24 px grid, stroke `--icon-stroke` (1.75), round caps. `nav.js` injects them once as an
inline SVG sprite; use `<svg class="i" aria-hidden="true"><use href="#i-download"/></svg>` in HTML or `ANAS_ICON('download','i-sm')` in JS.
Names: search x download copy check share arrow-left arrow-up-left arrow-down-left chevron-down plus minus instagram youtube gamepad play book
video code clipboard file sliders volume-on volume-off external. No emoji or text arrows in the UI (emoji inside copyable prompts is content, not UI).
The «أ» mark and the hero plate are our own drawings.

## ملفات | Files

`index.html` (= `s/index.html`, copied by `bump_version.py`) · `home.js` · `posts.json` · `featured.json` · `tokens.css` · `theme.css` · `theme.js` · `nav.js` · `counter.js` (hits.sh visit counter) · `fonts/` · `img/` · `tools/` (`add_post.py`, `bump_version.py`, `check_contrast.py`, `theme_init.html`).
Requires Python 3.10+; Pillow is optional (shrinks covers).
