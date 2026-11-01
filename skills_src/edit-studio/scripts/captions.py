"""Hands 2: burn word-by-word captions (the word being said lights up) onto a video.

python captions.py video.mp4 words.json [--font "Tahoma"] [--color FFD34D] [--per-line 3] [--y 1450] [--glow "word1,word2"] [--out final.mp4]
Groups 1 to --per-line words per line, breaks lines at pauses, and highlights the current word.
Works for Arabic (right to left) and English. If the video has no picture yet, make one first, e.g.
ffmpeg -f lavfi -i color=c=0x14121a:s=1080x1920:r=30 -i cut.wav -shortest -c:v libx264 -c:a aac base.mp4
"""
import argparse
import json
import subprocess


def ts(t):
    h, m, s = int(t // 3600), int(t % 3600 // 60), t % 60
    return f"{h}:{m:02d}:{s:05.2f}"


def bgr(hexrgb):
    return f"&H00{hexrgb[4:6]}{hexrgb[2:4]}{hexrgb[0:2]}&"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("words")
    ap.add_argument("--font", default="Tahoma")
    ap.add_argument("--size", type=int, default=86)
    ap.add_argument("--color", default="FFD34D", help="highlight colour, RRGGBB")
    ap.add_argument("--per-line", type=int, default=3, help="max words per line")
    ap.add_argument("--y", type=int, default=1450, help="baseline from top, on a 1920-high video")
    ap.add_argument("--glow", default="", help="key words to pop big and glowing in the middle, comma separated")
    ap.add_argument("--glow-y", type=int, default=1050, help="height of the glowing words")
    ap.add_argument("--out", default="final.mp4")
    a = ap.parse_args()
    words = json.load(open(a.words, encoding="utf-8"))["words"]
    # group words into short lines; a pause of 0.35 s or more starts a new line
    lines, cur = [], []
    for w in words:
        if cur and (len(cur) >= a.per_line or w["start"] - cur[-1]["end"] >= 0.35):
            lines.append(cur)
            cur = []
        cur.append(w)
    if cur:
        lines.append(cur)
    hi = bgr(a.color)
    ev = []
    for li, line in enumerate(lines):
        line_end = lines[li + 1][0]["start"] if li + 1 < len(lines) else line[-1]["end"] + 0.4
        for i, w in enumerate(line):
            s = w["start"]
            e = line[i + 1]["start"] if i + 1 < len(line) else line_end
            parts = [(f"{{\\c{hi}}}{x['w']}{{\\c&H00FFFFFF&}}" if j == i else x["w"]) for j, x in enumerate(line)]
            # libass lays colour-tagged runs out left to right, so Arabic lines came out in reverse word order.
            # Reversing the words puts the first spoken word on the right, where it belongs.
            if any("؀" <= ch <= "ۿ" for x in line for ch in x["w"]):
                parts.reverse()
            text = " ".join(parts)
            ev.append(f"Dialogue: 0,{ts(s)},{ts(e)},Cap,,0,0,0,,{text}")
    # big glowing key words in the middle of the frame (the "pro edit" look): a blurred copy behind a sharp one
    keys = {k.strip() for k in a.glow.split(",") if k.strip()}
    hits = [w for w in words if w["w"].strip("،,.!؟?") in keys]
    for n, w in enumerate(hits):
        s, e = w["start"], w["end"] + 0.7
        if n + 1 < len(hits):
            e = min(e, hits[n + 1]["start"])  # never two glowing words on screen at once
        if True:
            pop = "\\fscx135\\fscy135\\t(0,140,\\fscx100\\fscy100)\\fad(60,180)"
            pos = f"\\an5\\pos(540,{a.glow_y})"
            ev.append(f"Dialogue: 1,{ts(s)},{ts(e)},Glow,,0,0,0,,{{{pos}{pop}\\blur14\\bord10\\3c{hi}\\c{hi}}}{w['w']}")
            ev.append(f"Dialogue: 2,{ts(s)},{ts(e)},Glow,,0,0,0,,{{{pos}{pop}\\bord0\\c&H00F2FAFF&}}{w['w']}")
    ass = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,{a.font},{a.size},&H00FFFFFF,&H00FFFFFF,&H00000000,&H96000000,1,0,0,0,100,100,0,0,3,18,0,2,80,80,{1920 - a.y},1
Style: Glow,{a.font},{int(a.size * 2.1)},&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,0,0,5,40,40,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
""" + "\n".join(ev) + "\n"
    open("captions.ass", "w", encoding="utf-8").write(ass)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.video, "-vf", "subtitles=captions.ass",
                    "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "copy", a.out], check=True)
    print(f"{a.out}: {len(lines)} caption lines from {len(words)} words (captions.ass kept for edits)")


if __name__ == "__main__":
    main()
