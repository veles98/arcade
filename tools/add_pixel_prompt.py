"""One-off: add the «بكسل» gift (N4 pixel montage reel, 10-29) to p/index.html as #pixel."""
import os, html
p = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "p", "index.html")
s = open(p, encoding="utf-8").read()
k = "pixel"
h2 = "برومبت مونتاج البكسل"
sub = "الصقه في Gemini، وغيّر المشهد بين القوسين كل مرة. نفس الستايل والألوان يطلع في كل صورة. حط لكل جملة في كلامك صورة، ورتّبها في CapCut."
body = ("Create an image: vertical 9:16 retro pixel-art collage illustration, dark olive green background with soft spotlight vignette and film grain, "
        "[وصف المشهد بالإنجليزي، مثال: a beige 1990s computer monitor showing three red error windows], "
        "chunky pixel-art style, limited palette olive green, red, cream, black, no text.\n\n"
        "للصورة الثانية وما بعدها ابدأ بـ: Same exact style as the previous image.\n\n"
        "تبي تحرّك الأجزاء لحالها (يد، شاشة، ساعة)؟ اطلب كل قطعة لحالها وأضف في آخر الوصف:\n"
        "isolated on a flat pure green #00FF00 background, no shadow, no vignette, no grain\n"
        "وبعدها شيل الأخضر في CapCut (Chroma key) وحرّك كل قطعة.")
assert f'id="{k}"' not in s
add = (f'<section id="{k}" class="card glass"><h2>{h2}</h2><p class="s">{sub}</p>\n<div class="box"><div class="tools"><button class="cp" data-t="{k}">نسخ</button>'
       f'<button class="more">اعرض الكل</button></div><pre id="t-{k}" >{html.escape(body)}</pre></div></section>\n')
first = s.index('<section id="')
s = s[:first] + add + s[first:]
s = s.replace('<a class="pill" href="#', '<a class="pill" href="#pixel">مونتاج البكسل</a><a class="pill" href="#', 1)
open(p, "w", encoding="utf-8").write(s); print("ok")
