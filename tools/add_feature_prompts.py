"""One-off: add the gifts for the features reels (#ask, #project, #tool) to p/index.html."""
import os, html
p = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "p", "index.html")
s = open(p, encoding="utf-8").read()
SEC = {
 "ask": ("جملة «اسألني قبل ما تبدأ»", "حطها في آخر أي طلب: خطة، إيميل، فكرة مشروع.",
         "[اكتب طلبك هنا]\n\nقبل ما تبدأ، اسألني ٥ أسئلة عن وضعي وهدفي واللي أبيه بالضبط.\nاسألها كلها مرة وحدة، وانتظر جوابي.\nبعد ما أجاوب، اكتب الجواب على مقاسي أنا، مو جواب عام.\nوفي الآخر قل لي وش الشي اللي لو عرفته عني كان الجواب صار أحسن."),
 "project": ("تعليمات المشروع (Projects)", "في Claude: سوّ Project جديد، والصق هذا في التعليمات، وارفع ملفاتك. وكل محادثة داخله تعرف شغلك.",
             "أنا [اسمك]، وأشتغل في [مجالك].\nجمهوري: [مين يشوف شغلي، أعمارهم، ووش يهمهم].\nأسلوبي: [مثلاً: لهجة سعودية بسيطة، جمل قصيرة، بدون مبالغة].\nأهدافي هالشهر: [هدف ١] و[هدف ٢].\n\nقواعد:\n- قبل أي جواب طويل، اسألني إذا ناقصك شي.\n- استخدم الملفات المرفوعة في المشروع، وقل لي من أي ملف أخذت المعلومة.\n- إذا ما تعرف، قل ما أعرف. لا تخمّن.\n- خل كل جواب ينتهي بخطوة وحدة أسويها الحين."),
 "tool": ("أداة تشتغل داخل المحادثة", "الصقه في Claude، وتطلع لك حاسبة تشتغل جنب المحادثة. غيّر اللي بين القوسين لأي أداة تبيها.",
          "سوّ لي [حاسبة ميزانية للشهر] كصفحة تفاعلية تشتغل داخل المحادثة.\n- خانات أكتب فيها: [الراتب، الإيجار، الأكل، البنزين، أخرى].\n- تحسب لي اللي يبقى، وتلوّن الرقم أحمر لو بالسالب.\n- بالعربي ومن اليمين لليسار، وخط واضح على الجوال.\n- زر يرجّع كل الخانات للصفر.\nبعدها اسألني وش أبي أعدّل."),
}
add = ""
for k, (h2, sub, body) in SEC.items():
    assert f'id="{k}"' not in s, k
    add += (f'<section id="{k}" class="card glass"><h2>{h2}</h2><p class="s">{sub}</p>\n<div class="box"><div class="tools"><button class="cp" data-t="{k}">نسخ</button>'
            f'<button class="more">اعرض الكل</button></div><pre id="t-{k}" >{html.escape(body)}</pre></div></section>\n')
s = s.replace('<section id="hooks"', add + '<section id="hooks"', 1)
s = s.replace('<a class="pill" href="#hooks">٣٠ هوك</a>', '<a class="pill" href="#ask">اسألني قبل</a><a class="pill" href="#project">تعليمات المشروع</a><a class="pill" href="#tool">أداة تشتغل</a><a class="pill" href="#hooks">٣٠ هوك</a>', 1)
open(p, "w", encoding="utf-8").write(s); print("ok")
