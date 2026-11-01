"""Ears: transcribe speech with a time for every word, and find the silences.

python hear.py voice.m4a [--lang ar] [--model small] [--out words.json]
Writes words.json: {"duration": s, "words": [{"w","start","end"}], "silences": [[start, end], ...]}
and prints the text with times so Claude can compare it with the script.
Needs: ffmpeg, and  pip install faster-whisper
"""
import argparse
import json
import re
import subprocess


def silences(path, noise="-35dB", min_len=0.3):
    err = subprocess.run(["ffmpeg", "-i", path, "-af", f"silencedetect=noise={noise}:d={min_len}", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", err)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]
    dur = re.search(r"Duration: (\d+):(\d+):([\d.]+)", err)
    total = int(dur.group(1)) * 3600 + int(dur.group(2)) * 60 + float(dur.group(3)) if dur else None
    return total, [[round(s, 3), round(e, 3)] for s, e in zip(starts, ends)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio")
    ap.add_argument("--lang", default="ar")
    ap.add_argument("--model", default="small", help="tiny / base / small / medium (bigger = slower, better)")
    ap.add_argument("--out", default="words.json")
    a = ap.parse_args()
    import numpy as np
    from faster_whisper import WhisperModel
    # Decode with ffmpeg ourselves: faster-whisper's own decoder breaks on some PyAV versions.
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", a.audio, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    model = WhisperModel(a.model, device="cpu", compute_type="int8")
    segs, _ = model.transcribe(np.frombuffer(pcm, dtype=np.float32), language=a.lang,
                               word_timestamps=True, vad_filter=True)
    words = []
    for seg in segs:
        for w in seg.words:
            words.append({"w": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)})
        print(f"[{seg.start:6.2f}] {seg.text.strip()}")
    total, sil = silences(a.audio)
    json.dump({"duration": total, "words": words, "silences": sil}, open(a.out, "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print(f"{a.out}: {len(words)} words, {len(sil)} silences")


if __name__ == "__main__":
    main()
