r"""Word-highlight Arabic captions as .ass, safe for libass bidi.

Why: in the bundled ffmpeg/libass build, an override tag in the MIDDLE of an
Arabic line ({\c..}word{\c..}) scrambles word order (tested .
So every line here carries tags only in its leading block, is wrapped in
U+202B..U+202C (RTL embedding), and the active word is lit by a second layer
(accent colour) clipped to that word's box. Word boxes are measured with
HarfBuzz using the same font file libass uses.

Usage:
  python ar_caps.py words.json out.ass [--font C:/Windows/Fonts/DUBAI-BOLD.TTF]
        [--family Dubai] [--size 80] [--y 1340] [--max-words 3] [--max-chars 22]
words.json = [{"w": "هذا", "s": 0.10, "e": 0.42}, ...]   (faster-whisper words)
"""
import argparse, json, re
import uharfbuzz as hb

AR = re.compile(r"[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]")
RLE, PDF = "\u202b", "\u202c"


def ts(t):
    h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"


class Measurer:
    def __init__(self, path, size):
        blob = hb.Blob.from_file_path(path)
        self.face = hb.Face(blob)
        self.font = hb.Font(self.face)
        # libass sizes fonts by Windows cell height (winAscent + winDescent)
        os2 = self.face.reference_table("OS/2").data
        win_asc = int.from_bytes(os2[74:76], "big")
        win_desc = int.from_bytes(os2[76:78], "big")
        self.k = size / float(win_asc + win_desc)

    def width(self, text):
        buf = hb.Buffer(); buf.add_str(text); buf.guess_segment_properties()
        hb.shape(self.font, buf, {})
        return sum(p.x_advance for p in buf.glyph_positions) * self.k


def chunk(words, max_words, max_chars):
    out, cur = [], []
    for w in words:
        if cur and (len(cur) >= max_words or len(" ".join(x["w"] for x in cur + [w])) > max_chars):
            out.append(cur); cur = []
        cur.append(w)
    if cur: out.append(cur)
    return out


def visual_boxes(tokens, m):
    """Return [(index, x_left, width)] in visual order for an RTL paragraph."""
    runs, cur, cur_ltr = [], [], None
    for i, t in enumerate(tokens):
        ltr = not AR.search(t)
        if cur and (not ltr or not cur_ltr):
            runs.append((cur_ltr, cur)); cur = []
        cur.append(i); cur_ltr = ltr
    if cur: runs.append((cur_ltr, cur))
    sp = m.width(" ")
    order = []
    for ltr, idx in reversed(runs):            # RTL base: last run is leftmost
        order += idx if ltr else list(reversed(idx))
    x, boxes = 0.0, []
    for n, i in enumerate(order):
        w = m.width(tokens[i]); boxes.append((i, x, w)); x += w + (sp if n < len(order) - 1 else 0)
    return boxes, x


HEAD = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,{fam},{size},&H00FCFAF8,&H00FCFAF8,&H00101010,&H66000000,-1,0,0,0,100,100,0,0,1,7,0,5,90,90,0,178
Style: Hi,{fam},{size},&H00D4C22D,&H00D4C22D,&H00101010,&H66000000,-1,0,0,0,100,100,0,0,1,7,0,5,90,90,0,178

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("words"); ap.add_argument("out")
    ap.add_argument("--font", default="C:/Windows/Fonts/DUBAI-BOLD.TTF")
    ap.add_argument("--family", default="Dubai")
    ap.add_argument("--size", type=int, default=80)
    ap.add_argument("--y", type=int, default=1340)      # line centre; keep 1250-1420 for 9:16
    ap.add_argument("--max-words", type=int, default=3)
    ap.add_argument("--max-chars", type=int, default=22)
    a = ap.parse_args()
    words = json.load(open(a.words, encoding="utf-8"))
    m = Measurer(a.font, a.size)
    lines = [HEAD.format(fam=a.family, size=a.size)]
    pad = 6
    for c in chunk(words, a.max_words, a.max_chars):
        toks = [w["w"].strip() for w in c]
        text = RLE + " ".join(toks) + PDF
        boxes, total = visual_boxes(toks, m)
        x0 = 540 - total / 2
        start, end = c[0]["s"], c[-1]["e"]
        lines.append(f"Dialogue: 0,{ts(start)},{ts(end)},Cap,,0,0,0,,{{\\pos(540,{a.y})}}{text}\n")
        for i, bx, bw in boxes:
            s = c[i]["s"]; e = c[i + 1]["s"] if i + 1 < len(c) else c[i]["e"]
            l, r = int(x0 + bx - pad), int(x0 + bx + bw + pad)
            t, b = a.y - a.size, a.y + a.size
            lines.append(f"Dialogue: 1,{ts(s)},{ts(e)},Hi,,0,0,0,,{{\\pos(540,{a.y})\\clip({l},{t},{r},{b})}}{text}\n")
    open(a.out, "w", encoding="utf-8").write("".join(lines))
    print(f"wrote {a.out}")


if __name__ == "__main__":
    main()
