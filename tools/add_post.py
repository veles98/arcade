#!/usr/bin/env python3
"""Add one item to the home page (posts.json), copy its cover into img/, bump the cache versions and print the git commands.

  python tools/add_post.py "<title>" <cover-path> <link> [--type reel|game|tool] [--n 3]
                           [--desc "one line"] [--date 2026-10-27] [--badge "جديدة"] [--best localStorage_key]
                           [--replace] [--no-bump]

  title    shown on the card (and as the image alt for reels)
  cover    path of the cover image (any size; shrunk to <= 720 px wide JPEG when Pillow is installed)
  link     the reel URL (https://www.instagram.com/reel/XXXX/) or a page of this site (hot/, p/#skills ...)
  --type   reel = cover grid, game = games list, tool = prompts/tools list.
           Default: reel for an Instagram link, game for a relative link, tool for any other URL.
  --n      the «الشحنة» number of the series, optional (a small chip shows on game/tool cards)
  --date   YYYY-MM-DD, default today. The page sorts newest first (date, then n, then list order).

Nothing is committed or pushed: the script prints the git commands for you to run.
Needs Python 3.10+. Pillow is optional (pip install pillow).
"""
import argparse
import datetime
import hashlib
import json
import pathlib
import re
import shutil
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
POSTS = ROOT / "posts.json"
IMG = ROOT / "img"


def cover_name(title, link):
    m = re.search(r"instagram\.com/(?:reel|p|reels)/([A-Za-z0-9_-]+)", link)
    if m:
        return m.group(1)
    slug = re.sub(r"[^a-z0-9]+", "-", link.lower()).strip("-")
    if not re.fullmatch(r"[a-z0-9-]{3,}", slug or ""):
        slug = ""
    h = hashlib.sha1((title + link).encode("utf-8")).hexdigest()[:8]
    return ("post-" + (slug[:24].strip("-") + "-" if slug else "") + h)


def copy_cover(src, name):
    src = pathlib.Path(src)
    if not src.is_file():
        sys.exit("cover not found: %s" % src)
    IMG.mkdir(exist_ok=True)
    try:
        from PIL import Image
    except ImportError:
        dest = IMG / (name + src.suffix.lower())
        shutil.copyfile(src, dest)
        print("Pillow not installed: copied the cover as is")
        return dest
    dest = IMG / (name + ".jpg")
    im = Image.open(src).convert("RGB")
    if im.width > 720:
        im = im.resize((720, round(im.height * 720 / im.width)), Image.LANCZOS)
    im.save(dest, "JPEG", quality=82, optimize=True, progressive=True)
    return dest


def main():
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(errors="replace")   # an Arabic title must never crash a narrow console
        except (AttributeError, ValueError):
            pass
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("title")
    ap.add_argument("cover")
    ap.add_argument("link")
    ap.add_argument("--type", choices=["reel", "game", "tool"])
    ap.add_argument("--n", type=int, help="shipment number (الشحنة)")
    ap.add_argument("--desc", default="", help="one-line description (game/tool cards)")
    ap.add_argument("--date", help="YYYY-MM-DD (default: today)")
    ap.add_argument("--badge", default="", help='small label next to the title, e.g. "جديدة"')
    ap.add_argument("--best", default="", help="localStorage key holding the player's best score (games)")
    ap.add_argument("--replace", action="store_true", help="replace an existing entry with the same link")
    ap.add_argument("--no-bump", action="store_true", help="do not run bump_version.py")
    a = ap.parse_args()

    if a.n is not None and a.n < 1:
        sys.exit("--n must be 1 or more")
    date = a.date or datetime.date.today().isoformat()
    try:
        datetime.date.fromisoformat(date)
    except ValueError:
        sys.exit("--date must be YYYY-MM-DD")
    typ = a.type or ("reel" if "instagram.com" in a.link else "tool" if re.match(r"https?://", a.link) else "game")

    data = json.loads(POSTS.read_text(encoding="utf-8"))
    posts = data["posts"]
    dup = [i for i, p in enumerate(posts) if p.get("link") == a.link]
    if dup and not a.replace:
        sys.exit("an entry with this link already exists (use --replace to overwrite it)")

    dest = copy_cover(a.cover, cover_name(a.title, a.link))
    entry = {"type": typ, "title": a.title}
    if a.desc:
        entry["desc"] = a.desc
    entry.update({"cover": dest.relative_to(ROOT).as_posix(), "link": a.link, "date": date, "n": a.n})
    if a.badge:
        entry["badge"] = a.badge
    if a.best:
        entry["best"] = a.best
    for i in reversed(dup):
        posts.pop(i)
    posts.insert(0, entry)
    POSTS.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    print("added to posts.json: %s [%s] %s -> %s" % (a.title, typ, date, entry["cover"]))

    if not a.no_bump:
        subprocess.run([sys.executable, str(ROOT / "tools" / "bump_version.py")], check=True)

    try:
        branch = subprocess.run(["git", "-C", str(ROOT), "branch", "--show-current"], capture_output=True, text=True).stdout.strip() or "main"
    except OSError:
        branch = "main"
    msg = "Add post: " + dest.stem   # ASCII only, safe to paste in any console
    print("\nNow publish it (copy and run):\n")
    print('cd "%s"' % ROOT)
    print("git add -A")
    print('git -c user.name=veles98 -c user.email=veles98@users.noreply.github.com commit -m "%s"' % msg)
    print("git push origin %s" % branch)
    print("\nThe live site updates about a minute after the push: https://veles98.github.io/arcade/")


if __name__ == "__main__":
    main()
