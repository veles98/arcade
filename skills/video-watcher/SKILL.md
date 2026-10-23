---
name: video-watcher
description: Watch any public reference video (Instagram reel, YouTube/Shorts, TikTok) by URL — downloads it, makes a frame contact sheet and a timed transcript, reads views/likes/comments — so Claude can study a creator's structure, hooks, CTAs and edit style. Use when you send a link or say "شوف هذا الفيديو".
---
# Video watcher
Needs: `pip install yt-dlp faster-whisper numpy` and ffmpeg on PATH (or set `FFMPEG` to its full path).
Run: `python ~/.claude/skills/video-watcher/watch.py "<url>" <short_name>` (add `--keep` to keep the mp4).
Output: `watched/<short_name>/` next to the script -> `sheet.jpg` (24 frames across the video), `transcript.txt` (timed, faster-whisper small), `info.txt` (title, uploader, duration, views, likes, comments, date, caption).
Then read sheet.jpg + transcript.txt and write the breakdown into `IDEAS_FROM_REFS_<date>.md`: hook (0–2 s), structure with seconds, rehook, CTA keyword, why it spreads (sends/saves/comments ratios), and "our version".
Rules: public posts only; never log in for it; if a post needs login, ask for a screenshot instead (a cookies file only if you provide one yourself via the WATCH_COOKIES env var). Videos are references — never re-upload or reuse their footage. The script deletes the mp4 by default to save disk.
