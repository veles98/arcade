"""Builds learn/day-1/index.html (lesson page for «بدون كود · يوم ١») from the episode caption prompt.
Re-run after editing the texts below, then python tools/bump_version.py."""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAPTION = r"C:/Users/anasg/CreatorStudio/reels/EP01_redo/caption.txt"
REEL = "https://www.instagram.com/reel/DfAOUV7A28A/"
FIX = ("لما أفتح الموقع من الجوال وأكبّر الخط لأكبر حجم، أجزاء من الصفحة تطلع برا الشاشة، ولوحة «خصّص» ما تتبع حجم الخط. "
       "صلّحه، وجرّبه على مقاس جوال بخط كبير قبل ما ترسله لي.")


def esc(t):
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


head3 = open(os.path.join(ROOT, "tawwaq", "index.html"), encoding="utf-8").read().split("\n")[2]   # theme-init + theme.css/js
head3 = head3.replace('href="../theme.css', 'href="../../theme.css').replace('src="../theme.js', 'src="../../theme.js')
assert "../../theme.css" in head3 and "../../theme.js" in head3
prompt = open(CAPTION, encoding="utf-8").read().split("ChatGPT:\n", 1)[1].split("\n\nبدون كود", 1)[0].strip()

CSS = """
.hero{display:grid;gap:18px;align-items:center;margin:0 0 18px}
@media(min-width:760px){.hero{grid-template-columns:1fr 280px}}
.vid{width:100%;max-width:280px;aspect-ratio:9/16;border-radius:18px;display:block;margin:0 auto;background:#000;border:1px solid var(--edge);object-fit:cover}
.ep{display:inline-block;font-family:Alexandria,sans-serif;font-weight:800;font-size:13px;color:var(--gold-ink);background:var(--gold);padding:3px 12px;border-radius:999px}
.go{display:flex;align-items:center;justify-content:center;min-height:56px;padding:12px 18px;border-radius:14px;background:var(--gold);color:var(--gold-ink);text-decoration:none;font-family:Alexandria,sans-serif;font-weight:800;font-size:17px;margin-top:14px}
section.card{padding:20px 18px 18px;margin:0 0 16px}
section.card h2{font-family:Alexandria,sans-serif;font-weight:600;font-size:20px;margin:0 0 10px}
section.card p,section.card li{color:var(--mute);line-height:1.85;font-size:15px}
section.card ol,section.card ul{margin:0;padding-inline-start:20px}
section.card li+li{margin-top:6px}
section.card b{color:var(--fg)}
.code{position:relative;margin:10px 0 0}
.code pre{margin:0;white-space:pre-wrap;word-break:break-word;font-family:"IBM Plex Sans Arabic",sans-serif;font-size:14.5px;line-height:1.85;padding:16px 16px 60px;border-radius:14px;border:1px solid var(--edge);background:var(--glass-2);color:var(--fg)}
.copy{position:absolute;inset-inline-start:12px;bottom:12px;min-height:40px;padding:0 16px;border-radius:999px;border:0;background:var(--gold);color:var(--gold-ink);font-family:Alexandria,sans-serif;font-weight:800;font-size:14px;cursor:pointer}
.quote{font-family:Alexandria,sans-serif;font-weight:800;font-size:clamp(20px,5.4vw,26px);line-height:1.6;color:var(--fg);margin:4px 0 0}
.quote span{color:var(--mark-fg);background:linear-gradient(transparent 42%,var(--mark-bg) 42%,var(--mark-bg) 94%,transparent 94%)}
.next{display:grid;gap:10px}
@media(min-width:760px){.next{grid-template-columns:1fr 1fr}}
.ghostbtn{display:flex;align-items:center;justify-content:center;min-height:52px;border-radius:14px;border:1px solid var(--edge);background:var(--glass-2);color:var(--fg);text-decoration:none;font-weight:600}
"""

JS = """
document.addEventListener('click', function (e) {
  var b = e.target.closest('[data-copy]'); if (!b) return;
  var src = document.getElementById(b.dataset.copy), t = src.textContent, old = b.textContent;
  function done() { b.textContent = 'تم النسخ'; setTimeout(function () { b.textContent = old; }, 1600); }
  function fallback() {
    var r = document.createRange(); r.selectNodeContents(src); var s = getSelection(); s.removeAllRanges(); s.addRange(r);
    try { document.execCommand('copy'); done(); } catch (x) {}
  }
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(done, fallback); else fallback();
});
"""

BODY = f"""<header class="bar glass"><a class="brand" href="../../"><img class="logo" src="../../img/hero_pixel_96.webp" alt="" width="30" height="30"><span class="bn">anas.ai.ar</span></a><span class="sp"></span>
<a class="pill" href="../../#learn">رحلة التعلّم</a>
<div class="tp" data-tp></div></header>
<div class="hero"><div>
<span class="ep">الحلقة ١ · بدون كود</span>
<h1>موقع كامل… <span>من غير ولا سطر كود</span></h1>
<p class="lead">كلّمت الذكاء الاصطناعي بكلامي العادي، وطلع لي موقع شخصي يختار فيه الزائر الشكل اللي يعجبه. هنا الطريقة كاملة، والبرومبت جاهز تنسخه.</p>
<a class="go" href="{REEL}" target="_blank" rel="noopener">شوف الحلقة على إنستغرام</a>
</div>
<video class="vid" src="media/preview.mp4" poster="media/poster.jpg" autoplay muted loop playsinline preload="metadata"></video>
</div>
<section class="card glass"><h2>وش بنينا</h2><ul>
<li>صفحة شخصية تكون <b>رابط البايو</b>: صورتك، اسمك، نبذة، وزر «تابعني».</li>
<li><b>ثيمات جاهزة</b> وزر «خصّص» (اللون والخط والزوايا)، والموقع يحفظ اختيار الزائر.</li>
<li>يشتغل على <b>الجوال أول</b>، وبالعربي من اليمين لليسار.</li>
<li>تبي تشوفه شغال؟ هو <a href="../../">الموقع اللي أنت فيه الحين</a>. جرّب الثيمات من النقاط فوق.</li>
</ul></section>
<section class="card glass"><h2>الخطوات</h2><ol>
<li>انسخ البرومبت تحت، وغيّر اللي بين القوسين ببياناتك.</li>
<li>ألصقه في <b>Claude</b> أو <b>ChatGPT</b>.</li>
<li>احفظ الكود اللي يطلع في ملف اسمه <b>index.html</b>، وافتحه في المتصفح.</li>
<li>افتحه من الجوال، وكبّر الخط لأكبر حجم، وشوف هل فيه شي طالع برا الشاشة.</li>
<li>لو فيه مشكلة، ارجع واشرحها بالضبط (فيه مثال تحت).</li>
<li>انشره مجانًا على <b>GitHub Pages</b>، والذكاء الاصطناعي يشرح لك الخطوات.</li>
</ol></section>
<section class="card glass" id="prompt"><h2>البرومبت</h2><p>هذا اللي كتبته بكلامي العادي. غيّر اللي بين القوسين.</p>
<div class="code"><pre id="p1">{esc(prompt)}</pre><button class="copy" data-copy="p1">انسخ البرومبت</button></div></section>
<section class="card glass"><h2>الغلطة… وكيف انحلت</h2>
<p>لما فتحت الموقع من الجوال وكبّرت الخط، <b>التصميم اتلخبط</b>: أجزاء طلعت برا الشاشة، ولوحة «خصّص» ما كانت تتبع حجم الخط.</p>
<p>رجعت للذكاء الاصطناعي، وقلت له المشكلة <b>بالضبط</b>، وصلّحناها. بعد التصليح جرّبنا الموقع على <b>١٩٢٠ حالة</b> (مقاسات جوالات، أحجام خط، وثيمات)، وما طلع ولا خطأ.</p>
<p>مثال لطلب التصليح، اكتبه بكلامك:</p>
<div class="code"><pre id="p2">{esc(FIX)}</pre><button class="copy" data-copy="p2">انسخ</button></div></section>
<section class="card glass"><h2>الدرس</h2>
<p class="quote">السر مش إنك تبني وخلاص… <span>السر إنك تجرّب وتصلّح.</span></p></section>
<div class="next">
<a class="go" href="https://www.instagram.com/anas.ai.ar/" target="_blank" rel="noopener">تابعني للحلقة الجاية</a>
<a class="ghostbtn" href="../../#learn">ارجع لرحلة التعلّم</a>
</div>"""

html = f"""<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>الدرس ١: موقع كامل من غير ولا سطر كود</title><meta name="description" content="بدون كود · يوم ١: كلّمت الذكاء الاصطناعي بكلامي العادي وطلع موقع شخصي بثيمات. الخطوات، والبرومبت جاهز للنسخ، والغلطة وكيف انحلت."><meta property="og:title" content="بدون كود · يوم ١: موقع كامل من غير ولا سطر كود"><meta property="og:image" content="https://veles98.github.io/arcade/img/og_pixel.jpg"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Alexandria:wght@600;800&family=IBM+Plex+Sans+Arabic:wght@400;600&display=swap">
{head3}
<style>{CSS}</style></head><body><div class="wrap">
{BODY}
</div>
<script>{JS}</script>
<script src="../../counter.js?v=202610270955" defer></script>
</body></html>
"""
out = os.path.join(ROOT, "learn", "day-1", "index.html")
open(out, "w", encoding="utf-8").write(html)
print("lesson page ->", out, len(html))
