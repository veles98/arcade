---
name: edit-studio
description: A video editing studio for Claude Code. Gives Claude eyes (frame contact sheets), ears (word-timed transcription and silence detection) and hands (cut pauses, level the sound, burn word-by-word captions, render vertical reels) using free tools (FFmpeg, Python, faster-whisper). Use when the user wants to edit a video or voice recording, make a reel or short, add captions or subtitles, remove silences, or check how a video looks.
---

# استوديو المونتاج

تعطي Claude Code عيون وأذون ويدين للفيديو. المستخدم يوصف الفيديو اللي يبيه، وأنت تسوي المونتاج بالأدوات اللي تحت، وتشوف النتيجة بنفسك قبل ما تسلّمه.

## أول مرة: التجهيز
افحص وش موجود قبل ما تثبت أي شي، وقل للمستخدم كل أمر قبل ما تشغّله:
- `ffmpeg -version` و`ffprobe -version`. إذا مو موجود: على ويندوز `winget install Gyan.FFmpeg`، وعلى الماك `brew install ffmpeg`.
- `python --version` (3.9 أو أحدث).
- `pip install faster-whisper` (للتفريغ بوقت كل كلمة).
السكربتات في مجلد `scripts/` داخل هالسكيل. شغّلها من مجلد شغل المستخدم بمسارها الكامل.

## الأدوات
| | الأمر | وش يسوي |
|---|---|---|
| عيون | `python scripts/see.py video.mp4` | صورة وحدة فيها لقطة كل ثانية مع وقتها. افتحها وشوف الفيديو |
| أذون | `python scripts/hear.py voice.m4a` | `words.json`: كل كلمة بوقتها، وأماكن السكوت. ويطبع الكلام |
| يدين | `python scripts/cut.py voice.m4a words.json` | يقصّر الوقفات الطويلة لـ0.3 ثانية، ويضبط الصوت على -14 LUFS |
| يدين | `python scripts/captions.py video.mp4 words.json` | ترجمة كلمة كلمة، والكلمة اللي تنقال تتلوّن |

## طريقة الشغل (ريل من تسجيل صوت أو فيديو)
1. **اسمع:** `hear.py` على الملف. قارن الكلام بنص المستخدم إذا عنده نص، وصحّح الكلمات الغلط في `words.json`.
2. **دوّر على الإعادات:** إذا المستخدم قال جملة مرتين، احذف المحاولة الأولى. احسب وقتها من `words.json` وقصّها بـffmpeg (`-ss` و`-to` ثم `concat`).
3. **قص:** `cut.py`، وبعدها `hear.py` مرة ثانية على الناتج عشان أوقات الكلمات الجديدة.
4. **الصورة:**
   - إذا عنده فيديو، استخدمه.
   - إذا صوت بس، سوّ خلفية بالمقاس الطولي:
     `ffmpeg -f lavfi -i color=c=0x14121a:s=1080x1920:r=30 -i cut.wav -shortest -c:v libx264 -c:a aac base.mp4`
   - أو ركّب صور المستخدم بالترتيب على وقت الكلام، مع زووم خفيف (`zoompan`).
5. **الترجمة:** `captions.py`. اختار لون يناسب ستايله، وخل الترجمة فوق خط 1450 عشان ما يغطيها شريط التطبيق.
   - **الكلمات المضيئة (شكل المونتاج الاحترافي):** اختار من 3 إلى 6 كلمات مفتاحية من الكلام (رقم، نتيجة، كلمة قوية)، ومررها بـ`--glow "كلمة1,كلمة2"`. كل وحدة تطلع كبيرة ومضيئة في نص الشاشة لحظة ما تنقال. انسخ الكلمة من `words.json` بالضبط.
6. **شوف بعيونك:** `see.py` على `final.mp4`، وافتح الصورة. تأكد:
   - ما فيه لقطة سودا أو فاضية.
   - الترجمة مقروءة وما تطلع برا الشاشة.
   - فيه تغيير كل ثانيتين تقريباً.
   إذا شي غلط، صلّحه وأعد الرندر.
7. **سلّم:** قل له وين الملف، وطوله، وكم وقفة قصّرت، وأي شي ما قدرت تتأكد منه.

## قواعد
- الصوت أهم شي: لا تقص في نص كلمة، وخل وقفة 0.3 ثانية بين الجمل عشان ما يطلع مقطّع.
- المقاس الطولي 1080×1920 بـ30 إطار، إلا إذا طلب غيره.
- لا تحط موسيقى من النت إلا إذا رخصتها تسمح، واسأله أول.
- لا تمسح ملفاته الأصلية. كل الناتج في ملفات جديدة.
