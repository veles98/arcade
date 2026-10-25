#!/usr/bin/env python3
"""Cache-busting for the arcade site. Run it before every release (add_post.py runs it for you).

What it does, for every .html page in the repo:
  1. rewrites the version query on the shared assets:  theme.css?v=YYYYMMDDHHMM, theme.js, counter.js, home.js
     (GitHub Pages and phones cache these for a long time; a new ?v= makes every browser fetch the new file)
  2. re-syncs the inline "apply the saved theme before first paint" snippet from tools/theme_init.html
     into the <!--theme-init-->...<!--/theme-init--> block of each page

Usage:
  python tools/bump_version.py                  # stamp = now (local time)
  python tools/bump_version.py --stamp 202610251830
  python tools/bump_version.py --check          # change nothing, exit 1 if any page is stale or has no marker
"""
import argparse
import datetime
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SNIPPET_FILE = ROOT / "tools" / "theme_init.html"
SKIP_DIRS = {".git", "node_modules", "tools"}

ASSET_RE = re.compile(
    r"""(?P<pre>(?:href|src)=["'](?:\.\./|\./)*)(?P<name>theme\.css|theme\.js|counter\.js|home\.js)(?:\?v=\d+)?(?=["'])"""
)
BLOCK_RE = re.compile(r"<!--theme-init-->.*?<!--/theme-init-->", re.S)


def pages():
    for p in sorted(ROOT.rglob("*.html")):
        rel = p.relative_to(ROOT)
        if rel.parts[0] in SKIP_DIRS:
            continue
        yield p


def process(path, stamp, snippet):
    text = path.read_text(encoding="utf-8")  # universal newlines: always work on LF
    new = ASSET_RE.sub(lambda m: "%s%s?v=%s" % (m.group("pre"), m.group("name"), stamp), text)
    problems = []
    if BLOCK_RE.search(new):
        new = BLOCK_RE.sub(lambda m: "<!--theme-init-->" + snippet + "<!--/theme-init-->", new)
    elif "theme.css" in new or "canvas" in new:
        problems.append("no <!--theme-init--> block")
    return text, new, problems


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--stamp", help="version stamp YYYYMMDDHHMM (default: now)")
    ap.add_argument("--check", action="store_true", help="report only, do not write")
    args = ap.parse_args()

    stamp = args.stamp or datetime.datetime.now().strftime("%Y%m%d%H%M")
    if not re.fullmatch(r"\d{12}", stamp):
        sys.exit("stamp must be 12 digits: YYYYMMDDHHMM")
    snippet = SNIPPET_FILE.read_text(encoding="utf-8").strip()

    changed, bad = [], []
    for path in pages():
        old, new, problems = process(path, stamp, snippet)
        rel = path.relative_to(ROOT).as_posix()
        for pr in problems:
            bad.append("%s: %s" % (rel, pr))
        if old != new:
            changed.append(rel)
            if not args.check:
                path.write_text(new, encoding="utf-8", newline="\n")
    if args.check:
        # in check mode only the snippet / structure matters, not the stamp itself
        print("pages that would change (stamp or snippet): %d" % len(changed))
    else:
        print("stamp %s: updated %d page(s)" % (stamp, len(changed)))
        for c in changed:
            print("  " + c)
    for b in bad:
        print("WARNING " + b)
    if args.check and bad:
        sys.exit(1)


if __name__ == "__main__":
    main()
