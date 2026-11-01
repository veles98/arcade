"""Hands 1: cut the long pauses out of a voice or talking video, then level the sound.

python cut.py input.(m4a|mp4) words.json [--keep 0.30] [--out cut.mp4]
Every silence longer than --keep seconds is shortened to --keep (not removed, so speech stays natural).
Each cut gets a 30 ms fade so there are no clicks. Output is levelled to -14 LUFS, peak -1.5 dB.
"""
import argparse
import json
import subprocess


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("media")
    ap.add_argument("words")
    ap.add_argument("--keep", type=float, default=0.30)
    ap.add_argument("--out", default=None)
    a = ap.parse_args()
    data = json.load(open(a.words, encoding="utf-8"))
    total = data["duration"]
    has_video = bool(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "stream=index",
                                     "-of", "csv=p=0", a.media], capture_output=True, text=True).stdout.strip())
    out = a.out or ("cut.mp4" if has_video else "cut.wav")
    # spans to keep: everything except the middle of each long silence
    keep, pos, half = [], 0.0, a.keep / 2
    for s, e in data["silences"]:
        if e - s > a.keep:
            keep.append((pos, s + half))
            pos = e - half
    keep.append((pos, total))
    parts, fa = [], 0.03
    for i, (s, e) in enumerate(keep):
        d = e - s
        parts.append(f"[0:a]atrim={s:.3f}:{e:.3f},asetpts=PTS-STARTPTS,afade=t=in:d={fa},afade=t=out:st={max(d - fa, 0):.3f}:d={fa}[a{i}];")
        if has_video:
            parts.append(f"[0:v]trim={s:.3f}:{e:.3f},setpts=PTS-STARTPTS[v{i}];")
    n = len(keep)
    if has_video:
        chain = "".join(f"[v{i}][a{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=1[v][ac];"
    else:
        chain = "".join(f"[a{i}]" for i in range(n)) + f"concat=n={n}:v=0:a=1[ac];"
    fg = "".join(parts) + chain + "[ac]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]"
    cmd = ["ffmpeg", "-v", "error", "-y", "-i", a.media, "-filter_complex", fg, "-map", "[a]"]
    if has_video:
        cmd += ["-map", "[v]", "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k"]
    subprocess.run(cmd + [out], check=True)
    new = sum(e - s for s, e in keep)
    print(f"{out}: {total:.1f}s -> {new:.1f}s ({len(keep) - 1} pauses shortened). Run hear.py on it again for new word times.")


if __name__ == "__main__":
    main()
