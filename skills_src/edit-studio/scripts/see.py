"""Eyes: turn a video into one contact sheet so Claude can look at it.

python see.py input.mp4 [--every 1.0] [--out sheet.jpg]
Takes one frame every N seconds (max 60), stamps the time on each, and tiles them 10 per row.
"""
import argparse
import json
import subprocess
import sys


def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", path],
                         capture_output=True, text=True, check=True).stdout
    return float(json.loads(out)["format"]["duration"])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--every", type=float, default=1.0, help="seconds between frames")
    ap.add_argument("--out", default="sheet.jpg")
    a = ap.parse_args()
    dur = duration(a.video)
    step = max(a.every, dur / 60)  # never more than 60 frames
    n = int(dur // step) + 1
    rows = (n + 9) // 10
    vf = (f"fps=1/{step},scale=270:-2,"
          "drawtext=text='%{pts\\:hms}':x=6:y=6:fontsize=18:fontcolor=white:box=1:boxcolor=black@0.6,"
          f"tile=10x{rows}:padding=4:color=white")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.video, "-vf", vf, "-frames:v", "1", a.out], check=True)
    print(f"{a.out}: {n} frames, one every {step:.2f}s, video {dur:.1f}s")


if __name__ == "__main__":
    sys.exit(main())
