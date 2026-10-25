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
- ألعاب جديدة: ضع الصفحة في مجلد (مثل `frog/index.html`) وفيه سطر ثيم + `counter.js` (انسخ رأس `hot/index.html`)، ثم أضفها بالسكربت.

English: everything on the home page (reels, tools, games) is rendered from `posts.json` by `home.js`; no HTML to edit.
`tools/add_post.py "<title>" <cover> <link> [--type reel|game|tool] [--n N] [--desc ..] [--badge ..] [--date ..]` copies the cover into `img/`,
puts the entry on top of `posts.json`, bumps the cache versions and prints the git commands. Newest first = date, then `n` (الشحنة), then list order.

## الواجهة والمشاريع | Hero and featured projects

العربي: أرقام الواجهة (المشاهدات، المتابعين، الألعاب) وبطاقات «المشاريع» في الملف `featured.json`. عدّل النص بيده ثم `python tools/bump_version.py` وادفع. أول بطاقة تظهر عريضة على الكمبيوتر. `"soon": true` = بطاقة «قريبًا» بدون رابط. الصور في `img/feat_*.webp` (1200×750، أقل من 100 KB).

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

English: GitHub Pages and browsers cache `theme.css`, `theme.js`, `counter.js` and `home.js` for a long time, so every page loads them with a `?v=YYYYMMDDHHMM` query.
`tools/bump_version.py` rewrites that stamp on every page (run it before each release; `add_post.py` runs it for you) and keeps the inline
"apply the saved theme before first paint" snippet in sync from `tools/theme_init.html`. `posts.json` is fetched with `cache: 'no-cache'`,
so new posts show up even while the HTML page is still cached (Pages serves HTML with up to 10 minutes of cache).

## الثيمات | Themes

ورق (الافتراضي) · ليل ذهبي · بحيرة · نيون · حبر. The picker (five dots) is in the top bar; the choice is saved in `localStorage` key `anas_theme`.
`?theme=paper|night|lake|neon|ink` forces a theme for one visit (used for screenshots). Colours live in `theme.css` as variables;
`python tools/check_contrast.py` verifies WCAG AA (4.5:1) for body, muted and accent text in every theme. The games keep their night look;
only the stage colour behind the canvas follows the theme (`--stage`).

## ملفات | Files

`index.html` · `home.js` · `posts.json` · `featured.json` · `theme.css` · `theme.js` · `counter.js` (hits.sh visit counter) · `img/` · `tools/` (`add_post.py`, `bump_version.py`, `check_contrast.py`, `theme_init.html`).
Requires Python 3.10+; Pillow is optional (shrinks covers).
