# Watch a public video (YouTube / Instagram reel / TikTok) for analysis:
#   python watch.py <url> [name]
# -> ./watched/<name>/ : video.mp4 (<=720p), sheet.jpg (frame every ~1.5 s),
#    transcript.txt (faster-whisper, Arabic/English auto), info.txt (title, views, likes, duration).
# The video file is deleted at the end to save disk; sheet + transcript are kept.
import sys, os, subprocess, json, re
import yt_dlp

import shutil
FF = os.environ.get("FFMPEG") or shutil.which("ffmpeg") or "ffmpeg"
url = sys.argv[1]
name = sys.argv[2] if len(sys.argv) > 2 else re.sub(r"\W+", "_", url.split("?")[0].rstrip("/").split("/")[-1])[:40]
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "watched", name)
os.makedirs(out, exist_ok=True)
vid = os.path.join(out, "video.mp4")

opts = {"outtmpl": vid, "format": "bv*[height<=720]+ba/b[height<=720]/b", "merge_output_format": "mp4",
        "quiet": True, "no_warnings": True, **({"ffmpeg_location": os.path.dirname(FF)} if os.path.dirname(FF) else {})}
cookies = os.environ.get("WATCH_COOKIES")          # optional Netscape cookies file for login-only posts
if cookies: opts["cookiefile"] = cookies
with yt_dlp.YoutubeDL(opts) as y:
    info = y.extract_info(url, download=True)
keys = ["title", "uploader", "duration", "view_count", "like_count", "comment_count", "upload_date", "description"]
with open(os.path.join(out, "info.txt"), "w", encoding="utf-8") as f:
    for k in keys: f.write(f"{k}: {info.get(k)}\n")

dur = info.get("duration")
if not dur:
    pr = subprocess.run([(shutil.which("ffprobe") or "ffprobe"), "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", vid], capture_output=True, text=True)
    dur = float(pr.stdout.strip() or 30)
dur = float(dur)
step = max(1.0, dur / 24)
subprocess.run([FF, "-v", "error", "-y", "-i", vid, "-vf", f"fps=1/{step:.2f},scale=240:-2,tile=6x4", "-frames:v", "1",
                os.path.join(out, "sheet.jpg")], check=True)

try:
    from faster_whisper import WhisperModel
    m = WhisperModel("small", device="cpu", compute_type="int8")
    import numpy as np
    pcm = subprocess.run([FF, "-v", "error", "-i", vid, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True).stdout
    segs, inf = m.transcribe(np.frombuffer(pcm, np.float32).copy(), vad_filter=True)
    with open(os.path.join(out, "transcript.txt"), "w", encoding="utf-8") as f:
        f.write(f"[lang {inf.language}]\n")
        for s in segs: f.write(f"{s.start:6.1f}  {s.text.strip()}\n")
except Exception as e:
    open(os.path.join(out, "transcript.txt"), "w", encoding="utf-8").write(f"no transcript: {e}\n")

if "--keep" not in sys.argv: os.remove(vid)
print(out)
