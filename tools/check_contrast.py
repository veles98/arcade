#!/usr/bin/env python3
"""WCAG contrast check for the five themes in theme.css (text must be >= 4.5:1, big/UI shapes >= 3:1).

  python tools/check_contrast.py

Reads the variables of every :root[data-theme=...] block and tests the real combinations the pages use:
body text, muted text, accent text (--gold-text), the text on accent buttons (--gold-ink on --gold), the page marker,
each on the page background (every stop of a gradient background) and on the translucent glass cards painted over it.
"""
import pathlib
import re
import sys

CSS = pathlib.Path(__file__).resolve().parent.parent / "theme.css"
THEMES = ["paper", "night", "lake", "neon", "ink", "hybrid", "inkgold", "gallery", "emerald", "midnight", "desert", "ember"]


def parse_color(v):
    v = v.strip()
    m = re.fullmatch(r"#([0-9a-fA-F]{3})", v)
    if m:
        h = m.group(1)
        return tuple(int(c * 2, 16) for c in h) + (1.0,)
    m = re.fullmatch(r"#([0-9a-fA-F]{6})", v)
    if m:
        h = m.group(1)
        return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) + (1.0,)
    m = re.fullmatch(r"rgba?\(([^)]*)\)", v)
    if m:
        p = [x.strip() for x in m.group(1).split(",")]
        a = float(p[3]) if len(p) > 3 else 1.0
        return (float(p[0]), float(p[1]), float(p[2]), a)
    if v == "transparent":
        return (0, 0, 0, 0.0)
    raise ValueError("cannot parse colour: " + v)


def over(top, bottom):
    a = top[3]
    return tuple(top[i] * a + bottom[i] * (1 - a) for i in range(3)) + (1.0,)


def lum(c):
    def f(x):
        x /= 255
        return x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2])


def ratio(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def theme_vars(css, name):
    pat = r':root\[data-theme="%s"\]\{(.*?)\n\}' % name if name != "paper" else r':root,:root\[data-theme="paper"\]\{(.*?)\n\}'
    m = re.search(pat, css, re.S)
    if not m:
        sys.exit("theme block not found: " + name)
    return dict((k, v.strip()) for k, v in re.findall(r"--([\w-]+):((?:[^;]|;(?=[^\n]*\)))*?);", m.group(1)))


def main():
    css = CSS.read_text(encoding="utf-8")
    failures = 0
    for name in THEMES:
        v = theme_vars(css, name)
        backs = [("bg", parse_color(v["bg"]))]
        img = v.get("bg-img", "")
        if "gradient" in img:
            for i, hx in enumerate(re.findall(r"#[0-9a-fA-F]{6}", img)):
                backs.append(("bg-stop%d" % i, parse_color(hx)))
        glass = parse_color(v["glass"])
        code = parse_color(v["code-bg"])
        fg, mute = parse_color(v["fg"]), parse_color(v["mute"])
        gtext = parse_color(v["gold-text"])
        gold, gink = parse_color(v["gold"]), parse_color(v["gold-ink"])
        mfg, mbg = parse_color(v["mark-fg"]), parse_color(v["mark-bg"])
        print("== %s" % name)
        rows = []
        for bn, b in backs:
            surfaces = [(bn, b), (bn + "+glass", over(glass, b)), (bn + "+code", over(code, b))]
            for sn, s in surfaces:
                rows.append(("fg on " + sn, ratio(fg, s), 4.5))
                rows.append(("mute on " + sn, ratio(mute, s), 4.5))
                rows.append(("accent text on " + sn, ratio(gtext, s), 4.5))
        rows.append(("button: gold-ink on gold", ratio(gink, gold), 4.5))
        if mbg[3] > 0:
            rows.append(("marker: mark-fg on mark-bg", ratio(mfg, mbg), 4.5))
        for label, r, need in rows:
            ok = r >= need
            failures += not ok
            print("  %-34s %5.2f  %s" % (label, r, "ok" if ok else "FAIL (need %.1f)" % need))
    print("\n%s" % ("all checks pass" if not failures else "%d failure(s)" % failures))
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
